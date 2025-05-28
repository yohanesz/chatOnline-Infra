# 💬 Sistema de Chat com Node.js, MySQL, MongoDB, Redis e NGINX

## 📄 Descrição

Este projeto é um sistema de chat em tempo real, ideal para ser utilizado como **chat de atendimento online**, conectando **atendentes** e **clientes**.  

As mensagens são armazenadas em um banco **NoSQL (MongoDB)** para maior eficiência, enquanto informações de usuários e contatos são mantidas em um banco relacional **MySQL**. O sistema utiliza **Redis** para gerenciar sessões e cache, além de contar com um **proxy reverso (NGINX)** que faz o roteamento das requisições, oferecendo segurança, organização e escalabilidade.

---

## 🏗️ Arquitetura dos Containers

- **Frontend (NGINX)**  
  → Serve os arquivos estáticos (HTML, CSS, JS) e faz proxy das rotas `/api` para o backend.

- **Backend (Node.js + Express)**  
  → API REST responsável por autenticação, gerenciamento de usuários, contatos e mensagens.

- **MySQL**  
  → Armazena dados dos usuários e informações relacionadas a contatos.

- **MongoDB**  
  → Responsável pelo armazenamento das conversas e mensagens.

- **Redis**  
  → Gerenciamento de sessões e cache.

---

## 🚀 Tecnologias Utilizadas

- Node.js (Express)
- MySQL
- MongoDB
- Redis
- NGINX
- Docker e Docker Compose

---

## 🗺️ Rotas da API

| Método | Endpoint            | Descrição                        |
|--------|---------------------|-----------------------------------|
| POST   | `/api/login`        | Login ou criação de usuário      |
| GET    | `/api/user-info`    | Dados do usuário logado          |
| POST   | `/api/logout`       | Logout do usuário                |
| GET    | `/api/contacts`     | Lista de contatos                |
| POST   | `/api/send-message` | Enviar mensagem                  |
| GET    | `/api/messages/:id` | Buscar mensagens com um contato  |

---

## ⚙️ Como executar o projeto

### 🔥 Pré-requisitos

- Docker
- Docker Compose

### 🏃‍♂️ Rodando o projeto

1. Clone este repositório:
```bash
git clone git@github.com:yohanesz/chatOnline-Infra.git
cd chatOnline-Infra
````

2. Crie o arquivo .env com as configurações abaixo:
```bash
# MongoDB
MONGODB_HOST=mongodb://mongo:27017
MONGODB_DATABASE=conversation
MONGODB_USERNAME=root
MONGODB_PASSWORD=1234

# MySQL
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=chat
MYSQL_USER=root
MYSQL_PASSWORD=1234
````

3. Suba os containers:
````bash
docker-compose up --build
````
4. Acesse no navegador:

Frontend: http://localhost

### 🌐 Acesso externo
Para acessar de outro dispositivo, é necessário liberar as portas 80 (Frontend) e/ou 3000 (Backend, se desejar acesso direto) no seu roteador e firewall.


