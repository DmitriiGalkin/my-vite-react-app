'use strict';
const Passport = require('../models/passport');
const User = require('../models/user');
var jwt = require('jsonwebtoken');

// Обновление родителя
exports.update = function(req, res) {
    if(req.body.constructor === Object && Object.keys(req.body).length === 0){
        res.status(400).send({ error:true, message: 'Please provide all required field' });
    }else{
        Passport.update(req.passport.id, new Passport(req.body), function() {
            res.json({ error:false, message: 'Обновление родителя' });
        });
    }
};
/**
 * С бека пришла авторизационная информация с токеном по пользователю,
 * надобно проверить есть ли такой пользователь у нас уже. Если нет то создать, если есть то просто прописать ему токен
 */
exports.googleLogin = function(req, res) {
    Passport.findByEmail(req.body.email, function(err, passport) {
        if (passport) {
            Passport.updateTokenById(req.body.access_token, passport.id, function() {
                res.send({ error: false, message: "Родитель обновлен" });
            });
        } else {
            const passport = new Passport({
                token: req.body.access_token,
                title: req.body.name,
                image: req.body.picture,
                email: req.body.email
            });
            if(req.body.constructor === Object && Object.keys(req.body).length === 0){
                res.status(400).send({ error:true, message: 'Сбой конструктора участника при создании участника через гугл' });
            } else {
                Passport.create(passport, function(err, data) {
                    res.send({ error: false, message: "Участник создан" });
                });
            }
        }
    })
};
// Авторизация участника
exports.login = function(req, res) {
    Passport.findById(1, function(err, passport) {
        // Если участник найден
        if(passport) {
            var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
            Passport.updateTokenById(token, passport.id, function() {
                res.send({ access_token: token });
            });
        }
    });
};
// Родитель
exports.findById = function(req, res) {
    Passport.findById(req.passport.id, function(err, passports) {
        res.send(passports && passports[0]);
    });
};
// Вся информация по паспорту
exports.all = function(req, res) {
    if (!req.passport) {
        return res.status(400).json({ error:true, message: "Паспорт отсутствует" });
    }
    User.findByPassportId(req.passport.id, function(err, users) {
        res.send({
            ...req.passport,
            users
        });
    });
};


/**
 * Подхватываем токен и авторизуем пользователя
 */
exports.usePassport = function(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        next()
    } else {
        Passport.findByAccessToken(token, function(err, passport) {
            if (passport) {
                req.passport = passport
                User.findByPassportId(passport.id, function(err, users) {
                    req.users = users
                    next()
                })
            } else {
                // Надо бы его разлогинить
                res.status(401).send({ error:true, message: 'Токен протух' });
            }
        });
    }
}