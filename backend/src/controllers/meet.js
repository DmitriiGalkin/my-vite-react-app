'use strict';
const Meet = require('../models/meet');
const User = require('../models/user');
const Visit = require('../models/visit');
const Place = require('../models/place');
const Project = require('../models/project');
const callModel = require('../utils/callModel');

exports.create = async function (req, res) {
  try {
    const meet = new Meet({ ...req.body, passportId: req.passport.id });
    const meetId = await callModel(Meet.create, meet);

    res.json(meetId);
  } catch (err) {
    console.error('meet.create error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось создать встречу',
    });
  }
};

exports.update = async function (req, res) {
  try {
    const obj = new Meet(req.body);

    await callModel(Meet.update, req.params.id, obj);

    res.json({ error: false, message: 'Встреча обновлен' });
  } catch (err) {
    console.error('meet.update error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось обновить встречу',
    });
  }
};

exports.delete = async function (req, res) {
  try {
    const meet = await callModel(Meet.findById, req.params.id);

    if (!meet) {
      return res.json({ error: true, message: 'Встреча не существует' });
    }

    if (meet.passportId !== req.passport.id) {
      return res.json({ error: true, message: 'Нет прав на удаление' });
    }

    await callModel(Meet.delete, req.params.id);

    res.json({ error: false, message: 'Удаление встречи' });
  } catch (err) {
    console.error('meet.delete error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось удалить встречу',
    });
  }
};

exports.toggleUserMeet = async function (req, res) {
  try {
    const userMeet = await callModel(Visit.findById, req.user.id, req.params.meetId);

    if (userMeet) {
      await callModel(Visit.delete, req.user.id, req.params.meetId);

      return res.json({ error: false, message: 'Удаление участника из встречи' });
    }

    const createdUserMeet = new Visit({ ...req.params, userId: req.user.id });

    await callModel(Visit.create, createdUserMeet);

    res.json({ error: false, message: 'Добавление участника на встречу' });
  } catch (err) {
    console.error('meet.toggleUserMeet error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось изменить участие во встрече',
    });
  }
};

exports.findAll = async function (req, res) {
  try {
    const meets =
      req.query.isForPassport === 'true'
        ? await callModel(Meet.findByPassportId, req.passport.id)
        : await callModel(Meet.findByUserId, req.query.userId);

    const projects = await Promise.all(
      meets.map(meet => callModel(Project.findById, meet.projectId)),
    );

    const places = await Promise.all(
      projects.map(project => callModel(Place.findById, project.placeId)),
    );

    const visits = await Promise.all(meets.map(meet => callModel(Visit.findByMeet, meet)));

    const users = await Promise.all(meets.map(meet => callModel(User.findByMeet, meet)));

    res.send(
      meets.map((meet, index) => ({
        ...meet,
        visits: visits[index].map((visit, visitIndex) => ({
          ...visit,
          user: users[index][visitIndex],
        })),
        project: {
          ...projects[index],
          place: places[index],
        },
      })),
    );
  } catch (err) {
    console.error('meet.findAll error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось получить встречи',
    });
  }
};

exports.findById = async function (req, res) {
  try {
    const meet = await callModel(Meet.findById, req.params.id);

    if (!meet) {
      return res.status(400).send({
        error: true,
        message: 'Встреча с таким номером не найдена',
      });
    }

    const project = await callModel(Project.findById, meet.projectId);
    const place = await callModel(Place.findById, project.placeId);
    const visits = await callModel(Visit.findByMeet, meet);

    const visitUsers = await Promise.all(
      visits.map(visit => callModel(User.findById, visit.userId)),
    );

    res.send({
      ...meet,
      visits: visits.map((visit, index) => ({
        ...visit,
        user: visitUsers[index],
      })),
      project: {
        ...project,
        place,
      },
    });
  } catch (err) {
    console.error('meet.findById error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось получить встречу',
    });
  }
};
