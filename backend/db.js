require("dotenv").config();
const { MongoClient } = require('mongodb');

let singleton;


async function connect() {
    if (singleton) {
        return singleton;
    }

    const client = new MongoClient(process.env.MONGODB_HOST, {
        auth: {
            username: process.env.MONGODB_USERNAME,
            password: process.env.MONGODB_PASSWORD
        }
    });

    await client.connect();
    singleton = client.db(process.env.MONGODB_DATABASE);
    return singleton;
}


async function getMessages(conversationId) {
  const conn = await connect();

  const messages = await conn
    .collection('messages')
    .find({ conversationId: conversationId })
    .sort({ timestamp: 1 })
    .toArray();

  return messages || [];
}


async function getOrCreateConversation(userId1, userId2) {
    const conn = await connect();

    const conversation = await conn
        .collection('conversations')
        .findOne({ participants: { $all: [userId1, userId2] } });

    if (conversation) {
        return conversation;
    }

    const result = await conn.collection('conversations').insertOne({
        participants: [userId1, userId2],
        createdAt: new Date(),
    });

    return await conn.collection('conversations').findOne({ _id: result.insertedId });
}


async function addMessage(conversationId, senderId, text) {
    const conn = await connect();

    const message = {
        conversationId,
        senderId,
        text,
        timestamp: new Date(),
    };

    const result = await conn.collection('messages').insertOne(message);
    return result;
}

module.exports = {
    connect,
    getMessages,
    getOrCreateConversation,
    addMessage
};
