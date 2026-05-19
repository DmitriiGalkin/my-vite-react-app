import pool from '../db.js'; // Импортируем пул соединений

class Project {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.image = data.image;
    this.passportId = data.passportId;
    this.placeId = data.placeId;
    this.deletedAt = data.deletedAt;
  }

  // --- СТАТИЧЕСКИЕ МЕТОДЫ ---

  static async create(data) {
    try {
      const [result] = await pool.query('INSERT INTO project SET ?', data);
      return result.insertId;
    } catch (err) {
      console.error('Project.create error:', err);
      throw err;
    }
  }

  static async update(id, obj) {
    const sql = `
      UPDATE project 
      SET title = ?, description = ?, image = ?, placeId = ? 
      WHERE id = ?
    `;
    const values = [obj.title, obj.description, obj.image, obj.placeId, id];

    try {
      await pool.query(sql, values);
    } catch (err) {
      console.error('Project.update error:', err);
      throw err;
    }
  }

  static async delete(id) {
    // Логическое удаление (soft delete)
    const sql = 'UPDATE project SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?';

    try {
      await pool.query(sql, [id]);
    } catch (err) {
      console.error('Project.delete error:', err);
      throw err;
    }
  }

  /**
   * Сложный метод поиска с динамическими условиями.
   * @param {Object} params - Параметры фильтрации.
   */
  static async findAll(params) {
    // Безопасное построение запроса с плейсхолдерами
    let sql = 'SELECT project.* FROM project';
    const conditions = [];
    const values = [];

    // Условие для JOIN (participation)
    if (params?.variant === 'participation' && params?.userId) {
      sql += ' LEFT JOIN participation ON participation.projectId = project.id';
      conditions.push('participation.userId = ?');
      values.push(params.userId);
    }

    // Условие для владельца (self)
    if (params?.variant === 'self' && params?.passportId) {
      conditions.push('project.passportId = ?');
      values.push(params.passportId);
    }

    // Условие для рекомендаций (НЕ владелец)
    if (params?.type === 'recommendation' && params?.passportId) {
      conditions.push('project.passportId != ?');
      values.push(params.passportId);
    }

    // Условие удаления (deletedAt)
    if (params?.deleted === 'true') {
      conditions.push('project.deletedAt IS NOT NULL');
    } else {
      conditions.push('project.deletedAt IS NULL');
    }

    // Собираем финальный запрос, если есть условия WHERE
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    try {
      const [rows] = await pool.query(sql, values);
      return rows;
    } catch (err) {
      console.error('Project.findAll error:', err);
      throw err;
    }
  }

  static async findById(id) {
    const sql = 'SELECT * FROM project WHERE id = ?';

    try {
      const [rows] = await pool.query(sql, [id]);
      return rows.length > 0 ? new Project(rows[0]) : null;
    } catch (err) {
      console.error('Project.findById error:', err);
      throw err;
    }
  }
}

export default Project;
