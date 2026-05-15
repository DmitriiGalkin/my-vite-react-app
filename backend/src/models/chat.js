'use strict';
const dbConn = require('../db');

const Chat = function (data) {
  this.id = data.id;
  this.passportId = data.passportId;
  this.title = data.title;
  this.summary = data.summary;
};

Chat.create = function (data, result) {
  dbConn.query(
    `
      INSERT INTO \`chat\`
        (passportId, title, summary)
      VALUES
        (?, ?, ?)
    `,
    [data.passportId, data.title || null, data.summary || null],
    function (err, res) {
      if (err) {
        console.error('Chat.create error:', err);
        return result(err);
      }

      result(null, res && res.insertId);
    },
  );
};

Chat.findActiveByPassportId = function (passportId, result) {
  dbConn.query(
    `
      SELECT *
      FROM chat
      WHERE passportId = ?
        AND deletedAt IS NULL
      ORDER BY updatedAt DESC
      LIMIT 1
    `,
    [passportId],
    function (err, res) {
      if (err) {
        console.error('Chat.findActiveByPassportId error:', err);
        return result(err);
      }

      result(null, res?.[0]);
    },
  );
};

Chat.findByIdAndPassportId = function (id, passportId, result) {
  dbConn.query(
    `
      SELECT *
      FROM chat
      WHERE id = ?
        AND passportId = ?
        AND deletedAt IS NULL
      LIMIT 1
    `,
    [id, passportId],
    function (err, res) {
      if (err) {
        console.error('Chat.findByIdAndPassportId error:', err);
        return result(err);
      }

      result(null, res?.[0]);
    },
  );
};

Chat.touch = function (id, result) {
  dbConn.query(
    'UPDATE chat SET updatedAt = CURRENT_TIMESTAMP() WHERE id = ?',
    [id],
    function (err, res) {
      if (err) {
        console.error('Chat.touch error:', err);
        return result(err);
      }

      result(null, res);
    },
  );
};

Chat.findAllByPassportId = function (passportId, result) {
  dbConn.query(
    `
      SELECT
        chat.*,
        lastMessage.content AS lastMessage
      FROM chat
      LEFT JOIN chatMessage lastMessage
        ON lastMessage.id = (
          SELECT id
          FROM chatMessage
          WHERE chatMessage.chatId = chat.id
          ORDER BY createdAt DESC, id DESC
          LIMIT 1
        )
      WHERE chat.passportId = ?
        AND chat.deletedAt IS NULL
      ORDER BY chat.updatedAt DESC
    `,
    [passportId],
    function (err, res) {
      if (err) {
        console.error('Chat.findAllByPassportId error:', err);
        return result(err, []);
      }

      result(null, res || []);
    },
  );
};

module.exports = Chat;
