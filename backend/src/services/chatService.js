'use strict';

const Chat = require('../models/chat');
const ChatMessage = require('../models/chatMessage');
const callModel = require('../utils/callModel');

function normalizeMessage(row) {
  return {
    id: row.id,
    chatId: row.chatId,
    passportId: row.passportId,
    role: row.role,
    content: row.content,
    source: row.source,
    metadata: row.metadata,
    createdAt: row.createdAt,
  };
}

async function getOrCreateChat({ chatId, passportId, firstMessage }) {
  if (chatId) {
    const existingChat = await callModel(Chat.findByIdAndPassportId, chatId, passportId);

    if (!existingChat) {
      const error = new Error('Чат не найден');
      error.status = 404;
      throw error;
    }

    return existingChat;
  }

  // const activeChat = await callModel(Chat.findActiveByPassportId, passportId);
  //
  // if (activeChat) {
  //   return activeChat;
  // }

  const title = firstMessage.length > 80 ? `${firstMessage.slice(0, 80)}...` : firstMessage;

  const createdChatId = await callModel(Chat.create, {
    passportId,
    title,
  });

  return {
    id: createdChatId,
    passportId,
    title,
  };
}

async function createAssistantMessage({ chatId, content, metadata = null }) {
  const assistantMessageId = await callModel(ChatMessage.create, {
    chatId,
    passportId: null,
    role: 'assistant',
    content,
    metadata,
    source: 'text',
  });

  return callModel(ChatMessage.findById, assistantMessageId);
}

// async function createUserMessage({ chatId, passportId, content, source }) {
//   const userMessageId = await callModel(ChatMessage.create, {
//     chatId,
//     passportId,
//     role: 'user',
//     content,
//     source,
//   });
//
//   return userMessageId;
// }

module.exports = {
  normalizeMessage,
  getOrCreateChat,
  createAssistantMessage,
};
