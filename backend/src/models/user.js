'use strict';
var dbConn = require('../db');

var User = function(user){
    this.id = user.id;
    this.passportId = user.passportId;
    this.title = user.title;
    this.age = user.age;
    this.image = user.image;
};

// Создание участника
User.create = function (user, result) {
    dbConn.query("INSERT INTO `user` set ?", user, function (err, res) {
        if (err) {
            console.log(err,'err')
        }
        result(null, res.insertId);
    });
};

// Обновление участника
User.update = function(user, result){
    dbConn.query("UPDATE user SET title=?, age=?, image=? WHERE id = ?", [user.title, user.age, user.image, user.id], function (err, res) {
        result(null, res);
    });
};

User.delete = function(id, result){
    dbConn.query(`UPDATE user SET deleted = NOW() WHERE id = ?`, id, function (err, res) {
        result(null, res);
    });
};

// Участник
User.findById = function (id, result) {
    dbConn.query("SELECT * from `user` where id = ?", id, function (err, res) {
        result(null, res?.length ? res[0] : undefined);
    });
};
// Участники по паспорту
User.findByPassportId = function (id, result) {
    dbConn.query("SELECT * from user where passportId = ? AND deleted IS NULL", id, function (err, res) {
        result(null, res || []);
    });
};
// Участник
User.findByEmail = function (email, result) {
    dbConn.query("SELECT * from user where email = ? ", email, function (err, res) {
        result(null, res?.length ? res[0] : undefined);
    });
};

const parse = (res) => {
    return res
}
// Участники встречи
User.findByMeet = function (meet, result) {
    dbConn.query("SELECT * from user LEFT JOIN visit ON user.id = visit.userId where meetId = ?", meet.id, function (err, res) {
        result(null, parse(res));
    });
};
// Организатор
User.findByProjectOne = function (project, result) {
    dbConn.query("SELECT * from user where id = ?", project.userId, function (err, res) {
        result(null, (res && res.length) ? parse(res)[0] : null);
    });
};

module.exports = User;