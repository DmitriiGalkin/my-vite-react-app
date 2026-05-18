// controllers/chatController.js
// 'use strict';

const Chat = require('../models/chat');
const ChatMessage = require('../models/chatMessage');
const {
  normalizeMessage,
  getOrCreateChat,
  createAssistantMessage,
} = require('../services/chatService');
const { generateAssistantAnswer } = require('../services/assistantService');
const {
  isCreateProjectIdeaCommand,
  findLastProjectIdea,
  createProjectFromIdea,
} = require('../services/projectIdeaService');
const { generateProjectImage } = require('../services/imageGenerationService');

exports.createMessage = async function (req, res) {
  try {
    // Проверка авторизации
    if (!req.passport) {
      return res.status(401).json({
        error: true,
        message: 'Требуется авторизация',
      });
    }

    const message = String(req.body.message || '').trim();
    const chatId = req.body.chatId || null;
    const source = req.body.source === 'voice' ? 'voice' : 'text';

    // Валидация сообщения
    if (!message) {
      return res.status(400).json({
        error: true,
        message: 'Сообщение не может быть пустым',
      });
    }

    // 1. Получаем или создаем чат
    const chat = await getOrCreateChat({
      chatId,
      passportId: req.passport.id,
      firstMessage: message,
    });

    // 2. Сохраняем сообщение пользователя
    const userMessageId = await ChatMessage.create({
      chatId: chat.id,
      passportId: req.passport.id,
      content: message,
      source,
      role: 'user',
    });

    // Находим пользователя, который отправил сообщение (для логики сервиса)
    const userMessage = await ChatMessage.findById(userMessageId);

    // 3. Проверка на команду создания проекта
    if (isCreateProjectIdeaCommand(message)) {
      const recentMessages = await ChatMessage.findLastByChatId(chat.id, 10);
      const idea = findLastProjectIdea(recentMessages);

      if (!idea) {
        // Если идеи нет, отвечаем ассистентом
        const assistantMessage = await createAssistantMessage({
          chatId: chat.id,
          content: 'Не нашёл готовую идею проекта в переписке. Давайте сначала сформулируем её.',
        });
        await Chat.touch(chat.id);
        return res.json({
          chatId: chat.id,
          messages: [normalizeMessage(userMessage), normalizeMessage(assistantMessage)],
        });
      }

      // Если идея есть, создаем проект
      const createdProjectId = await createProjectFromIdea({
        idea,
        passportId: req.passport.id,
      });

      const assistantMessage = await createAssistantMessage({
        chatId: chat.id,
        content: 'Идея проекта создана. Теперь её можно открыть и отредактировать.',
        metadata: {
          ...idea,
          id: createdProjectId,
          passportId: req.passport.id,
        },
      });

      await Chat.touch(chat.id);

      return res.json({
        chatId: chat.id,
        messages: [normalizeMessage(userMessage), normalizeMessage(assistantMessage)],
      });
    }

    // 4. Генерация ответа ассистента (если это не команда)
    const recentMessages = await ChatMessage.findLastByChatId(chat.id, 10);
    const assistantContent = await generateAssistantAnswer({
      messages: recentMessages,
      chat,
      passport: req.passport,
    });

    let image = null;
    if (assistantContent.status === 'idea_ready') {
      try {
        image = await generateProjectImage(assistantContent.idea);
      } catch (err) {
        console.error('Ошибка генерации изображения:', err);
        // Не прерываем выполнение, если не удалось создать картинку
      }
    }

    // Сохраняем ответ ассистента в БД
    const assistantMessage = await createAssistantMessage({
      chatId: chat.id,
      content: assistantContent.message,
      metadata: image || (assistantContent.status === 'idea_ready' ? assistantContent.idea : null),
    });

    // Обновляем время последнего изменения чата
    await Chat.touch(chat.id);

    // Отправляем ответ клиенту (берем из БД, чтобы быть уверенными в данных)
    const freshUserMessage = await ChatMessage.findById(userMessageId);

    res.json({
      chatId: chat.id,
      messages: [normalizeMessage(freshUserMessage), normalizeMessage(assistantMessage)],
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
    console.log('chat.findMessages');
    if (!req.passport) {
      return res.status(401).json({ error: true, message: 'Требуется авторизация' });
    }

    // Проверяем, принадлежит ли чат пользователю (безопасность)
    const chat = await Chat.findByIdAndPassportId(req.params.id, req.passport.id);

    if (!chat) {
      return res.status(404).json({ error: true, message: 'Чат не найден или у вас нет доступа' });
    }

    const messages = await ChatMessage.findByChatId(chat.id);

    res.json(messages.map(normalizeMessage));
  } catch (err) {
    console.error('chat.findMessages error:', err);
    res.status(500).json({ error: true, message: 'Не удалось получить сообщения' });
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
