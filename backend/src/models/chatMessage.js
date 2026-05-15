'use strict';
const dbConn = require('../db');

const ChatMessage = function (data) {
  this.id = data.id;
  this.chatId = data.chatId;
  this.passportId = data.passportId;
  this.role = data.role;
  this.content = data.content;
  this.source = data.source || 'text';
  this.metadata = data.metadata ? JSON.stringify(data.metadata) : null;
};

ChatMessage.create = function (data, result) {
  dbConn.query(
    `
      INSERT INTO chatMessage
        (chatId, passportId, role, content, source, metadata)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `,
    [
      data.chatId,
      data.passportId || null,
      data.role,
      data.content,
      data.source || 'text',
      data.metadata ? JSON.stringify(data.metadata) : null,
    ],
    function (err, res) {
      if (err) {
        console.error('ChatMessage.create error:', err);
        return result(err);
      }

      result(null, res && res.insertId);
    },
  );
};

ChatMessage.findById = function (id, result) {
  dbConn.query('SELECT * FROM chatMessage WHERE id = ?', [id], function (err, res) {
    if (err) {
      console.error('ChatMessage.findById error:', err);
      return result(err);
    }

    result(null, res?.[0]);
  });
};

ChatMessage.findByChatId = function (chatId, result) {
  dbConn.query(
    `
      SELECT *
      FROM chatMessage
      WHERE chatId = ?
      ORDER BY createdAt ASC, id ASC
    `,
    [chatId],
    function (err, res) {
      if (err) {
        console.error('ChatMessage.findByChatId error:', err);
        return result(err, []);
      }

      result(null, res || []);
    },
  );
};

ChatMessage.findLastByChatId = function (chatId, limit, result) {
  dbConn.query(
    `
      SELECT *
      FROM chatMessage
      WHERE chatId = ?
      ORDER BY createdAt DESC, id DESC
      LIMIT ?
    `,
    [chatId, limit],
    function (err, res) {
      if (err) {
        console.error('ChatMessage.findLastByChatId error:', err);
        return result(err, []);
      }

      result(null, (res || []).reverse());
    },
  );
};

module.exports = ChatMessage;
