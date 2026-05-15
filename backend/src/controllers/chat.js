'use strict';
const Chat = require('../models/chat');
const ChatMessage = require('../models/chatMessage');

function callModel(method, ...args) {
  return new Promise((resolve, reject) => {
    method(...args, function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
}

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

  const activeChat = await callModel(Chat.findActiveByPassportId, passportId);

  if (activeChat) {
    return activeChat;
  }

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

async function generateAssistantAnswer({ message }) {
  return [
    'Спасибо! Я получил ваше сообщение.',
    'Расскажите, пожалуйста, возраст ребенка, его интересы и какой формат проекта вам ближе: кружок, мастер-класс или долгий проект?',
  ].join(' ');
}

exports.createMessage = async function (req, res) {
  try {
    if (!req.passport) {
      return res.status(401).json({
        error: true,
        message: 'Требуется авторизация',
      });
    }

    const message = String(req.body.message || '').trim();
    const chatId = req.body.chatId || null;
    const source = req.body.source === 'voice' ? 'voice' : 'text';

    if (!message) {
      return res.status(400).json({
        error: true,
        message: 'Сообщение не может быть пустым',
      });
    }

    const chat = await getOrCreateChat({
      chatId,
      passportId: req.passport.id,
      firstMessage: message,
    });

    const userMessageId = await callModel(ChatMessage.create, {
      chatId: chat.id,
      passportId: req.passport.id,
      role: 'user',
      content: message,
      source,
    });

    const assistantContent = await generateAssistantAnswer({
      message,
      chat,
      passport: req.passport,
    });

    const assistantMessageId = await callModel(ChatMessage.create, {
      chatId: chat.id,
      passportId: null,
      role: 'assistant',
      content: assistantContent,
      source: 'text',
    });

    await callModel(Chat.touch, chat.id);

    const [userMessage, assistantMessage] = await Promise.all([
      callModel(ChatMessage.findById, userMessageId),
      callModel(ChatMessage.findById, assistantMessageId),
    ]);

    res.json({
      chatId: chat.id,
      messages: [normalizeMessage(userMessage), normalizeMessage(assistantMessage)],
    });
  } catch (err) {
    console.error('chat.createMessage error:', err);

    res.status(err.status || 500).json({
      error: true,
      message: err.message || 'Не удалось отправить сообщение',
    });
  }
};

exports.findMessages = async function (req, res) {
  try {
    if (!req.passport) {
      return res.status(401).json({
        error: true,
        message: 'Требуется авторизация',
      });
    }

    const chat = await callModel(Chat.findByIdAndPassportId, req.params.id, req.passport.id);

    if (!chat) {
      return res.status(404).json({
        error: true,
        message: 'Чат не найден',
      });
    }

    const messages = await callModel(ChatMessage.findByChatId, chat.id);

    res.json(messages.map(normalizeMessage));
  } catch (err) {
    console.error('chat.findMessages error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось получить сообщения',
    });
  }
};

exports.findAll = async function (req, res) {
  try {
    if (!req.passport) {
      return res.status(401).json({
        error: true,
        message: 'Требуется авторизация',
      });
    }

    const chats = await callModel(Chat.findAllByPassportId, req.passport.id);

    res.json(chats);
  } catch (err) {
    console.error('chat.findAll error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось получить список чатов',
    });
  }
};
