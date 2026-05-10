const { S3Client } = require('@aws-sdk/client-s3');

const REGION = process.env.S3_REGION || 'ru-central1';
const endpoint = process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net/';
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
    region: REGION,
    endpoint,
    credentials: {
        accessKeyId, // берем ключ из переменной окружения
        secretAccessKey, // берем секрет из переменной окружения
    },
});

module.exports = s3Client;
