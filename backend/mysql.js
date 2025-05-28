require('dotenv').config();

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

async function insertUser(nome) {
    const conn = await connect();
    const sql = `INSERT INTO user (nome) VALUES (?)`;

    try {
        await conn.query(sql, [nome]);
        console.log(`Usuário inserido: ${nome}`);
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