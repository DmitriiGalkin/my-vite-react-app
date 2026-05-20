import GigaChat from 'gigachat';
import { Agent } from 'node:https';
import { convertToProjectObject } from './helper.js';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const gigaClient = new GigaChat({
  credentials: process.env.GIGA_CREDENTIALS,
  httpsAgent,
});

const SYSTEM_PROMPT = `Роль и экспертиза
Ты — ассистент образовательного проекта для детей. Твоя задача — помогать родителям развивать креативность и интерес к обучению через индивидуальные образовательные проекты. Ты общаешься на русском языке, как заботливый педагог, который вдохновляет, но не обещает невозможного.

Основная задача
Получить от родителя ясную, конкретную идею проекта его ребенка. Задавай уточняющие вопросы, если идея слишком общая, чтобы предложить подходящий формат: кружок, мастер-класс, исследовательский проект или творческое задание.

Правила форматирования ответа
      - Никогда не повторяй слова пользователя.
      - Не используй фразы вроде "Вы сказали", "Вы написали".
      - Говори от своего лица: "Предлагаю", "Можно рассмотреть", "Я рекомендую".
      - Если информации мало, задавай вопросы для уточнения.
      - Ответ должен быть только по существу задачи.
      - Ответ должен начинаться с заглавной буквы
      
Пошаговый процесс (ALWAYS FOLLOW THIS ORDER)
1. Проанализируй, что родитель уже сказал о проекте ребенка.
2. Если идея НЕСФОРМИРОВАНА (неясна или слишком общая):
   - Задай 1–3 уточняющих вопросов (например: «Что его особенно увлекает?», «Какой возраст у ребенка?», «Есть ли у него уже какие-то материалы или интересы?»).
3. Если идея ПРОЯСНИЛАСЬ, но еще не готова к реализации:
   - Предложи 1–3 подходящих формата занятий (например: «Это может быть проект “Наблюдение за облаками” с ежедневными зарисовками...»).
4. Если идея сформирована, твой ответ должен состоять из ДВУХ частей:
Первая: Дружелюбное и вдохновляющее описание проекта для родителя.
Вторая: Структурированный ВАЛИДНЫЙ объект JSON с ключами title, description, steps. Этот блок должен быть СТРОГО в конце и отделен от основного текста. Никаких символов после этого JSON.
Пример:
У меня есть идея! { "title": "Дом на Марсе", "description": "Создание макета базы", "steps": ["Шаг 1", "Шаг 2"] }
ВНИМАНИЕ: JSON должен быть строго последним элементом в твоем ответе. После закрывающей скобки } не должно быть никакого текста, примечаний или пояснений.
`;

//Reasoning and Acting
export async function generateAssistantAnswer({ messages }) {
  try {
    // 2. Проверка наличия ключа доступа ПЕРЕД отправкой запроса
    if (!process.env.GIGA_CREDENTIALS) {
      throw new Error(
        'Ошибка конфигурации: Не найден ключ GIGA_CREDENTIALS в переменных окружения.',
      );
    }

    // Определяем схему для самой идеи
    // const ideaSchema = {
    //   type: 'object',
    //   properties: {
    //     title: { type: 'string' },
    //     description: { type: 'string' },
    //   },
    //   required: ['title', 'description'],
    // };
    //
    // // Определяем схему для финального ответа
    // const responseSchema = {
    //   type: 'object',
    //   properties: {
    //     status: { type: 'string', enum: ['success', 'error', 'collecting'] },
    //     idea: ideaSchema,
    //   },
    //   required: ['status', 'idea', 'message'],
    // };

    // Название функции должно быть в стиле snake_case или camelCase
    // const generateIdeaTool = {
    //   name: 'generate_project_idea',
    //   description:
    //     'Генерирует идею образовательного проекта для ребенка на основе запроса родителя.',
    //   parameters: responseSchema, // Схема входных параметров (в данном случае это и есть наш ответ)
    // };

    const payload = {
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      //functions: 'auto',
      //function_call: { name: 'generate_project_idea' },
    };

    // 3. Отправка запроса к API
    const resp = await gigaClient.chat(payload);

    // // 3. Финальный вызов для генерации текста (Content)
    // const finalResp = await gigaClient.chat({
    //   messages: [
    //     { role: 'system', content: SYSTEM_PROMPT },
    //     { role: 'user', content: 'Ребенок любит динозавров, возраст 7 лет.' },
    //     {
    //       role: 'assistant',
    //       // Сообщаем модели, что данные получены и их нужно использовать
    //       content: `Вот данные проекта, которые я подготовил:
    //   Название: ${toolData.idea.title}
    //   Описание: ${toolData.idea.description}
    //
    //   Пожалуйста, составь на основе этих данных дружелюбный ответ для родителя, используя эту информацию. Не повторяй JSON-структуру.`
    //     }
    //   ],
    // });

    // console.log(payload, 'payload');

    // 4. Проверка структуры ответа от API
    if (!resp || !resp.choices || resp.choices.length === 0) {
      throw new Error('Ошибка API: Получен пустой или некорректный ответ от сервера.');
    }

    const parsedData = resp.choices[0]?.message.content;
    console.log('Content: ', parsedData);

    // const parsedData = resp.choices[0]?.message?.function_call?.arguments;

    // 1. Разделяем текст и JSON
    // Ищем начало блока кода ``` или просто первую скобку {
    const jsonStartIndex = parsedData.indexOf('{');
    console.log('jsonStartIndex: ', jsonStartIndex);

    const userMessage =
      jsonStartIndex !== -1 ? parsedData.slice(0, jsonStartIndex).trim() : parsedData; // Текст для пользователя
    const jsonString = jsonStartIndex !== -1 ? parsedData.slice(jsonStartIndex).trim() : null; // Строка JSON

    // 2. Парсим JSON
    //const structuredData = JSON.parse(jsonString);

    console.log(userMessage, 'userMessage');
    console.log(jsonString, 'jsonString');

    const metadata = jsonString ? JSON.stringify(convertToProjectObject(jsonString)) : null;
    console.log(metadata, 'metadata');

    return {
      content: userMessage,
      metadata,
    };
  } catch (error) {
    // --- БЛОК ЛОГИРОВАНИЯ И ВОЗВРАТА ОШИБКИ ---

    // Логируем техническую ошибку для разработчика
    console.error('Ошибка в generateAssistantAnswer:', error);

    // Возвращаем объект в СТРОГОМ формате, который ожидает ваш фронтенд/контроллер.
    // Это предотвращает падение всего приложения на клиенте.
    return {
      status: 'error', // Добавляем статус ошибки
      message:
        'Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.',
      idea: {
        title: 'Ошибка сервиса',
        description: 'Временные технические неполадки на стороне сервера.',
      },
    };
  }
}
