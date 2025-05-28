let selectedContactId = null;
let userData = null;
let pollingInterval;

async function checkAuth() {
  try {
    const res = await fetch('api/user-info', {
      credentials: 'include'
    });

    if (res.ok) {
      userData = await res.json();
      window.userId = userData.id;
      document.getElementById('userLogged').innerText = userData.nome;
      loadContacts();
    } else {
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
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
      li.classList.add('p-2', 'rounded', 'hover:bg-gray-900', 'cursor-pointer', 'text-gray-300');
      li.textContent = contact.nome;

      li.addEventListener('click', () => {
        selectedContactId = contact.id;
        document.getElementById('contactName').textContent = contact.nome;
        loadMessages(contact.id);
        startPolling();
      });

      contactsList.appendChild(li);
    });

  } catch (error) {
    console.error('Erro ao carregar contatos:', error);
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
      const div = document.createElement('div');
      const isMe = msg.senderId === window.userId;

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
    });

    chat.scrollTop = chat.scrollHeight;

  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
  }
}

async function sendMessage(text) {
  if (!selectedContactId) {
    alert('Selecione um contato antes de enviar mensagem.');
    return;
  }

  try {
    const res = await fetch('api/send-message', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({
        toUserId: selectedContactId,
        text: text
      })
    });

    if (res.ok) {
      loadMessages(selectedContactId);
    } else {
      alert('Erro ao enviar mensagem');
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

function setupEventListeners() {
  const sendButton = document.getElementById('sendButton');
  const chatInput = document.getElementById('chatInput');

  sendButton.addEventListener('click', () => {
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
}

function startPolling() {
  stopPolling();
  pollingInterval = setInterval(() => {
    if (selectedContactId) {
      loadMessages(selectedContactId);
      loadContacts();
    }
  }, 3000);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

async function logout() {
  await fetch('api/logout', {
    method: 'POST',
    credentials: 'include'
  });
  window.location.href = '/login.html';
}

// Inicia
window.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  setupEventListeners();
});
