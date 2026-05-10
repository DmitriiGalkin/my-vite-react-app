'use strict';
const async = require("async");
const Meet = require('../models/meet');
const User = require('../models/user');
const Visit = require('../models/visit');
const Place = require('../models/place');
const Project = require('../models/project');

exports.create = function(req, res) {
    const meet = new Meet({...req.body, passportId: req.passport.id });
    Meet.create(meet, function(err, meetId) {
        // const userMeet = new Visit({meetId, userId: req.user.id});
        // Visit.create(userMeet, function() {
        //     res.json(meetId);
        // });
        res.json(meetId);
    });
};

exports.update = function(req, res) {
    const obj = new Meet(req.body)
    Meet.update(req.params.id, obj, function() {
        res.json({ error:false, message: 'Встреча обновлен' });
    });
};

exports.delete = function(req, res) {
    Meet.findById(req.params.id, function(err, meet) {
        if (err) { return res.json({error:true,message: "Встреча не существует"}); }
        if (meet.passportId !== req.passport.id) { return res.json({error:true,message: "Нет прав на удаление"}); }

        Meet.delete(req.params.id, function() {
            res.json({ error:false, message: 'Удаление встречи' });
        });
    })
};

// Добавление или удаление участника встречи
exports.toggleUserMeet = function(req, res) {
    Visit.findById(req.user.id, req.params.meetId, function(err, userMeet) {
        if (userMeet) {
            Visit.delete( req.user.id, req.params.meetId, function() {
                res.json({ error:false, message: 'Удаление участника из встречи' });
            });
        } else {
            const userMeet = new Visit({...req.params, userId: req.user.id});
            Visit.create(userMeet, function() {
                res.json({error:false,message:"Добавление участника на встречу"});
            });
        }
    })
};

exports.findAll = function(req, res) {
    const cb = function(err, meets) {
        async.map(meets.map(m=>m.projectId), Project.findById, function(err, meetsProject) {
            async.map(meetsProject.map(p=>p.placeId), Place.findById, function(err, meetsPlace) {
                async.map(meets, Visit.findByMeet, function(err, visits) {
                    async.map(meets, User.findByMeet, function(err, users) {
                        res.send(meets.map((p, index) => ({
                            ...p,
                            visits: visits[index].map((visit, index2) => ({...visit, user: users[index][index2]})),
                            project: {...meetsProject[index], place: meetsPlace[index]}
                        })));
                    });
                });
            });
        });
    }
    console.log(req.query, 'req.query')
    if (req.query.isForPassport === 'true') {
        console.log('req.query.isForPassport true')
        Meet.findByPassportId(req.passport.id, cb);
    } else {
        Meet.findByUserId(req.query.userId, cb);
    }
};

exports.findById = function(req, res) {
    Meet.findById(req.params.id, function(err, meet) {
        if (!meet) {
            res.status(400).send({ error:true, message: 'Встреча с таким номером не найдена' });
        } else {
            Project.findById(meet.projectId, function (err, project) {
                Place.findById(project.placeId, function(err, place) {
                    Visit.findByMeet(meet, function (err, visits) {
                        async.map(visits.map(v=>v.userId), User.findById, function(err, visitUsers) {
                            res.send({
                                ...meet,
                                visits: visits.map((visit, index) => ({ ... visit, user: visitUsers[index] })),
                                project: { ...project, place },
                            });
                        });
                    });
                })
            });
        }
    });
};
