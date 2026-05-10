'use strict';
const Participation = require('../models/participation');
const Project = require('../models/project');

exports.create = function(req, res) {
    Project.findById(req.body.projectId, function(err) {
        if (err) { return res.json({error:true, message: "Проект не найден"}); }
        Participation.findByUserAndProjectIds(req.body.userId, req.body.projectId, function(err, currentParticipation) {
            if (currentParticipation) { return res.json({error:true,message:"Вы уже состоите в проекте"}); }
            // ТУТ еще нужна проверка что это ребенок данного родителя

            const participation = new Participation(req.body);
            Participation.create(participation, function(err, participationId) {
                res.json(participationId);
            });
        })
    })
};

exports.delete = function(req, res) {
    Participation.findById(req.params.id, function(err, participation) {
        if (err) { return res.json({error:true,message:"Участие не существует"}); }
        Project.findById(participation.projectId, function(err, project) {
            if (err) { return res.json({ error: true, message: "Проект не найден" }); }
            if (!req.users.map(u=>u.id).includes(participation.userId) && project.passportId !== req.passport.id) { return res.json({ error: true, message: "Нет прав на удаление" }); }

            Participation.delete(participation.id, function() {
                res.json({ error:false, message: 'Удаление участия в проекте' });
            });
        });
    });
};
