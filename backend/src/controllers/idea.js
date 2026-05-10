'use strict';
const async = require("async");
const Idea = require('../models/idea');
const User = require('../models/user');
const Place = require('../models/place');
const Invite = require('../models/invite');
const Project = require('../models/project');

exports.create = function(req, res) {
    const idea = new Idea({...req.body, passportId: req.passport?.id });
    Idea.create(idea, function(err, ideaId) {
        res.json(ideaId);
    });
};

exports.update = function(req, res) {
    const obj = new Idea(req.body)
    Idea.update(req.params.id, obj, function() {
        res.json({ error:false, message: 'Идея обновлена' });
    });
};
exports.delete = function(req, res) {
    Idea.findById(req.params.id, function(err, idea) {
        if (err) return res.json({error: true, message: 'Идея с данным номером не существует'});
        if (req.passport.id !== idea.passportId) return res.json({error: true, message: "Вы не родитель, чтобы принимать решение по удалению идеи ребенка"});

        Idea.delete(req.params.id, function () {
            res.json({error: false, message: 'Идея удалена'});
        });
    })
};

exports.findAll = function(req, res) {
    Idea.findAll({...req.query, passportId: req.passport?.id }, function(err, ideas) {
        const userIds = [...new Set(ideas.map(m=>m.userId))]

        async.map(ideas.map(i=>i.id), Invite.findByIdeaId, function(err, invites) {
            async.map(userIds, User.findById, function(err, users) {
                const usersMap = new Map(users.map((user, index) => [userIds[index], user]));

                res.send(ideas.map((idea, index)=>({
                    ...idea,
                    user: usersMap.get(idea.userId),
                    invites: invites[index]
                })));
            });
        });
    });
};
exports.findById = function(req, res) {
    Idea.findById(req.params.id, function(err, idea) {
        if (!idea) {
            res.status(400).send({ error:true, message: 'Идея с таким номером не найден' });
        } else {
            Invite.findByIdeaId(idea.id, function(err, invites) {
                async.map(invites.map(m => m.projectId), Project.findById, function(err, projects) {
                    const placeIds = [...new Set(projects.map(m=>m.placeId))]

                    async.map(placeIds, Place.findById, function(err, places) {
                        const placesMap = new Map(places.map((place, index) => [placeIds[index], place]));

                        res.send({
                            ...idea,
                            invites: invites?.map((m, index) => ({ ...m, project: { ...projects[index], place: placesMap.get(projects[index].placeId)} })),
                        });
                    })
                })
            })
        }
    });
};

