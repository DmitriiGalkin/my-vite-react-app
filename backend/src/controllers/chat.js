'use strict';

const Chat = require('../models/chat');
const ChatMessage = require('../models/chatMessage');
const callModel = require('../utils/callModel');
const {
  normalizeMessage,
  getOrCreateChat,
  createAssistantMessage,
  createUserMessage,
} = require('../services/chatService');
const { generateAssistantAnswer } = require('../services/assistantService');
const {
  isCreateProjectIdeaCommand,
  findLastProjectIdea,
  createProjectFromIdea,
} = require('../services/projectIdeaService');
const Project = require('../models/project');
const { generateProjectImage } = require('../services/imageGenerationService');

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
    console.log(chatId, 'chatId START');
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

    const userMessageId = await createUserMessage({
      chatId: chat.id,
      passportId: req.passport.id,
      content: message,
      source,
    });

    const recentMessages = await callModel(ChatMessage.findLastByChatId, chat.id, 10);

    if (isCreateProjectIdeaCommand(message)) {
      const idea = findLastProjectIdea(recentMessages);

      if (!idea) {
        const [userMessage, assistantMessage] = await Promise.all([
          callModel(ChatMessage.findById, userMessageId),
          createAssistantMessage({
            chatId: chat.id,
            content: 'Не нашёл готовую идею проекта в переписке. Давайте сначала сформулируем её.',
          }),
        ]);

        await callModel(Chat.touch, chat.id);

        return res.json({
          chatId: chat.id,
          messages: [normalizeMessage(userMessage), normalizeMessage(assistantMessage)],
        });
      }

      const createdProjectId = await createProjectFromIdea({
        idea,
        passportId: req.passport.id,
      });

      const [userMessage, assistantMessage] = await Promise.all([
        callModel(ChatMessage.findById, userMessageId),
        createAssistantMessage({
          chatId: chat.id,
          content: 'Идея проекта создана. Теперь её можно открыть и отредактировать.',
          metadata: {
            ...idea,
            id: createdProjectId,
            passportId: req.passport.id,
          },
        }),
      ]);

      await callModel(Chat.touch, chat.id);

      return res.json({
        chatId: chat.id,
        messages: [normalizeMessage(userMessage), normalizeMessage(assistantMessage)],
      });
    }

    const assistantContent = await generateAssistantAnswer({
      messages: recentMessages,
      chat,
      passport: req.passport,
    });


    let image = null;


    // try {
    //   image =
    //     assistantContent.status === 'idea_ready'
    //       ? await generateProjectImage(assistantContent.idea)
    //       : null;
    // } catch (err) {
    //   console.error('generateProjectImage error:', err);
    // }

    console.log(image,'image')

    const assistantMessage = await createAssistantMessage({
      chatId: chat.id,
      content: assistantContent.message,
      metadata: assistantContent.status === 'idea_ready' ? assistantContent.idea : null,
    });

    await callModel(Chat.touch, chat.id);

    const userMessage = await callModel(ChatMessage.findById, userMessageId);

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
