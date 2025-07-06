const conn = require('../mysql.js');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !senha || !email) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  try {
    const user = await conn.insertUser(nome, senha, email);

    req.session.user = {
      id: user.id,
      nome: user.nome,
      email: user.email
    };

    return res.status(201).json({ 'message': 'Usuário cadastrado com sucesso', redirect: '/index.html' });

  } catch (error) {
    console.error('Erro no registro:', error);
    if (error.message === 'E-mail já cadastrado') {
        return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    return res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const db = await conn.connect();
    const [userRows] = await db.query(`SELECT * FROM user WHERE email = ?`, [email]);

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = userRows[0];
    const passwordDB = user.senha;
    const verifyPassword = await bcrypt.compare(senha, passwordDB);

    if (verifyPassword) {
      req.session.user = {
        id: user.id,
        nome: user.nome,
        email: user.email,
      };
      return res.status(200).json({ message: 'Login bem-sucedido', redirect: '/index.html' });
    } else {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao deslogar:', err);
      return res.status(500).json({ error: 'Erro ao encerrar sessão' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logout realizado com sucesso' });
  });
};

exports.getUserInfo = (req, res) => {
  res.json(req.session.user);
};
