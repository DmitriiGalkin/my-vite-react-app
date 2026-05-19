import Participation from '../models/participation.js';
import Project from '../models/project.js';

function getPassportUserIds(req) {
  return (req.users || []).map(user => user.id);
}

export default {
  create: async (req, res) => {
    try {
      // 1. Проверяем, существует ли проект
      const project = await Project.findById(req.body.projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      // 2. Проверяем, не состоит ли пользователь уже в проекте
      const currentParticipation = await Participation.findByUserAndProjectIds(
        req.body.userId,
        req.body.projectId,
      );
      if (currentParticipation) {
        return res.status(409).json({ error: true, message: 'Вы уже состоите в проекте' });
      }

      // 3. Проверяем права доступа (можно ли добавлять этого пользователя)
      if (!getPassportUserIds(req).includes(req.body.userId)) {
        return res
          .status(403)
          .json({ error: true, message: 'Нельзя добавлять участника отличного от себя' });
      }

      // 4. Создаем участие
      const participation = new Participation(req.body);
      const participationId = await Participation.create(participation);

      // Возвращаем ID созданной записи
      res.status(201).json(participationId);
    } catch (err) {
      console.error('participation.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать участие в проекте' });
    }
  },

  delete: async (req, res) => {
    try {
      // 1. Находим участие по ID из параметров запроса
      const participation = await Participation.findById(req.params.id);
      if (!participation) {
        return res.status(404).json({ error: true, message: 'Участие не существует' });
      }

      // 2. Находим проект для проверки прав владельца
      const project = await Project.findById(participation.projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Связанный проект не найден' });
      }

      // 3. Проверяем права доступа:
      // - Либо это собственный ребенок пользователя (isOwnChild)
      // - Либо пользователь является владельцем проекта (isProjectOwner)
      const isOwnChild = getPassportUserIds(req).includes(participation.userId);
      const isProjectOwner = project.passportId === req.passport.id;

      if (!isOwnChild && !isProjectOwner) {
        return res.status(403).json({ error: true, message: 'Нет прав на удаление' });
      }

      // 4. Удаляем участие
      await Participation.delete(participation.id);

      res.json({ error: false, message: 'Удаление участия в проекте' });
    } catch (err) {
      console.error('participation.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить участие в проекте' });
    }
  },
};
