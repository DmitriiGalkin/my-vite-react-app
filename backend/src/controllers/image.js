import { PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { v4 as uuidv4 } from 'uuid';

import s3Client from '../s3.js'; // Импортируем ES-модуль

export default {
  upload: async (req, res) => {
    console.log('Пошла загрузка');

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при парсинге формы' });
      }

      const file = files.image;
      if (!file) {
        return res.status(400).json({ error: 'Файл не найден' });
      }

      const filename = uuidv4() + path.extname(file.originalFilename);
      const filePath = file.filepath;

      try {
        const fileContent = fs.readFileSync(filePath);

        const params = {
          Bucket: 'quantum-education',
          Key: filename,
          Body: fileContent,
          ContentType: mime.getType(file.originalFilename),
        };

        await s3Client.send(new PutObjectCommand(params));

        const fileUrl = `https://storage.yandexcloud.net/quantum-education/${filename}`;
        res.json({ url: fileUrl });
      } catch (error) {
        console.error('Ошибка загрузки в S3:', error);
        res.status(500).json({ error: 'Ошибка при загрузке файла' });
      }
    });
  }
}
