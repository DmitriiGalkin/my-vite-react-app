'use strict';
var dbConn = require('../db');

var Passport = function(data){
    this.title = data.title;
    this.email = data.email;
    this.accessToken = data.accessToken;
};
// Создание родителя
Passport.create = function (user, result) {
    dbConn.query("INSERT INTO passport set ?", user, function (err, res) {
        result(null, res.insertId);
    });
};
// Обновление родителя
Passport.update = function(id, passport, result){
    dbConn.query("UPDATE passport SET title=? WHERE id = ?", [passport.title, id], function (err, res) {
        result(null, res);
    });
};
// Обновление токена
Passport.updateTokenById = function(token, id, result){
    dbConn.query("UPDATE passport SET accessToken=? WHERE id = ?", [token, id], function (err, res) {
        result(null, res);
    });
};
// Родитель по идентификатору
Passport.findById = function (id, result) {
    dbConn.query("SELECT * from passport where id = ? ", id, function (err, res) {
        result(null, res?.length ? res[0] : undefined);
    });
};
// Родитель по почте
Passport.findByEmail = function (email, result) {
    dbConn.query("SELECT * from passport where email = ? ", email, function (err, res) {
        result(null, res?.length ? res[0] : undefined);
    });
};

const parse = (res) => res

// Родитель по accessToken
Passport.findByAccessToken = function (accessToken, result) {
    dbConn.query("SELECT * from passport where accessToken = ? ", accessToken, function (err, res) {
        result(null, (res && res.length) ? parse(res)[0] : null);
    });
};

module.exports = Passport;