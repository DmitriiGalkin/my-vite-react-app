// src/models/user.js
// 'use strict';
const pool = require('../db'); // Подключаем пул соединений

class User {
  constructor(data) {
    this.id = data.id;
    this.passportId = data.passportId;
    this.title = data.title;
    this.age = data.age;
    this.image = data.image;
    this.deletedAt = data.deletedAt;
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ ---

  static async create(userData) {
    try {
      // В запросе используются только поля, которые есть в модели
      const [result] = await pool.query('INSERT INTO `user` (title, passportId) VALUES (?, ?)', [
        userData.title,
        userData.passportId,
      ]);
      return result.insertId;
    } catch (err) {
      console.error('User.create error:', err);
      throw err;
    }
  }

  static async update(userData) {
    try {
      await pool.query('UPDATE user SET title=?, age=?, image=? WHERE id = ?', [
        userData.title,
        userData.age,
        userData.image,
        userData.id,
      ]);
    } catch (err) {
      console.error('User.update error:', err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      await pool.query('UPDATE user SET deletedAt = NOW() WHERE id = ?', [id]);
    } catch (err) {
      console.error('User.delete error:', err);
      throw err;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM `user` WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('User.findById error:', err);
      throw err;
    }
  }

  static async findByPassportId(passportId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user WHERE passportId = ? AND deletedAt IS NULL',
        [passportId],
      );
      return rows.map(row => new User(row));
    } catch (err) {
      console.error('User.findByPassportId error:', err);
      throw err;
    }
  }

  // Участники встречи (через JOIN с таблицей visit)
  static async findByMeet(meetId) {
    try {
      const sql = `
        SELECT DISTINCT user.*
        FROM user
        LEFT JOIN visit ON user.id = visit.userId
        WHERE visit.meetId = ?
          AND user.deletedAt IS NULL
      `;
      const [rows] = await pool.query(sql, [meetId]);
      return rows.map(row => new User(row));
    } catch (err) {
      console.error('User.findByMeet error:', err);
      throw err;
    }
  }
}

module.exports = User;
