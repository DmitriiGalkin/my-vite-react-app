'use strict';
const formidable = require('formidable');
const fs = require('fs');
const path = require('path')
const mime = require('mime');
const { v4: uuid } = require('uuid');

const { PutObjectCommand } = require('@aws-sdk/client-s3');
const S3 = require('../s3');

// Загрузка картинки
exports.upload = function(req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, async function (error, fields, files) {
        const file = files.image
        const filename = uuid() + path.extname(file.originalFilename)

        await new Promise(function(resolve, reject) {
            S3.send(new PutObjectCommand({
                Bucket: 'quantum-education', // имя bucket
                Key: filename, // имя файла в облаке
                Body: fs.readFileSync(file.filepath), // данные файла в blob
                ContentType: mime.getType(file.originalFilename), // тип файла
            })).then(
                (data) => {
                    resolve(data)
                },
                (error) => {
                    reject(error)
                }
            );
        });

        res.json('https://storage.yandexcloud.net/quantum-education/' + filename);
    })
};
