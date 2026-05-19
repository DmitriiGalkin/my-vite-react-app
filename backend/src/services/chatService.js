import Chat from '../models/chat.js';
import ChatMessage from '../models/chatMessage.js';

// Эта функция остается без изменений, так как она просто форматирует данные.
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

// Функция для получения или создания чата
async function getOrCreateChat({ chatId, passportId, firstMessage }) {
  if (chatId) {
    // Прямой вызов модели
    const existingChat = await Chat.findByIdAndPassportId(chatId, passportId);

    if (!existingChat) {
      const error = new Error('Чат не найден или у вас нет доступа');
      error.status = 404;
      throw error;
    }

    return existingChat;
  }

  // Логика для создания нового чата, если ID не был передан
  const title = firstMessage.length > 80 ? `${firstMessage.slice(0, 80)}...` : firstMessage;

  const createdChatId = await Chat.create({
    passportId,
    title,
  });

  // Находим и возвращаем созданный чат как объект
  return Chat.findById(createdChatId);
}

// Функция для создания сообщения от ассистента
async function createAssistantMessage({ chatId, content, metadata = null }) {
  // Создаем сообщение в БД
  const assistantMessageId = await ChatMessage.create({
    chatId,
    passportId: null,
    role: 'assistant',
    content,
    metadata,
    source: 'text',
  });

  // Находим и возвращаем полное сообщение (включая ID, createdAt и т.д.)
  // Это исправляет логическую ошибку, где возвращался только ID.
  return ChatMessage.findById(assistantMessageId);
}

export {
  normalizeMessage,
  getOrCreateChat,
  createAssistantMessage,
};
