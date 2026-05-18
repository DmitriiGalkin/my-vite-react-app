// src/models/passport.js
// 'use strict';
const pool = require('../db'); // Подключаем пул соединений

class Passport {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.email = data.email;
    this.accessToken = data.accessToken;
    this.provider = data.provider;
    this.providerId = data.providerId;
    // Добавим дату создания/обновления, если они есть в ответе БД
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ (для работы с БД) ---

  /**
   * Создает нового пользователя.
   * @param {Object} userData - Данные для вставки.
   * @returns {Promise<number>} ID созданной записи.
   */
  static async create(userData) {
    try {
      const [result] = await pool.query('INSERT INTO passport SET ?', userData);
      return result.insertId;
    } catch (err) {
      console.error('Passport.create error:', err);
      throw err;
    }
  }

  /**
   * Обновляет данные пользователя.
   * @param {number} id - ID пользователя.
   * @param {Object} passportData - Новые данные.
   * @returns {Promise<void>}
   */
  static async update(id, passportData) {
    try {
      await pool.query('UPDATE passport SET title = ? WHERE id = ?', [passportData.title, id]);
    } catch (err) {
      console.error('Passport.update error:', err);
      throw err;
    }
  }

  /**
   * Обновляет токен доступа.
   * @param {string} token - Новый токен.
   * @param {number} id - ID пользователя.
   * @returns {Promise<void>}
   */
  static async updateTokenById(token, id) {
    try {
      await pool.query('UPDATE passport SET accessToken = ? WHERE id = ?', [token, id]);
    } catch (err) {
      console.error('Passport.updateTokenById error:', err);
      throw err;
    }
  }

  /**
   * Находит пользователя по ID.
   * @param {number} id - ID пользователя.
   * @returns {Promise<Passport|null>}
   */
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM passport WHERE id = ?', [id]);
    return rows.length > 0 ? new Passport(rows[0]) : null;
  }

  /**
   * Находит пользователя по email.
   * @param {string} email - Email пользователя.
   * @returns {Promise<Passport|null>}
   */
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM passport WHERE email = ?', [email]);
    return rows.length > 0 ? new Passport(rows[0]) : null;
  }

  /**
   * Находит пользователя по accessToken.
   * @param {string} accessToken - Токен доступа.
   * @returns {Promise<Passport|null>}
   */
  static async findByAccessToken(accessToken) {
    const [rows] = await pool.query('SELECT * FROM passport WHERE accessToken = ?', [accessToken]);
    return rows.length > 0 ? new Passport(rows[0]) : null;
  }
}

module.exports = Passport;
