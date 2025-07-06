require('dotenv').config();
const bcrypt = require('bcrypt');

async function connect() {

    if(global.connection && global.connection != "disconnected") {
        return global.connection;
    }
    
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });

    global.connection = connection;
    console.log("conectado ao mysql");
    return connection;
    
}

async function showContacts(id) {
    const conn = await connect();
    const [rows] = await conn.query(`SELECT * FROM user WHERE id != ${id};`);
    return rows;
}

async function insertUser(nome, senha, email) {
  const conn = await connect();

  try {
    const [existing] = await conn.query('SELECT id FROM user WHERE email = ?', [email]);

    if (existing.length > 0) {
      // Retorne uma flag ou lance um erro para o controller tratar
      throw new Error('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const sql = 'INSERT INTO user (nome, senha, email) VALUES (?, ?, ?)';
    await conn.query(sql, [nome, hashedPassword, email]);

    const [result] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);

    console.log(`Usuário inserido: ${nome}`);
    return result[0];
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    throw error;
  }
}

module.exports = {
    showContacts,
    connect,
    insertUser
}