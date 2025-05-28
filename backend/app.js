var createError = require('http-errors');
var express = require('express');
const http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const session = require('express-session');
const {createClient} = require('redis');
const {RedisStore} = require("connect-redis");

const app = express();

let redisClient = createClient({
  socket: {
    host: 'redis',
    port: 6379
  }
});

redisClient.connect().catch(console.error)

// const edisStore = connectRedis(session);

const store = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});

app.use(session({
  store: store,
  secret: 'seuSegredoSuperSecreto',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Defina como true em produção com HTTPS
    maxAge: 1000 * 60 * 60, // 1 hora
  },
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});




module.exports = app;
