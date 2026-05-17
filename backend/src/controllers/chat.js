'use strict';
const Chat = require('../models/chat');
const ChatMessage = require('../models/chatMessage');
const Project = require('../models/project');

const CLOUD_RU_AGENT_CARD_URL =
  process.env.CLOUD_RU_AGENT_CARD_URL ||
  'https://8031ad2d-bd4f-43f3-8ae9-7712ffb21bb4-agent.ai-agent.inference.cloud.ru/.well-known/agent-card.json';

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

function isCreateProjectIdeaCommand(message) {
  const normalizedMessage = message.trim().toLowerCase();

  return [
    'создать идею проекта',
    'создай идею проекта',
    'создать проект',
    'создай проект',
  ].includes(normalizedMessage);
}

function parseMetadata(metadata) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'object') {
    return metadata;
  }

  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
}

function findLastProjectIdea(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const metadata = parseMetadata(messages[index].metadata);

    if (metadata?.title || metadata?.description) {
      return metadata;
    }
  }

  return null;
}

async function createProjectFromIdea({ idea, passportId }) {
  return callModel(Project.create, {
    passportId,
    title: idea.title || 'Идея проекта',
    description: idea.description || '',
    image: idea.image || null,
    placeId: idea.placeId || null,
  });
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

function buildAgentPromptFromHistory(messages) {
  const historyText = messages
    .map(item => {
      const roleLabel = item.role === 'assistant' ? 'Ассистент' : 'Родитель';

      return `${roleLabel}: ${item.content}`;
    })
    .join('\n');

  return [
    'История диалога:',
    historyText,
  ].join('\n');
}

async function generateAssistantAnswer({ messages }) {
  if (!process.env.CLOUD_RU_IAM_TOKEN) {
    throw new Error('Не настроен CLOUD_RU_IAM_TOKEN');
  }

  const [{ A2AClient }, { v4: uuidv4 }] = await Promise.all([
    import('@a2a-js/sdk/client'),
    import('uuid'),
  ]);

  const fetchWithCustomHeader = async (url, init) => {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${process.env.CLOUD_RU_IAM_TOKEN}`);

    return fetch(url, {
      ...init,
      headers,
    });
  };

  const client = await A2AClient.fromCardUrl(CLOUD_RU_AGENT_CARD_URL, {
    fetchImpl: fetchWithCustomHeader,
  });

  const prompt = buildAgentPromptFromHistory(messages);



  const response = await client.sendMessage({
    message: {
      messageId: uuidv4(),
      role: 'user',
      parts: [
        {
          kind: 'text',
          text: prompt,
        },
      ],
      kind: 'message',
    },
  });

  //console.log('A2A response:', JSON.stringify(response, null, 2));


  //console.log(JSON.stringify(response?.result?.artifacts, null, 2), 'text');
  const text2 = response?.result?.artifacts
    ?.flatMap(artifact => artifact.parts || [])
    ?.filter(part => part.kind === 'text')
    ?.map(part => part.text)
    ?.filter(Boolean)
    ?.join('\n')
    ?.trim();
  console.log(text2, 'text2');

  const f = JSON.parse(text2);

  console.log(f,'f')


  return f;
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

    const assistantMessageId = await callModel(ChatMessage.create, {
      chatId: chat.id,
      passportId: null,
      role: 'assistant',
      content: assistantContent.message,
      metadata: assistantContent.status === 'idea_ready' ? assistantContent.idea : null,
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
