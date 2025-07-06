module.exports = (io, onlineUsers) => {
  const express = require('express');
  const router = express.Router();
  const messagesController = require('../controllers/messages.controller')(io, onlineUsers);

  // Middleware de autenticação
  function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      return res.status(401).json({ error: 'Não autenticado' });
    }
  }

  // Aplicar o middleware a todas as rotas deste arquivo
  router.use(isAuthenticated);

  // Rotas de Mensagens e Contatos
  router.get('/contacts', messagesController.getContacts);
  router.post('/send-message', messagesController.sendMessage);
  router.get('/messages/:toUserId', messagesController.getMessages);

  return router;
};
