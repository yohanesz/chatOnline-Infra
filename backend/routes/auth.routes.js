const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Middleware de autenticação
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return res.status(401).json({ error: 'Não autenticado' });
  }
}

// Rotas de Autenticação
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/user-info', isAuthenticated, authController.getUserInfo);

module.exports = router;
