'use strict';

const Participation = require('../models/participation');
const Project = require('../models/project');
const callModel = require('../utils/callModel');

function getPassportUserIds(req) {
  return (req.users || []).map(user => user.id);
}

exports.create = async function (req, res) {
  try {
    const project = await callModel(Project.findById, req.body.projectId);

    if (!project) {
      return res.json({
        error: true,
        message: 'Проект не найден',
      });
    }

    const currentParticipation = await callModel(
      Participation.findByUserAndProjectIds,
      req.body.userId,
      req.body.projectId,
    );

    if (currentParticipation) {
      return res.json({
        error: true,
        message: 'Вы уже состоите в проекте',
      });
    }

    if (!getPassportUserIds(req).includes(req.body.userId)) {
      return res.json({
        error: true,
        message: 'Нельзя добавлять участника отличного от себя',
      });
    }

    const participation = new Participation(req.body);
    const participationId = await callModel(Participation.create, participation);

    res.json(participationId);
  } catch (err) {
    console.error('participation.create error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось создать участие в проекте',
    });
  }
};

exports.delete = async function (req, res) {
  try {
    const participation = await callModel(Participation.findById, req.params.id);

    if (!participation) {
      return res.json({
        error: true,
        message: 'Участие не существует',
      });
    }

    const project = await callModel(Project.findById, participation.projectId);

    if (!project) {
      return res.json({
        error: true,
        message: 'Проект не найден',
      });
    }

    const isOwnChild = getPassportUserIds(req).includes(participation.userId);
    const isProjectOwner = project.passportId === req.passport.id;

    if (!isOwnChild && !isProjectOwner) {
      return res.json({
        error: true,
        message: 'Нет прав на удаление',
      });
    }

    await callModel(Participation.delete, participation.id);

    res.json({
      error: false,
      message: 'Удаление участия в проекте',
    });
  } catch (err) {
    console.error('participation.delete error:', err);

    res.status(500).json({
      error: true,
      message: 'Не удалось удалить участие в проекте',
    });
  }
};
