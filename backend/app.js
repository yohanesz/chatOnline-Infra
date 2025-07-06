const createError = require('http-errors');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const { createClient } = require('redis');
const { RedisStore } = require('connect-redis');
const mongo = require('./db.js');

const authRoutes = require('./routes/auth.routes');
const messagesRoutes = require('./routes/messages.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Map para usuários online: userId -> Set(socket.id)
const onlineUsers = new Map();

// Redis
const redisClient = createClient({
  socket: {
    host: 'redis',
    port: 6379
  }
});

redisClient.connect().catch(console.error);

const store = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});

// Middleware de sessão
const sessionMiddleware = session({
  store: store,
  secret: 'seuSegredoSuperSecreto',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60,
  },
});

// Express Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', messagesRoutes(io, onlineUsers));

// Tratamento de erro 404
app.use((req, res, next) => {
  next(createError(404));
});

// Tratamento de erro geral
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// --- Integra a sessão com Socket.IO ---
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// WebSocket
io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);

  const session = socket.request.session;
  const user = session && session.user;
  const userId = user ? user.id : null;

  if (userId) {
    socket.userId = userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    console.log(`Usuário ${userId} conectado. Sockets ativos: ${[...onlineUsers.get(userId)].join(', ')}`);
    io.emit('user_online', userId);
  }

  socket.on('chat message', async (msg) => {
    const { toUserId, text, fromUserId } = msg;

    try {
      const conversation = await mongo.getOrCreateConversation(fromUserId, toUserId);
      const message = await mongo.addMessage(conversation._id, fromUserId, text);

      const messageData = {
        fromUserId,
        toUserId,
        text,
        timestamp: message.timestamp
      };

      // Enviar para remetente
      if (onlineUsers.has(fromUserId)) {
        onlineUsers.get(fromUserId).forEach(socketId => {
          io.to(socketId).emit('chat message', messageData);
        });
      }

      // Enviar para destinatário
      if (onlineUsers.has(toUserId)) {
        onlineUsers.get(toUserId).forEach(socketId => {
          io.to(socketId).emit('chat message', messageData);
        });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });

  socket.on('disconnect', () => {
    const userId = socket.userId;

    if (userId && onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);
      console.log(`Socket ${socket.id} desconectado do usuário ${userId}.`);

      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
        io.emit('user_offline', userId);
        console.log(`Usuário ${userId} está totalmente offline.`);
      }
    }
  });
});

// Inicia o servidor
server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

module.exports = app;
