'use strict';

const Project = require('../models/project');
const User = require('../models/user');
const Passport = require('../models/passport');
const Visit = require('../models/visit');
const Meet = require('../models/meet');
const Place = require('../models/place');
const Participation = require('../models/participation');
const callModel = require('../utils/callModel');

exports.create = async function (req, res) {
  try {
    const project = new Project({ ...req.body, passportId: req.passport?.id });
    const projectId = await callModel(Project.create, project);

    res.json(projectId);
  } catch (err) {
    console.error('project.create error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось создать проект',
    });
  }
};

exports.update = async function (req, res) {
  try {
    const obj = new Project(req.body);

    await callModel(Project.update, req.params.id, obj);

    res.json({ error: false, message: 'Проект обновлен' });
  } catch (err) {
    console.error('project.update error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось обновить проект',
    });
  }
};

exports.delete = async function (req, res) {
  try {
    const project = await callModel(Project.findById, req.params.id);

    if (!project) {
      return res.json({
        error: true,
        message: 'Проект с данным номером не существует',
      });
    }

    if (project.passportId !== req.passport.id) {
      return res.json({
        error: true,
        message: 'Вы не владелец проекта, чтобы принимать решение по удалению',
      });
    }

    const meets = await callModel(Meet.findByProjectId, project.id);

    await Promise.all(meets.map(meet => callModel(Meet.delete, meet.id)));
    await callModel(Project.delete, project.id);

    res.json({ error: false, message: 'Проект удален' });
  } catch (err) {
    console.error('project.delete error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось удалить проект',
    });
  }
};

exports.findAll = async function (req, res) {
  try {
    const projects = await callModel(Project.findAll, {
      ...req.query,
      passportId: req.passport?.id,
    });

    const [places, participations, recommendMeets] = await Promise.all([
      Promise.all(projects.map(project => callModel(Place.findById, project.placeId))),
      Promise.all(projects.map(project => callModel(Participation.findByProjectId, project.id))),
      Promise.all(
        projects.map(project => callModel(Meet.findRecommendationByProjectId, project.id)),
      ),
    ]);

    res.send(
      projects.map((project, index) => ({
        ...project,
        place: places[index],
        participations: participations[index],
        recommendMeet: recommendMeets[index],
      })),
    );
  } catch (err) {
    console.error('project.findAll error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось получить проекты',
    });
  }
};

exports.findById = async function (req, res) {
  try {
    const project = await callModel(Project.findById, req.params.id);

    if (!project) {
      return res.status(400).send({
        error: true,
        message: 'Проект с таким номером не найден',
      });
    }

    const [place, passport, participations, meets] = await Promise.all([
      callModel(Place.findById, project.placeId),
      callModel(Passport.findById, project.passportId),
      callModel(Participation.findByProjectId, project.id),
      callModel(Meet.findByProjectId, project.id),
    ]);

    const [users, visits, visitUsers] = await Promise.all([
      Promise.all(
        participations.map(participation => callModel(User.findById, participation.userId)),
      ),
      Promise.all(meets.map(meet => callModel(Visit.findByMeet, meet))),
      Promise.all(meets.map(meet => callModel(User.findByMeet, meet))),
    ]);

    res.send({
      ...project,
      passport,
      place,
      meets: meets.map((meet, meetIndex) => ({
        ...meet,
        visits: visits[meetIndex].map((visit, visitIndex) => ({
          ...visit,
          user: visitUsers[meetIndex][visitIndex],
        })),
      })),
      participations: participations.map((participation, participationIndex) => ({
        ...participation,
        user: users[participationIndex],
      })),
    });
  } catch (err) {
    console.error('project.findById error:', err);

    res.status(500).send({
      error: true,
      message: 'Не удалось получить проект',
    });
  }
};

exports.meta = async function (req, res) {
  try {
    const project = await callModel(Project.findById, req.params.id);

    if (!project) {
      return res.status(404).json({
        error: true,
        message: 'Проект не существует',
      });
    }

    res.json({
      title: project.title + ' | Quantum',
      description: project.description,
      ogSiteName: 'Quantum | Проекты',
      ogType: 'article',
      ogTitle: project.title,
      ogDescription: project.description,
      ogImage: project.image,
    });
  } catch (err) {
    console.error('project.meta error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось получить meta проекта',
    });
  }
};
