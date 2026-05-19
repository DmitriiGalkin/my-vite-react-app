import GigaChat from 'gigachat';
import { Agent } from 'node:https';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

// 1. Создаем клиента ОДИН РАЗ при загрузке модуля (вне функции)
// Это предотвращает лишние инициализации и потенциальные утечки.
const gigaClient = new GigaChat({
  credentials: process.env.GIGA_CREDENTIALS,
  httpsAgent,
});

export async function generateAssistantAnswer({ messages }) {
  try {
    // 2. Проверка наличия ключа доступа ПЕРЕД отправкой запроса
    if (!process.env.GIGA_CREDENTIALS) {
      throw new Error(
        'Ошибка конфигурации: Не найден ключ GIGA_CREDENTIALS в переменных окружения.',
      );
    }

    // Определяем схему для самой идеи
    const ideaSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['title', 'description'],
    };

    // Определяем схему для финального ответа
    const responseSchema = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['success', 'error', 'collecting'] },
        message: { type: 'string' },
        idea: ideaSchema,
      },
      required: ['status', 'idea', 'message'],
    };

    // Название функции должно быть в стиле snake_case или camelCase
    const generateIdeaTool = {
      name: 'generate_project_idea',
      description:
        'Генерирует идею образовательного проекта для ребенка на основе запроса родителя.',
      parameters: responseSchema, // Схема входных параметров (в данном случае это и есть наш ответ)
    };

    // 3. Отправка запроса к API
      const resp = await gigaClient.chat({
        messages: [
          {
            role: 'system',
            content:
              'Роль и экспертиза\n' +
              'Ты — дружелюбный AI-помощник образовательного проекта для детей. Твоя задача — помогать родителям развивать креативность и интерес к обучению через индивидуальные образовательные проекты. Ты общаешься на русском языке, как заботливый педагог, который вдохновляет, но не обещает невозможного.\n' +
              'Основная задача\n' +
              'Получить от родителя ясную, конкретную идею проекта его ребенка. Задавай 1–3 уточняющих вопроса, если идея слишком общая, чтобы предложить подходящий формат: кружок, мастер-класс, исследовательский проект или творческое задание.\n' +
              'Пошаговый процесс (ALWAYS FOLLOW THIS ORDER)\n' +
              'Проанализируй, что родитель уже сказал о проекте ребенка.\n' +
              'Если идея неясна — задай 1–3 уточняющих вопроса (например: «Какой возраст у ребенка?», «Что его особенно увлекает?», «Есть ли у него уже какие-то материалы или интересы?»).\n' +
              'Если идея прояснилась, но еще не готова к реализации — предложи 1–3 подходящих формата занятий (например: «Это может быть проект “Наблюдение за облаками” с ежедневными зарисовками...»).\n' +
              'Если идея достаточно сформирована, верни status: success.\n' +
              'Если идея неясна — верни status: collecting.',
          },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        // Передаем массив доступных инструментов
        functions: [generateIdeaTool],
        // Указываем, что модель *должна* использовать инструмент, если нужен ответ
        function_call: { name: 'generate_project_idea' },
      });


    // 4. Проверка структуры ответа от API
    if (!resp || !resp.choices || resp.choices.length === 0) {
      throw new Error('Ошибка API: Получен пустой или некорректный ответ от сервера.');
    }

    const parsedData = resp.choices[0]?.message?.function_call?.arguments;

    // 7. Финальная проверка структуры данных (согласно вашему промпту)
    if (!parsedData || typeof parsedData !== 'object' || !parsedData.status) {
      throw new Error('Ошибка структуры: Ответ не соответствует ожидаемому формату.');
    }

    return parsedData;
  } catch (error) {
    // --- БЛОК ЛОГИРОВАНИЯ И ВОЗВРАТА ОШИБКИ ---

    // Логируем техническую ошибку для разработчика
    console.error('Ошибка в generateAssistantAnswer:', error);

    // Возвращаем объект в СТРОГОМ формате, который ожидает ваш фронтенд/контроллер.
    // Это предотвращает падение всего приложения на клиенте.
    return {
      status: 'error', // Добавляем статус ошибки
      message: 'Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.',
      idea: {
        title: 'Ошибка сервиса',
        description: 'Временные технические неполадки на стороне сервера.'
      }
    };
  }
}
