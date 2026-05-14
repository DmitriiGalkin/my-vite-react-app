'use strict';
const async = require('async');
const Project = require('../models/project');
const User = require('../models/user');
const Passport = require('../models/passport');
const Visit = require('../models/visit');
const Meet = require('../models/meet');
const Place = require('../models/place');
const Participation = require('../models/participation');

exports.create = function (req, res) {
  const project = new Project({ ...req.body, passportId: req.passport?.id });
  Project.create(project, function (err, projectId) {
    res.json(projectId);
  });
};

exports.update = function (req, res) {
  const obj = new Project(req.body);
  Project.update(req.params.id, obj, function () {
    res.json({ error: false, message: 'Проект обновлен' });
  });
};
exports.delete = function (req, res) {
  Project.findById(req.params.id, function (err, project) {
    if (err) res.json({ error: true, message: 'Проект с данным номером не существует' });
    if (project.passportId !== req.passport.id)
      res.json({
        error: true,
        message: 'Вы не владелец проекта, чтобы принимать решение по удалению',
      });

    Meet.findByProjectId(project.id, function (err, meets) {
      async.map(
        meets.map(m => m.id),
        Meet.delete,
        function () {
          Project.delete(project.id, function () {
            res.json({ error: false, message: 'Проект удален' });
          });
        },
      );
    });
  });
};

exports.findAll = async (req, res) => {
  console.log(req.passport, 'req.passport');
  try {
    Project.findAll({ ...req.query, passportId: req.passport?.id }, function (err, projects) {
      console.log(projects, 'projects');
      async.map(
        projects.map(p => p.placeId),
        Place.findById,
        function (err, places) {
          async.map(
            projects.map(p => p.id),
            Participation.findByProjectId,
            function (err, participations) {
              async.map(
                projects.map(p => p.id),
                Meet.findRecommendationByProjectId,
                function (err, recommendMeets) {
                  res.send(
                    projects.map((p, index) => ({
                      ...p,
                      place: places[index],
                      participations: participations[index],
                      recommendMeet: recommendMeets[index],
                    })),
                  );
                },
              );
            },
          );
        },
      );
    });
  } catch (err) {
    res.end('error page');
  }
};

function callModel(method, ...args) {
  return new Promise((resolve, reject) => {
    method(...args, function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
}

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
    console.log(participations, 'participations');
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
        ...users[participationIndex],
      })),
    });
  } catch (err) {
    console.error(err);

    res.status(500).send({
      error: true,
      message: 'Не удалось получить проект',
    });
  }
};

exports.meta = function (req, res) {
  Project.findById(req.params.id, function (err, project) {
    if (err) return res.json({ error: true, message: 'Проект не существует' });

    res.json({
      title: project.title + ' | Quantum',
      description: project.description,
      ogSiteName: 'Quantum | Проекты',
      ogType: 'article',
      ogTitle: project.title,
      ogDescription: project.description,
      ogImage: project.image,
    });
  });
};
