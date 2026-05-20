import Chat from '../models/chat.js';
import ChatMessage from '../models/chatMessage.js';
import {
  normalizeMessage,
  getOrCreateChat,
  createAssistantMessage,
} from '../services/chatService.js';
import { generateAssistantAnswer } from '../services/assistantService.js';

import {
  isCreateProjectIdeaCommand,
  findLastProjectIdea,
  createProjectFromIdea,
} from '../services/projectIdeaService.js';
import { generateProjectImage } from '../services/imageGenerationService.js';
import { uploadImage } from '../services/imageGenerationService.js';

// --- Функции контроллера ---

// Все функции объявлены как const и собраны в объект в конце файла

export default {
  createMessage: async (req, res) => {
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

      const userMessage = await ChatMessage.findById(userMessageId);

      // 3. Проверка на команду создания проекта
      if (isCreateProjectIdeaCommand(message)) {
        const recentMessages = await ChatMessage.findLastByChatId(chat.id, 10);
        const idea = findLastProjectIdea(recentMessages);

        if (!idea) {
          const assistantMessage = await createAssistantMessage({
            chatId: chat.id,
            content: 'Не нашёл готовой идеи проекта в переписке. Давайте сначала сформулируем её.',
          });
          await Chat.touch(chat.id);
          return res.json({
            chatId: chat.id,
            messages: [normalizeMessage(userMessage), normalizeMessage(assistantMessage)],
          });
        }

        const createdProjectId = await createProjectFromIdea({
          idea,
          passportId: req.passport.id,
        });

        const assistantMessage = await createAssistantMessage({
          chatId: chat.id,
          content:
            'Поздравляем! Идея проекта создана. Мы уже начали подбирать куратора для идеи проекта вашего ребенка. После того как куратор проекта будет назначен, он возмет на себя ответственность по оформлению проекта, выбору места и времени проведения встреч по проекту.',
        });

        await Chat.touch(chat.id);

        return res.json({
          chatId: chat.id,
          messages: [normalizeMessage(userMessage), normalizeMessage(assistantMessage)],
        });
      }

      // 4. Генерация ответа ассистента
      const recentMessages = await ChatMessage.findLastByChatId(chat.id, 10);

      const assistantContent = await generateAssistantAnswer({
        messages: recentMessages,
        chat,
        passport: req.passport,
      });
      console.log('assistantContent:', assistantContent);

      let image = null;
      let metadata = null;
      if (assistantContent.status === 'success') {
        metadata = assistantContent.idea;

        // const imageBinary = await generateProjectImage(assistantContent.idea);
        // if (imageBinary) image = await uploadImage(imageBinary);
        //
        // //console.log('imageBinary:', imageBinary);
        // metadata = { ...assistantContent.idea, image };
      }

      const assistantMessage = await createAssistantMessage({
        chatId: chat.id,
        content: assistantContent.message,
        metadata,
      });

      await Chat.touch(chat.id);

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
  },

  findMessages: async (req, res) => {
    try {
      if (!req.passport) {
        return res.status(401).json({ error: true, message: 'Требуется авторизация' });
      }

      const chat = await Chat.findByIdAndPassportId(req.params.id, req.passport.id);

      if (!chat) {
        return res
          .status(404)
          .json({ error: true, message: 'Чат не найден или у вас нет доступа' });
      }

      const messages = await ChatMessage.findByChatId(chat.id);

      res.json(messages.map(normalizeMessage));
    } catch (err) {
      console.error('chat.findMessages error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить сообщения' });
    }
  },

  findAll: async (req, res) => {
    try {
      if (!req.passport) {
        return res.status(401).json({
          error: true,
          message: 'Требуется авторизация',
        });
      }

      const chats = await Chat.findAllByPassportId(req.passport.id);

      res.json(chats);
    } catch (err) {
      console.error('chat.findAll error:', err);

      res.status(500).json({
        error: true,
        message: 'Не удалось получить список чатов',
      });
    }
  },
};
