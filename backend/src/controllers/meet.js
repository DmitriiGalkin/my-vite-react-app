// controllers/meetController.js
import Meet from '../models/meet.js';
import Visit from '../models/visit.js';

// Все функции собраны в один объект для экспорта по умолчанию

export default {
  create: async (req, res) => {
    try {
      const meetData = { ...req.body, passportId: req.passport.id };
      const meetId = await Meet.create(meetData);
      res.status(201).json({ message: 'Встреча создана', id: meetId });
    } catch (err) {
      console.error('meet.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать встречу' });
    }
  },

  update: async (req, res) => {
    try {
      // Обновляем данные напрямую из тела запроса
      await Meet.update(req.params.id, req.body);
      res.json({ error: false, message: 'Встреча обновлена' });
    } catch (err) {
      console.error('meet.update error:', err);
      res.status(500).json({ error: true, message: 'Не удалось обновить встречу' });
    }
  },

  // Ключ в объекте должен быть 'delete', чтобы использовать его как meet.delete
  delete: async (req, res) => {
    try {
      const meet = await Meet.findById(req.params.id);

      if (!meet) {
        return res.status(404).json({ error: true, message: 'Встреча не существует' });
      }

      if (meet.passportId !== req.passport.id) {
        return res.status(403).json({ error: true, message: 'Нет прав на удаление' });
      }

      await Meet.delete(req.params.id);
      res.json({ error: false, message: 'Встреча удалена' });
    } catch (err) {
      console.error('meet.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить встречу' });
    }
  },

  toggleUserMeet: async (req, res) => {
    try {
      const existingVisit = await Visit.findByUserAndMeetIds(req.user.id, req.params.meetId);

      if (existingVisit) {
        await Visit.delete(existingVisit.id);
        return res.json({ error: false, message: 'Участник удален с встречи' });
      } else {
        await Visit.create({ userId: req.user.id, meetId: req.params.meetId });
        return res.json({ error: false, message: 'Участник добавлен на встречу' });
      }
    } catch (err) {
      console.error('meet.toggleUserMeet error:', err);
      res.status(500).json({ error: true, message: 'Не удалось изменить участие во встрече' });
    }
  },

  findAll: async (req, res) => {
    try {
      const isForPassport = req.query.isForPassport === 'true';
      const userIdForQuery = isForPassport ? req.passport.id : req.query.userId;

      const sql = `
        SELECT 
          m.*,
          p.id AS project_id, p.title AS project_title, p.placeId AS project_placeId,
          pl.id AS place_id, pl.title AS place_title,
          v.id AS visit_id, v.userId AS visit_userId,
          u.id AS user_id, u.title AS user_title
        FROM meet m
        LEFT JOIN project p ON p.id = m.projectId AND p.deletedAt IS NULL
        LEFT JOIN place pl ON pl.id = p.placeId
        LEFT JOIN visit v ON v.meetId = m.id
        LEFT JOIN user u ON u.id = v.userId AND u.deletedAt IS NULL
        WHERE ${isForPassport ? 'm.passportId = ?' : 'EXISTS (SELECT 1 FROM participation WHERE projectId = m.projectId AND userId = ?)'}
        ORDER BY m.startedAt DESC
      `;

      const [rows] = await Meet.pool.query(sql, [userIdForQuery]);

      const meetsMap = new Map();

      rows.forEach(row => {
        if (!meetsMap.has(row.id)) {
          meetsMap.set(row.id, {
            ...row,
            id: row.id,
            project: row.project_id
              ? {
                  id: row.project_id,
                  title: row.project_title,
                  place: row.place_id ? { id: row.place_id, title: row.place_title } : null,
                }
              : null,
            visits: [],
          });
        }

        if (row.visit_id) {
          meetsMap.get(row.id).visits.push({
            id: row.visit_id,
            user: row.user_id ? { id: row.user_id, title: row.user_title } : null,
          });
        }
      });

      const result = Array.from(meetsMap.values());
      res.json(result);
    } catch (err) {
      console.error('meet.findAll error:', err);
      res
        .status(500)
        .json({ error: true, message: 'Ошибка при выполнении запроса к базе данных.' });
    }
  },

  findById: async (req, res) => {
    try {
      const sql = `
        SELECT
          m.*,
          p.id AS project_id, p.title AS project_title, p.placeId AS project_placeId,
          pl.id AS place_id, pl.title AS place_title,
          v.id AS visit_id, v.userId AS visit_userId,
          u.id AS user_id, u.title AS user_title
        FROM meet m
        LEFT JOIN project p ON p.id = m.projectId AND p.deletedAt IS NULL
        LEFT JOIN place pl ON pl.id = p.placeId
        LEFT JOIN visit v ON v.meetId = m.id
        LEFT JOIN user u ON u.id = v.userId AND u.deletedAt IS NULL
        WHERE m.id = ?
      `;

      const [rows] = await Meet.pool.query(sql, [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: true, message: 'Встреча не найдена' });
      }

      const meetRow = rows[0];

      const result = {
        ...meetRow,
        id: meetRow.id,
        project: meetRow.project_id
          ? {
              id: meetRow.project_id,
              title: meetRow.project_title,
              place: meetRow.place_id ? { id: meetRow.place_id, title: meetRow.place_title } : null,
            }
          : null,
        visits: [],
      };

      rows.forEach(row => {
        if (row.visit_id) {
          result.visits.push({
            id: row.visit_id,
            user: row.user_id ? { id: row.user_id, title: row.user_title } : null,
          });
        }
      });

      res.json(result);
    } catch (err) {
      console.error('meet.findById error:', err);
      res
        .status(500)
        .json({ error: true, message: 'Ошибка при выполнении запроса к базе данных.' });
    }
  },
};
