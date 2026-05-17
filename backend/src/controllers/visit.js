'use strict';

const Meet = require('../models/meet');
const Visit = require('../models/visit');
const Project = require('../models/project');
const Place = require('../models/place');
const callModel = require('../utils/callModel');

function getPassportUserIds(req) {
  return (req.users || []).map(user => user.id);
}

async function findVisitAndMeet({ visitId }) {
  const visit = await callModel(Visit.findById, visitId);

  if (!visit) {
    const error = new Error('Участие не существует');
    error.status = 404;
    throw error;
  }

  const meet = await callModel(Meet.findById, visit.meetId);

  if (!meet) {
    const error = new Error('Встреча не найдена');
    error.status = 404;
    throw error;
  }

  return {
    visit,
    meet,
  };
}

async function updateVisitState({ req, res, updater, successMessage, permissionMessage }) {
  try {
    const { visit, meet } = await findVisitAndMeet({
      visitId: req.params.id,
    });

    if (meet.passportId !== req.passport.id) {
      return res.json({
        error: true,
        message: permissionMessage,
      });
    }

    await callModel(updater, visit.id);

    res.json({
      error: false,
      message: successMessage,
    });
  } catch (err) {
    console.error('visit.updateVisitState error:', err);

    res.status(err.status || 500).json({
      error: true,
      message: err.message || 'Не удалось обновить участие',
    });
  }
}

exports.create = async function (req, res) {
  try {
    const meet = await callModel(Meet.findById, req.body.meetId);

    if (!meet) {
      return res.json({
        error: true,
        message: 'Встреча не найдена',
      });
    }

    const currentVisit = await callModel(
      Visit.findByUserAndMeetIds,
      req.body.userId,
      req.body.meetId,
    );

    if (currentVisit) {
      return res.json({
        error: true,
        message: 'Участие уже существует',
      });
    }

    if (!getPassportUserIds(req).includes(req.body.userId)) {
      return res.json({
        error: true,
        message: 'Нельзя добавлять участника отличного от себя',
      });
    }

    const visit = new Visit(req.body);

    await callModel(Visit.create, visit);

    res.json({
      error: false,
      message: 'Участие создано',
    });
  } catch (err) {
    console.error('visit.create error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось создать участие',
    });
  }
};

exports.delete = async function (req, res) {
  try {
    const { visit } = await findVisitAndMeet({
      visitId: req.params.id,
    });

    if (!getPassportUserIds(req).includes(visit.userId)) {
      return res.json({
        error: true,
        message: 'Нет прав на удаление',
      });
    }

    await callModel(Visit.delete, req.params.id);

    res.json({
      error: false,
      message: 'Удаление участника из встречи',
    });
  } catch (err) {
    console.error('visit.delete error:', err);

    res.status(err.status || 500).json({
      error: true,
      message: err.message || 'Не удалось удалить участие',
    });
  }
};

exports.findAll = async function (req, res) {
  try {
    const visits = await callModel(Visit.findByUserId, req.query.userId);
    const meets = await Promise.all(visits.map(visit => callModel(Meet.findById, visit.meetId)));

    const projectIds = [...new Set(meets.map(meet => meet.projectId))];
    const projects = await Promise.all(
      projectIds.map(projectId => callModel(Project.findById, projectId)),
    );

    const projectsMap = new Map(projectIds.map((projectId, index) => [projectId, projects[index]]));

    const placeIds = [...new Set(projects.map(project => project.placeId))];
    const places = await Promise.all(placeIds.map(placeId => callModel(Place.findById, placeId)));
    const placesMap = new Map(placeIds.map((placeId, index) => [placeId, places[index]]));

    res.send(
      visits.map((visit, index) => {
        const meet = meets[index];
        const project = projectsMap.get(meet.projectId);

        return {
          ...visit,
          meet: {
            ...meet,
            project: {
              ...project,
              place: placesMap.get(project.placeId),
            },
          },
        };
      }),
    );
  } catch (err) {
    console.error('visit.findAll error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось получить посещения',
    });
  }
};
