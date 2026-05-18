// controllers/userController.js
// 'use strict';

const User = require('../models/user');
const Participation = require('../models/participation');

exports.create = async (req, res) => {
  try {
    // Добавляем passportId из авторизованного пользователя
    const userData = { ...req.body, passportId: req.passport.id };

    // Прямой вызов метода модели. Он вернет ID созданного пользователя.
    const userId = await User.create(userData);

    // Возвращаем успех с ID (или весь объект, по желанию)
    res.status(201).json({ message: 'Участник создан', id: userId });
  } catch (err) {
    console.error('user.create error:', err);
    res.status(500).json({ error: true, message: 'Не удалось создать участника' });
  }
};

exports.update = async (req, res) => {
  try {
    // Создаем экземпляр модели из тела запроса
    const userToUpdate = new User(req.body);

    // Прямой вызов метода обновления. Предполагаем, что ID уже есть в req.body.
    await User.update(userToUpdate);

    res.json({ error: false, message: 'Участник успешно обновлен' });
  } catch (err) {
    console.error('user.update error:', err);
    res.status(500).json({ error: true, message: 'Не удалось обновить участника' });
  }
};

exports.delete = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentPassportId = req.passport.id;

    // 1. Проверяем, существует ли пользователь
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'Участник не найден' });
    }

    // 2. Проверяем права доступа (владелец ли пытается удалить)
    if (user.passportId !== currentPassportId) {
      return res.status(403).json({ error: true, message: 'Нет прав на удаление этого участника' });
    }

    // 3. Удаляем связанные участия в проектах (каскадное удаление)
    await Participation.deleteByUserId(userId);

    // 4. Удаляем самого пользователя (логическое удаление)
    await User.delete(userId);

    res.json({ error: false, message: 'Участник и его участия в проектах удалены' });
  } catch (err) {
    console.error('user.delete error:', err);
    res.status(500).json({ error: true, message: 'Не удалось удалить участника' });
  }
};

exports.findById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: true, message: 'Участник не найден' });
    }

    res.json(user);
  } catch (err) {
    console.error('user.findById error:', err);
    res.status(500).json({ error: true, message: 'Не удалось получить данные участника' });
  }
};
