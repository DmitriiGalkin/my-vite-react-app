import pool from '../db.js'; // Импортируем пул соединений

// Библиотеку @js-joda можно оставить, если она используется в других местах,
// но для простого форматирования дат она здесь не обязательна.
// const LocalDateTime = require('@js-joda/core').LocalDateTime;

class Meet {
  constructor(data) {
    this.id = data.id;
    this.passportId = data.passportId;
    this.projectId = data.projectId;
    this.startedAt = data.startedAt; // Используем стандартное название поля
    this.duration = data.duration;
    this.price = data.price;
    this.deletedAt = data.deletedAt;

    // Вычисляемое свойство для удобства (если нужно)
    // this.datetime = data.datetime; // Если поле datetime есть в БД
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ ---

  static async create(data) {
    try {
      const [result] = await pool.query(
        'INSERT INTO meet (projectId, price, duration, startedAt) VALUES (?, ?, ?, ?)',
        [data.projectId, data.price, data.duration, data.startedAt]
      );
      return result.insertId;
    } catch (err) {
      console.error('Meet.create error:', err);
      throw err;
    }
  }

  static async update(id, meetData) {
    try {
      await pool.query(
        'UPDATE meet SET startedAt=?, duration=?, price=? WHERE id = ?',
        [meetData.startedAt, meetData.duration, meetData.price, id]
      );
    } catch (err) {
      console.error('Meet.update error:', err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      await pool.query('UPDATE meet SET deletedAt = NOW() WHERE id = ?', [id]);
    } catch (err) {
      console.error('Meet.delete error:', err);
      throw err;
    }
  }

  static async deleteByProjectId(projectId) {
    try {
      await pool.query('UPDATE meet SET deletedAt = NOW() WHERE projectId = ?', [projectId]);
    } catch (err) {
      console.error('Meet.deleteByProjectId error:', err);
      throw err;
    }
  }

  // Находит все будущие встречи (начиная с сегодняшнего дня)
  static async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT *
        FROM meet
        WHERE startedAt >= CURDATE()
          AND deletedAt IS NULL
        ORDER BY startedAt
      `);
      return rows.map(row => new Meet(row));
    } catch (err) {
      console.error('Meet.findAll error:', err);
      throw err;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM meet WHERE id = ?', [id]);
      return rows.length > 0 ? new Meet(rows[0]) : null;
    } catch (err) {
      console.error('Meet.findById error:', err);
      throw err;
    }
  }

  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.query(`
        SELECT *
        FROM meet
        WHERE projectId = ?
          AND startedAt >= CURDATE()
          AND deletedAt IS NULL
        ORDER BY startedAt
      `, [projectId]);
      return rows.map(row => new Meet(row));
    } catch (err) {
      console.error('Meet.findByProjectId error:', err);
      throw err;
    }
  }

  /**
   * Поиск одной рекомендованной встречи для проекта.
   * Это просто первая будущая встреча.
   */
  static async findRecommendationByProjectId(projectId) {
    try {
      const [rows] = await pool.query(`
        SELECT *
        FROM meet
        WHERE projectId = ?
          AND startedAt >= CURDATE()
          AND deletedAt IS NULL
        ORDER BY startedAt
        LIMIT 1
      `, [projectId]);
      return rows.length > 0 ? new Meet(rows[0]) : null;
    } catch (err) {
      console.error('Meet.findRecommendationByProjectId error:', err);
      throw err;
    }
  }

// Встречи, в которых участвует пользователь (через участие в проекте)
  static async findByUserId(userId) {
    try {
      const sql = `
        SELECT DISTINCT m.*
        FROM meet m
               JOIN participation p ON p.projectId = m.projectId
        WHERE p.userId = ?
          AND m.startedAt >= CURDATE()
          AND m.deletedAt IS NULL
        ORDER BY m.startedAt
      `;
      const [rows] = await pool.query(sql, [userId]);
      return rows.map(row => new Meet(row));
    } catch (err) {
      console.error('Meet.findByUserId error:', err);
      throw err;
    }
  }


  /**
   * Проверка возможности создания встречи по расписанию (таймеру).
   * Возвращает таймер, если подходящей встречи нет.
   */
  static async check(timer) {
    try {
      // MySQL-функция DAYOFWEEK возвращает: 1=Вс, 2=Пн, ... , 7=Сб.
      // Ваша функция toODBC преобразовывала из JS (0=Вс) в этот формат.
      // Для простоты и безопасности используем встроенную функцию MySQL.
      const dayOfWeekInJS = timer.dayOfWeek; // Предполагаем, что здесь 0=Вс, 1=Пн...
      const dayOfWeekForMySQL = dayOfWeekInJS === 0 ? 1 : dayOfWeekInJS + 1;

      const [rows] = await pool.query(`
        SELECT *
        FROM meet
        WHERE projectId = ?
          AND DAYOFWEEK(startedAt) = ?
          AND startedAt >= CURDATE()
          AND deletedAt IS NULL
        LIMIT 1
      `, [timer.projectId, dayOfWeekForMySQL]);

      // Если встречи нет (rows.length === 0), возвращаем таймер.
      // Если есть — возвращаем null или пустой объект.
      return rows.length === 0 ? timer : null;

    } catch (err) {
      console.error('Meet.check error:', err);
      throw err;
    }
  }
}

export default Meet;