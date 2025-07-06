module.exports = (io, onlineUsers) => {
  const mongo = require('../db.js');
  const conn = require('../mysql.js');

  const controller = {};

  controller.getContacts = async (req, res) => {
    try {
      const user = req.session.user;
      const contacts = await conn.showContacts(user.id);
      const contactsWithStatus = contacts.map(contact => ({
        ...contact,
        isOnline: onlineUsers.has(contact.id)
      }));
      res.json(contactsWithStatus);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      res.status(500).json({ error: 'Erro ao buscar contatos' });
    }
  };

  controller.sendMessage = async (req, res) => {
    const { toUserId, text } = req.body;
    const fromUserId = req.session.user.id;

    try {
      const conversation = await mongo.getOrCreateConversation(fromUserId, toUserId);
      const message = await mongo.addMessage(conversation._id, fromUserId, text);

      const messageData = { fromUserId, toUserId, text, timestamp: message.timestamp };

      // Emitir a mensagem para o remetente
      if (onlineUsers.has(fromUserId)) {
        onlineUsers.get(fromUserId).forEach(socketId => {
          io.to(socketId).emit('chat message', messageData);
        });
      }

      // Emitir a mensagem para o destinatário
      if (onlineUsers.has(toUserId)) {
        onlineUsers.get(toUserId).forEach(socketId => {
          io.to(socketId).emit('chat message', messageData);
        });
      }

      console.log('enviada');
      res.status(200).json({ message: 'Mensagem enviada' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  controller.getMessages = async (req, res) => {
    try {
      const fromUserId = req.session.user.id;
      const toUserId = parseInt(req.params.toUserId);

      const conversation = await mongo.getOrCreateConversation(fromUserId, toUserId);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversa não encontrada' });
      }

      const messages = await mongo.getMessages(conversation._id);
      res.json(messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  return controller;
};
