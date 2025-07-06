let selectedContactId = null;
let userData = null;
const socket = io(); // Conecta ao Socket.IO

async function initializeChat() {
  const { isAuthenticated, user } = await checkAuth();

  if (isAuthenticated) {
    userData = user;
    window.userId = userData.id;
    document.getElementById('userLogged').innerText = userData.nome;
    loadContacts();
    setupEventListeners();

    // Listener para novas mensagens via WebSocket
    socket.on('chat message', (msg) => {
      console.log('Received chat message:', msg);
      console.log('Current window.userId:', window.userId);
      console.log('Current selectedContactId:', selectedContactId);

      // Verifica se a mensagem é para a conversa atual
      if ((msg.fromUserId === window.userId && msg.toUserId === selectedContactId) ||
          (msg.fromUserId === selectedContactId && msg.toUserId === window.userId)) {
        console.log('Appending message to current chat.');
        appendMessage(msg);
      } else {
        console.log('Message not for current chat or condition not met.');
      }
    });

  } else {
    window.location.href = '/login.html';
  }
}

async function loadContacts() {
  try {
    const res = await fetch('api/contacts', {
      credentials: 'include'
    });

    const data = await res.json();

    const contactsList = document.getElementById('contact-list');
    contactsList.innerHTML = '';

    data.forEach(contact => {
      const li = document.createElement('li');
      li.id = `contact-${contact.id}`;
      li.classList.add('p-2', 'rounded', 'hover:bg-gray-900', 'cursor-pointer', 'text-gray-300', 'flex', 'items-center');
      
      const statusIndicator = document.createElement('span');
      statusIndicator.classList.add('w-3', 'h-3', 'rounded-full', 'mr-2');
      statusIndicator.classList.add(contact.isOnline ? 'bg-green-500' : 'bg-gray-500');
      li.appendChild(statusIndicator);

      const contactName = document.createElement('span');
      contactName.textContent = contact.nome;
      li.appendChild(contactName);

      li.addEventListener('click', () => {
        selectedContactId = contact.id;
        document.getElementById('contactName').textContent = contact.nome;
        loadMessages(contact.id);
      });

      contactsList.appendChild(li);
    });

  } catch (error) {
    console.error('Erro ao carregar contatos:', error);
  }
}

// Função para atualizar o status online de um contato
function updateContactStatus(userId, isOnline) {
  const contactElement = document.getElementById(`contact-${userId}`);
  if (contactElement) {
    const statusIndicator = contactElement.querySelector('span');
    if (statusIndicator) {
      statusIndicator.classList.remove(isOnline ? 'bg-gray-500' : 'bg-green-500');
      statusIndicator.classList.add(isOnline ? 'bg-green-500' : 'bg-gray-500');
    }
  }
}

async function loadMessages(toUserId) {
  try {
    const res = await fetch(`api/messages/${toUserId}`, {
      credentials: 'include'
    });

    const messages = await res.json();

    const chat = document.getElementById('messages');
    chat.innerHTML = '';

    if (messages.length === 0) {
      chat.innerHTML = '<p class="text-gray-400">Nenhuma mensagem nesta conversa ainda.</p>';
      return;
    }

    messages.forEach(msg => {
      appendMessage(msg);
    });

    chat.scrollTop = chat.scrollHeight;

  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
  }
}

function appendMessage(msg) {
  const chat = document.getElementById('messages');
  const div = document.createElement('div');
  const messageSenderId = msg.fromUserId || msg.senderId;
  const isMe = messageSenderId === window.userId;

  div.classList.add(
    'w-fit',
    'rounded-[20px]',
    'px-[18px]',
    'py-[4px]',
    'font-bold',
    'mt-2'
  );

  if (isMe) {
    div.classList.add('bg-green-400', 'text-white', 'self-end');
  } else {
    div.classList.add('bg-gray-500', 'text-white');
  }

  div.innerHTML = `<p>${msg.text}</p>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(text) {
  if (!selectedContactId) {
    alert('Selecione um contato antes de enviar mensagem.');
    return;
  }

  // Envia a mensagem via WebSocket
  socket.emit('chat message', {
    toUserId: selectedContactId,
    text: text,
    fromUserId: window.userId // Adiciona o remetente para identificação
  });

  console.log(text);

  // A mensagem será adicionada à UI via o listener do socket.on
  // Não precisamos mais do fetch HTTP POST aqui
}

function setupEventListeners() {
  const sendButton = document.getElementById('sendButton');
  const logoutButton = document.getElementById('logoutButton')
  const chatInput = document.getElementById('chatInput');

  sendButton.addEventListener('click', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
      sendMessage(text);
      chatInput.value = '';
    }
  });

  chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendButton.click();
    }
  });

  logoutButton.addEventListener('click', () => {
    logout();
  });

}

async function logout() {
  
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });

  console.log(response.message);

  window.location.href = '/login.html';
}

// Inicia
window.addEventListener('DOMContentLoaded', async () => {
  await initializeChat();

  // Listeners para status online/offline
  socket.on('user_online', (userId) => {
    updateContactStatus(userId, true);
  });

  socket.on('user_offline', (userId) => {
    updateContactStatus(userId, false);
  });
});
