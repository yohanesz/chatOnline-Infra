drop database chat;

CREATE DATABASE chat;

USE chat;

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    senha VARCHAR(255),
    email VARCHAR(255)
);
