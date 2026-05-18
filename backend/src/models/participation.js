// src/models/participation.js
// 'use strict';
const pool = require('../db'); // Подключаем пул соединений

class Participation {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.projectId = data.projectId;
    // Добавим даты, если они есть в таблице
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ ---

  /**
   * Создает новую запись об участии.
   * @param {Object} data - Данные для вставки (userId, projectId).
   * @returns {Promise<number>} ID созданной записи.
   */
  static async create(data) {
    try {
      const [result] = await pool.query('INSERT INTO participation SET ?', data);
      return result.insertId;
    } catch (err) {
      console.error('Participation.create error:', err);
      throw err;
    }
  }

  /**
   * Удаляет участие по ID.
   * @param {number} id - ID записи участия.
   * @returns {Promise<void>}
   */
  static async delete(id) {
    try {
      await pool.query('DELETE FROM participation WHERE id = ?', [id]);
    } catch (err) {
      console.error('Participation.delete error:', err);
      throw err;
    }
  }

  /**
   * Удаляет все участия пользователя.
   * @param {number} userId - ID пользователя.
   * @returns {Promise<void>}
   */
  static async deleteByUserId(userId) {
    try {
      await pool.query('DELETE FROM participation WHERE userId = ?', [userId]);
    } catch (err) {
      console.error('Participation.deleteByUserId error:', err);
      throw err;
    }
  }

  /**
   * Находит участие по ID.
   * @param {number} id - ID записи.
   * @returns {Promise<Participation|null>}
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM participation WHERE id = ?', [id]);
      return rows.length > 0 ? new Participation(rows[0]) : null;
    } catch (err) {
      console.error('Participation.findById error:', err);
      throw err;
    }
  }

  /**
   * Находит все участия в проекте.
   * @param {number} projectId - ID проекта.
   * @returns {Promise<Participation[]>}
   */
  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.query('SELECT * FROM participation WHERE projectId = ?', [
        projectId,
      ]);
      return rows.map(row => new Participation(row));
    } catch (err) {
      console.error('Participation.findByProjectId error:', err);
      throw err;
    }
  }

  /**
   * Проверяет, участвует ли пользователь в проекте.
   * @param {number} userId - ID пользователя.
   * @param {number} projectId - ID проекта.
   * @returns {Promise<Participation|null>}
   */
  static async findByUserAndProjectIds(userId, projectId) {
    try {
      const sql = 'SELECT * FROM participation WHERE userId = ? AND projectId = ?';
      const [rows] = await pool.query(sql, [userId, projectId]);
      return rows.length > 0 ? new Participation(rows[0]) : null;
    } catch (err) {
      console.error('Participation.findByUserAndProjectIds error:', err);
      throw err;
    }
  }
}

module.exports = Participation;
