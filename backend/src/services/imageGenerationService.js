'use strict';

const YANDEX_ART_API_URL =
  process.env.YANDEX_ART_API_URL || 'https://cloud.yandex.ru/api/ai-studio/v1/yandexart/generate';

function buildProjectImagePrompt(project) {
  return [
    'Детский образовательный проект.',
    'Сделай яркую, дружелюбную, современную иллюстрацию без текста на изображении.',
    'Изображение должно подходить для карточки проекта на сайте для родителей и детей.',
    '',
    `Название проекта: ${project.title || 'Идея проекта'}`,
    `Описание проекта: ${project.description || ''}`,
  ].join('\n');
}

async function generateProjectImage(project) {
  if (!process.env.YANDEX_ART_TOKEN) {
    throw new Error('Не настроен YANDEX_ART_TOKEN');
  }

  const response = await fetch(YANDEX_ART_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.YANDEX_ART_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: buildProjectImagePrompt(project),
      style: 'ART',
      seed: Date.now(),
    }),
  });

  console.log('111111')
  console.log(response, 'response');

  const result = await response.json();
  console.log(result, 'result');

  if (!response.ok) {
    throw new Error(result.error || 'YandexART вернул ошибку генерации изображения');
  }

  if (!result.image_url) {
    throw new Error(result.error || 'YandexART не вернул image_url');
  }

  return result.image_url;
}

module.exports = {
  generateProjectImage,
};
