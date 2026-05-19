import Project from '../models/project.js';
import User from '../models/user.js';
import Passport from '../models/passport.js';
import Visit from '../models/visit.js';
import Meet from '../models/meet.js';
import Place from '../models/place.js';
import Participation from '../models/participation.js';

export default {
  create: async (req, res) => {
    try {
      // Добавляем ID создателя из объекта авторизации
      const projectData = { ...req.body, passportId: req.passport?.id };
      const result = await Project.create(projectData);
      res.status(201).json({ message: 'Проект создан', id: result.insertId });
    } catch (err) {
      console.error('project.create error:', err);
      res.status(500).json({ error: 'Ошибка при создании проекта' });
    }
  },
  update: async (req, res) => {
    try {
      const obj = new Project(req.body);
      await Project.update(req.params.id, obj);
      res.json({ error: false, message: 'Проект обновлен' });
    } catch (err) {
      console.error('project.update error:', err);
      res.status(500).json({ error: true, message: 'Не удалось обновить проект' });
    }
  },
  delete: async (req, res) => {
    try {
      const projectId = req.params.id;
      const userId = req.passport.id;

      // Проверяем, существует ли проект
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      // Проверяем права доступа (владелец ли пользователь)
      if (project.passportId !== userId) {
        return res.status(403).json({ error: true, message: 'Недостаточно прав для удаления' });
      }

      // Удаляем связанные встречи (Meets)
      const meets = await Meet.findByProjectId(projectId);
      await Promise.all(meets.map(meet => Meet.delete(meet.id)));

      // Удаляем сам проект (логическое удаление)
      await Project.delete(projectId);

      res.json({ error: false, message: 'Проект удален' });
    } catch (err) {
      console.error('project.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить проект' });
    }
  },

  findAll: async (req, res) => {
    try {
      // Передаем параметры запроса и ID текущего пользователя
      const params = { ...req.query, passportId: req.passport?.id };
      const projects = await Project.findAll(params);

      // Получаем дополнительные данные для каждого проекта параллельно
      const [places, participationsArr, recommendMeetsArr] = await Promise.all([
        // 1. Места (Places)
        Promise.all(projects.map(p => Place.findById(p.placeId))),

        // 2. Участники (Participations + Users)
        Promise.all(projects.map(p => Participation.findByProjectId(p.id))),

        // 3. Рекомендации (Meets + Visits + Users)
        Promise.all(projects.map(p => Meet.findRecommendationByProjectId(p.id))),
      ]);

      // Формируем итоговый ответ, объединяя данные
      const response = projects.map((project, index) => ({
        ...project,
        place: places[index],
        participations: participationsArr[index],
        recommendMeet: recommendMeetsArr[index],
      }));

      res.json(response);
    } catch (err) {
      console.error('project.findAll error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить проекты' });
    }
  },

  findById: async (req, res) => {
    try {
      const projectId = req.params.id;

      // Получаем базовую информацию о проекте
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      // Получаем все связанные данные параллельно для ускорения
      const [place, passport] = await Promise.all([
        Place.findById(project.placeId),
        Passport.findById(project.passportId),
      ]);

      const [participations, meets] = await Promise.all([
        Participation.findByProjectId(projectId),
        Meet.findByProjectId(projectId),
      ]);

      // Получаем пользователей для участников проекта
      const usersForParticipations = await Promise.all(
        participations.map(p => User.findById(p.userId)),
      );

      // Получаем данные для встреч (Visits и их Users)
      const meetsWithDetails = await Promise.all(
        meets.map(async meet => {
          const [visits, usersForVisits] = await Promise.all([
            Visit.findByMeet(meet.id),
            User.findByMeet(meet.id),
          ]);

          // Добавляем пользователя к каждому визиту
          const visitsWithUsers = visits.map((visit, idx) => ({
            ...visit,
            user: usersForVisits[idx],
          }));

          return { ...meet, visits: visitsWithUsers };
        }),
      );

      // Формируем финальный объект ответа
      res.json({
        ...project,
        passport,
        place,
        meets: meetsWithDetails,
        participations: participations.map((p, idx) => ({
          ...p,
          user: usersForParticipations[idx],
        })),
      });
    } catch (err) {
      console.error('project.findById error:', err);
      res.status(500).send({ error: true, message: 'Не удалось получить проект' });
    }
  },

  meta: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не существует' });
      }

      res.json({
        title: `${project.title} | Quantum`,
        description: project.description,
        ogSiteName: 'Quantum | Проекты',
        ogType: 'article',
        ogTitle: project.title,
        ogDescription: project.description,
        ogImage: project.image,
      });
    } catch (err) {
      console.error('project.meta error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить meta проекта' });
    }
  },
};
