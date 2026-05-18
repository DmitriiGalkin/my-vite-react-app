// src/models/Chat.js
// 'use strict';
const pool = require('../db'); // Подключаем пул соединений

// Используем класс для лучшей структуры
class Chat {
  constructor(data) {
    this.id = data.id;
    this.passportId = data.passportId;
    this.title = data.title;
    this.summary = data.summary;
    this.updatedAt = data.updatedAt;
    // Добавим поле для последнего сообщения, если оно есть (из JOIN запроса)
    this.lastMessage = data.lastMessage;
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ (для работы с БД) ---

  /**
   * Создает новый чат.
   * @param {Object} data - Данные для вставки.
   * @returns {Promise<number>} ID созданного чата.
   */
  static async create(data) {
    const sql = `
      INSERT INTO \`chat\`
        (passportId, title, summary)
      VALUES
        (?, ?, ?)
    `;
    const values = [data.passportId, data.title || null, data.summary || null];

    try {
      const [result] = await pool.query(sql, values);
      return result.insertId;
    } catch (err) {
      console.error('Chat.create error:', err);
      throw err; // Выбрасываем ошибку для обработки в контроллере
    }
  }

  /**
   * Находит активный чат по ID пользователя.
   * @param {number} passportId - ID пользователя.
   * @returns {Promise<Chat|null>}
   */
  static async findActiveByPassportId(passportId) {
    const sql = `
      SELECT *
      FROM chat
      WHERE passportId = ?
        AND deletedAt IS NULL
      ORDER BY updatedAt DESC
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [passportId]);
    return rows.length > 0 ? new Chat(rows[0]) : null;
  }

  /**
   * Проверяет доступ пользователя к чату.
   * @param {number} id - ID чата.
   * @param {number} passportId - ID пользователя.
   * @returns {Promise<Chat|null>}
   */
  static async findByIdAndPassportId(id, passportId) {
    const sql = `
      SELECT *
      FROM chat
      WHERE id = ?
        AND passportId = ?
        AND deletedAt IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [id, passportId]);
    return rows.length > 0 ? new Chat(rows[0]) : null;
  }

  /**
   * Обновляет время последнего изменения чата (touch).
   * @param {number} id - ID чата.
   * @returns {Promise<void>}
   */
  static async touch(id) {
    const sql = 'UPDATE chat SET updatedAt = CURRENT_TIMESTAMP() WHERE id = ?';

    try {
      await pool.query(sql, [id]);
    } catch (err) {
      console.error('Chat.touch error:', err);
      throw err;
    }
  }

  /**
   * Находит все чаты пользователя с последним сообщением в каждом.
   * @param {number} passportId - ID пользователя.
   * @returns {Promise<Chat[]>}
   */
  static async findAllByPassportId(passportId) {
    const sql = `
      SELECT
        chat.*,
        lastMessage.content AS lastMessage,
        lastMessage.createdAt AS lastMessageAt,
        lastMessage.role AS lastMessageRole
      FROM chat
      LEFT JOIN chatMessage lastMessage
        ON lastMessage.id = (
          SELECT id
          FROM chatMessage cm_inner
          WHERE cm_inner.chatId = chat.id
          ORDER BY cm_inner.createdAt DESC, cm_inner.id DESC
          LIMIT 1
        )
      WHERE chat.passportId = ?
        AND chat.deletedAt IS NULL
      ORDER BY chat.updatedAt DESC
    `;

    const [rows] = await pool.query(sql, [passportId]);

    // Преобразуем каждую строку в объект Chat и сортируем по дате последнего сообщения (если оно есть)
    return rows
      .map(row => new Chat(row))
      .sort((a, b) => {
        const dateA = b.lastMessageAt || b.updatedAt;
        const dateB = a.lastMessageAt || a.updatedAt;
        return new Date(dateA) - new Date(dateB);
      });
  }
}

module.exports = Chat;
