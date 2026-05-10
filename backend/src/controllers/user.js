'use strict';
const User = require('../models/user');
const Passport = require('../models/passport');
const Participation = require('../models/participation');

exports.create = function(req, res) {
    const user = new User({...req.body, passportId: req.passport.id });
    User.create(user, function(err, userId) {
        res.json(userId);
    });
};

// Обновление участника
exports.update = function(req, res) {
    User.update(new User(req.body), function() {
        res.json({ error:false, message: 'Обновление участника' });
    });
};

exports.delete = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) { return res.json({error:true,message: "Ребенок не существует"}); }
        if (user.passportId !== req.passport.id) { return res.json({ error: true, message: "Нет прав на удаление" }); }

        Participation.deleteByUserId(user.id, function () {
            User.delete( req.params.id, function() {
                res.json({ error:false, message: 'Удаление участника и его участий в проектах' });
            });
        });
    })
};

// Участник
exports.findById = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        res.send(user);
    });
};