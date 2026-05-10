'use strict';
const Invite = require('../models/invite');
const Project = require('../models/project');
const Participation = require('../models/participation');

exports.create = function(req, res) {
    Project.findById(req.body.projectId, function(err) {
        if (err) { return res.json({error:true, message: "Проект не найден"}); }
        const invite = new Invite(req.body);
        Invite.create(invite, function(err, inviteId) {
            res.json(inviteId);
        });
    })
};

exports.accept = function(req, res) {
    Invite.findById(req.params.id, function(err, invite) {
        if (err) { return res.json({error:true,message:"Приглашение не существует"}); }

        Invite.accept(invite.id, function() {
            Participation.create({userId: invite.userId, projectId: invite.projectId}, function() {
                res.json({ error:false, message: 'Приглашение в проект принято и участие добавлено' });
            });
        });
    })
};

exports.delete = function(req, res) {
    Invite.findById(req.params.id, function(err, invite) {
        if (err) { return res.json({error:true,message:"Приглашение не существует"}); }
        //             if (!req.users.map(u=>u.id).includes(participation.userId) && project.passportId !== req.passport.id) { return res.json({ error: true, message: "Нет прав на удаление" }); }

        Invite.delete(invite.id, function() {
            res.json({ error:false, message: 'Удаление приглашения в проект' });
        });
    });
};
