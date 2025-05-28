var express = require('express');
var router = express.Router();
const mongo = require('../db.js');
const conn = require('../mysql.js');

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return res.status(401).json({ error: 'Não autenticado' });
  }
}


router.get('/api/user-info', isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

router.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({ message: 'Logout realizado' });
});

router.post('/api/login', async (req, res) => {
  const { nome } = req.body;

  try {
    const db = await conn.connect();
    const [verify] = await db.query(`SELECT * FROM user WHERE nome = ?`, [nome]);

    if (verify.length > 0) {
      req.session.user = verify[0];
      res.status(200).json({ message: 'Login bem-sucedido', redirect: '/index.html' });
    } else {
      await conn.insertUser(nome);
      const [newUser] = await db.query(`SELECT * FROM user WHERE nome = ?`, [nome]);
      req.session.user = newUser[0];
      res.status(201).json({ message: 'Usuário criado com sucesso', redirect: '/index.html' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/api/contacts', isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const contacts = await conn.showContacts(user.id);
    res.json(contacts);
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ error: 'Erro ao buscar contatos' });
  }
});

router.post('/api/send-message', isAuthenticated, async (req, res) => {
  const { toUserId, text } = req.body;
  const fromUserId = req.session.user.id;

  try {
    const conversation = await mongo.getOrCreateConversation(fromUserId, toUserId);
    await mongo.addMessage(conversation._id, fromUserId, text);
    res.status(200).json({ message: 'Mensagem enviada' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/api/messages/:toUserId', isAuthenticated, async (req, res) => {
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
});

module.exports = router;
