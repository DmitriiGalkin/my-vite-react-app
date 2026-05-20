import pool from '../db.js'; // Импортируем пул соединений

// Конструктор для создания объекта сообщения
class ChatMessage {
  constructor(data) {
    this.id = data.id;
    this.chatId = data.chatId;
    this.passportId = data.passportId;
    this.role = data.role;
    this.content = data.content;
    this.source = data.source || 'text';
    this.metadata = data.metadata ? JSON.stringify(data.metadata) : null;
    // Добавим дату создания, если она приходит из БД
    this.createdAt = data.createdAt;
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ (для работы с БД) ---

  /**
   * Создает новое сообщение в базе данных.
   * @param {Object} data - Данные для вставки.
   * @returns {Promise<number>} - ID новой записи.
   */
  static async create(data) {
    const sql = `
      INSERT INTO chatMessage
        (chatId, passportId, role, content, source, metadata)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.chatId,
      data.passportId || null,
      data.role,
      data.content || 'text',
      data.source || 'text',
      data.metadata || null,
    ];

    try {
      const [result] = await pool.query(sql, values);
      return result.insertId; // Возвращаем ID созданной записи
    } catch (err) {
      console.error('ChatMessage.create error:', err);
      throw err; // Выбрасываем ошибку, чтобы её поймал контроллер
    }
  }

  /**
   * Находит сообщение по ID.
   * @param {number} id - ID сообщения.
   * @returns {Promise<ChatMessage|null>} - Объект сообщения или null.
   */
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM chatMessage WHERE id = ?', [id]);
    return rows.length > 0 ? new ChatMessage(rows[0]) : null;
  }

  /**
   * Находит все сообщения в чате.
   * @param {number} chatId - ID чата.
   * @returns {Promise<ChatMessage[]>} - Массив сообщений.
   */
  static async findByChatId(chatId) {
    const sql = `
      SELECT *
      FROM chatMessage
      WHERE chatId = ?
      ORDER BY createdAt ASC, id ASC
    `;
    const [rows] = await pool.query(sql, [chatId]);
    return rows.map(row => new ChatMessage(row));
  }

  /**
   * Находит последние N сообщений в чате.
   * @param {number} chatId - ID чата.
   * @param {number} limit - Количество сообщений.
   * @returns {Promise<ChatMessage[]>} - Массив сообщений в правильном порядке.
   */
  static async findLastByChatId(chatId, limit) {
    const sql = `
      SELECT *
      FROM chatMessage
      WHERE chatId = ?
      ORDER BY createdAt DESC, id DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(sql, [chatId, limit]);

    // Реверс нужен, чтобы вернуть сообщения в хронологическом порядке (старый -> новый)
    return rows.reverse().map(row => new ChatMessage(row));
  }

  /**
   * Обновляет существующее сообщение в базе данных.
   * @param {number} id - ID сообщения для обновления.
   * @param {Object} updateData - Объект с полями для обновления (content, metadata).
   * @returns {Promise<number>} - Количество затронутых строк (1 при успехе).
   */
  static async update(id, updateData) {
    // Проверяем, что есть что обновлять
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Нет данных для обновления');
    }

    const sqlParts = [];
    const values = [];

    // Динамически строим SET часть запроса
    if (updateData.content !== undefined) {
      sqlParts.push('content = ?');
      values.push(updateData.content);
    }

    if (updateData.metadata !== undefined) {
      sqlParts.push('metadata = ?');
      values.push(JSON.stringify(updateData.metadata));
    }

    // Добавляем ID в конец массива значений для WHERE
    values.push(id);

    // Если ничего не добавили для обновления, выходим
    if (sqlParts.length === 0) {
      throw new Error('Нет валидных полей для обновления');
    }

    const sql = `
      UPDATE chatMessage
      SET ${sqlParts.join(', ')}
      WHERE id = ?
    `;

    try {
      const [result] = await pool.query(sql, values);

      // Если ни одна строка не была изменена, возможно, сообщение не найдено
      if (result.affectedRows === 0) {
        throw new Error('Сообщение не найдено или данные не изменены');
      }

      return result.affectedRows;
    } catch (err) {
      console.error('ChatMessage.update error:', err);
      throw err; // Выбрасываем ошибку для обработки в контроллере
    }
  }
}

export default ChatMessage;
