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
      data.content,
      data.source || 'text',
      data.metadata ? JSON.stringify(data.metadata) : null,
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
}

export default ChatMessage;
