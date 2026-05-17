'use strict';

const User = require('../models/user');
const Participation = require('../models/participation');
const callModel = require('../utils/callModel');

exports.create = async function (req, res) {
  try {
    const user = new User({
      ...req.body,
      passportId: req.passport.id,
    });

    const userId = await callModel(User.create, user);

    res.json(userId);
  } catch (err) {
    console.error('user.create error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось создать участника',
    });
  }
};

// Обновление участника
exports.update = async function (req, res) {
  try {
    await callModel(User.update, new User(req.body));

    res.json({
      error: false,
      message: 'Обновление участника',
    });
  } catch (err) {
    console.error('user.update error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось обновить участника',
    });
  }
};

exports.delete = async function (req, res) {
  try {
    const user = await callModel(User.findById, req.params.id);

    if (!user) {
      return res.json({
        error: true,
        message: 'Ребенок не существует',
      });
    }

    if (user.passportId !== req.passport.id) {
      return res.json({
        error: true,
        message: 'Нет прав на удаление',
      });
    }

    await callModel(Participation.deleteByUserId, user.id);
    await callModel(User.delete, req.params.id);

    res.json({
      error: false,
      message: 'Удаление участника и его участий в проектах',
    });
  } catch (err) {
    console.error('user.delete error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось удалить участника',
    });
  }
};

// Участник
exports.findById = async function (req, res) {
  try {
    const user = await callModel(User.findById, req.params.id);

    res.send(user);
  } catch (err) {
    console.error('user.findById error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось получить участника',
    });
  }
};
