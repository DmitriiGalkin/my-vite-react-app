// src/models/visit.js
// 'use strict';
const pool = require('../db'); // Подключаем пул соединений

class Visit {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.meetId = data.meetId;
    // Добавим дату создания, если она есть в таблице
    this.createdAt = data.createdAt;
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ ---

  /**
   * Создает новую запись о визите.
   * @param {Object} visitData - Данные для вставки (userId, meetId).
   * @returns {Promise<number>} ID созданной записи.
   */
  static async create(visitData) {
    try {
      const [result] = await pool.query('INSERT INTO visit (userId, meetId) VALUES (?, ?)', [
        visitData.userId,
        visitData.meetId,
      ]);
      return result.insertId;
    } catch (err) {
      console.error('Visit.create error:', err);
      throw err;
    }
  }

  /**
   * Удаляет визит по ID.
   * @param {number} id - ID визита.
   * @returns {Promise<void>}
   */
  static async delete(id) {
    try {
      // ИСПРАВЛЕНИЕ БЕЗОПАСНОСТИ: Используем плейсхолдер, а не интерполяцию!
      await pool.query('DELETE FROM visit WHERE id = ?', [id]);
    } catch (err) {
      console.error('Visit.delete error:', err);
      throw err;
    }
  }

  /**
   * Находит визит по ID.
   * @param {number} id - ID визита.
   * @returns {Promise<Visit|null>}
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM visit WHERE id = ?', [id]);
      return rows.length > 0 ? new Visit(rows[0]) : null;
    } catch (err) {
      console.error('Visit.findById error:', err);
      throw err;
    }
  }

  /**
   * Находит все визиты пользователя с датами встреч.
   * @param {number} userId - ID пользователя.
   * @returns {Promise<Visit[]>}
   */
  static async findByUserId(userId) {
    try {
      const sql = `
        SELECT visit.*, meet.startedAt 
        FROM visit 
        LEFT JOIN meet ON meet.id = visit.meetId 
        WHERE userId = ? 
        ORDER BY meet.startedAt DESC
      `;
      const [rows] = await pool.query(sql, [userId]);
      return rows.map(row => new Visit(row));
    } catch (err) {
      console.error('Visit.findByUserId error:', err);
      throw err;
    }
  }

  /**
   * Проверяет, записан ли пользователь на встречу.
   * @param {number} userId - ID пользователя.
   * @param {number} meetId - ID встречи.
   * @returns {Promise<Visit|null>}
   */
  static async findByUserAndMeetIds(userId, meetId) {
    try {
      const [rows] = await pool.query('SELECT * FROM visit WHERE userId = ? AND meetId = ?', [
        userId,
        meetId,
      ]);
      return rows.length > 0 ? new Visit(rows[0]) : null;
    } catch (err) {
      console.error('Visit.findByUserAndMeetIds error:', err);
      throw err;
    }
  }

  /**
   * Находит все визиты на конкретную встречу.
   * @param {number} meetId - ID встречи.
   * @returns {Promise<Visit[]>}
   */
  static async findByMeet(meetId) {
    try {
      const [rows] = await pool.query('SELECT * FROM visit WHERE meetId = ?', [meetId]);
      return rows.map(row => new Visit(row));
    } catch (err) {
      console.error('Visit.findByMeet error:', err);
      throw err;
    }
  }
}

module.exports = Visit;
