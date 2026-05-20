import GigaChat, { detectImage } from 'gigachat';
import S3 from '../s3.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { Agent } from 'node:https';

function buildProjectImagePrompt(project) {
  return [
    'Сгенерируй изображение 256px на 256px',
    'Сделай яркую, дружелюбную, современную иллюстрацию без текста на изображении.',
    'Изображение должно подходить для карточки проекта на сайте для родителей и детей.',
    `Идея проекта: ${project.title || 'Идея проекта'}`,
    `Описание проекта: ${project.description || ''}`,
  ].join('\n');
}

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const giga = new GigaChat({
  timeout: 600,
  model: 'GigaChat',
  credentials: process.env.GIGA_CREDENTIALS,
  httpsAgent: httpsAgent,
});

export async function generateProjectImage(project) {
  // --- Блок генерации изображения (пример использования GigaChat) ---
  // Этот блок можно вынести в отдельную функцию или сервис, если он нужен постоянно.
  try {
    const payload = {
      messages: [
        {
          role: 'user',
          content: buildProjectImagePrompt(project),
        },
      ],
      function_call: 'auto',
    };
    console.log(payload,'payload');
    const imageResponse = await giga.chat(payload);

    //console.log(JSON.stringify(imageResponse), 'imageResponse');

    const detectedImage = detectImage(imageResponse.choices[0]?.message.content ?? '');
    //console.log(detectedImage, 'detectedImage');

    if (detectedImage && detectedImage.uuid) {
      const image = await giga.getImage(detectedImage.uuid);
      return image.content;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Ошибка при генерации картинки:', err);
  }
}

export async function uploadImage(imageBinary) {
  try {
    const buffer = Buffer.from(imageBinary, 'binary');
    const name = uuid() + '.jpg';

    await S3.send(
      new PutObjectCommand({
        Bucket: 'quantum-education',
        Key: name,
        Body: buffer,
        ContentType: 'image/jpeg',
      }),
    );

    return 'https://storage.yandexcloud.net/quantum-education/' + name
  } catch (err) {
    console.error('Ошибка при отправки картинки на S3:', err);
  }
}
