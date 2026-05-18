// src/models/place.js
// 'use strict';
const pool = require('../db'); // Подключаем пул соединений

class Place {
  constructor(data) {
    // ID теперь тоже присваивается, это стандарт для моделей
    this.id = data.id;
    this.title = data.title;
    this.image = data.image;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ ---

  /**
   * Создает новое место.
   * @param {Object} data - Данные для вставки.
   * @returns {Promise<number>} ID созданной записи.
   */
  static async create(data) {
    try {
      const [result] = await pool.query('INSERT INTO place SET ?', data);
      return result.insertId;
    } catch (err) {
      console.error('Place.create error:', err);
      throw err;
    }
  }

  /**
   * Находит все места.
   * @returns {Promise<Place[]>}
   */
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM place');
      return rows.map(row => new Place(row));
    } catch (err) {
      console.error('Place.findAll error:', err);
      throw err;
    }
  }

  /**
   * Находит место по ID.
   * @param {number} id - ID места.
   * @returns {Promise<Place|null>}
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM place WHERE id = ?', [id]);
      return rows.length > 0 ? new Place(rows[0]) : null;
    } catch (err) {
      console.error('Place.findById error:', err);
      throw err;
    }
  }
}

module.exports = Place;
