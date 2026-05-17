'use strict';

const CLOUD_RU_AGENT_CARD_URL =
  process.env.CLOUD_RU_AGENT_CARD_URL ||
  'https://8031ad2d-bd4f-43f3-8ae9-7712ffb21bb4-agent.ai-agent.inference.cloud.ru/.well-known/agent-card.json';

function buildAgentPromptFromHistory(messages) {
  const historyText = messages
    .map(item => {
      const roleLabel = item.role === 'assistant' ? 'Ассистент' : 'Родитель';

      return `${roleLabel}: ${item.content}`;
    })
    .join('\n');

  return ['История диалога:', historyText].join('\n');
}

function extractA2AArtifactsText(response) {
  return response?.result?.artifacts
    ?.flatMap(artifact => artifact.parts || [])
    ?.filter(part => part.kind === 'text')
    ?.map(part => part.text)
    ?.filter(Boolean)
    ?.join('\n')
    ?.trim();
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

  const text = extractA2AArtifactsText(response);

  if (!text) {
    throw new Error('AI агент вернул пустой ответ');
  }

  return JSON.parse(text);
}

module.exports = {
  generateAssistantAnswer,
};
