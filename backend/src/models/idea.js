'use strict';
var dbConn = require('../db');

var Idea = function(data){
    this.title = data.title;
    this.description = data.description;
    this.userId = data.userId; // Создатель идеи
    this.passportId = data.passportId; // Паспорт создателя идеи
    this.latitude = data.latitude;
    this.longitude = data.longitude;
};

Idea.create = function (data, result) {
    dbConn.query("INSERT INTO idea set ?", data, function (err, res) {
        if (err) {console.log(err,'err')}
        result(err, res?.insertId);
    });
};

Idea.update = function(id, data, result){
    dbConn.query("UPDATE idea SET title=?, description=? WHERE id = ?", [data.title, data.description, id], function (err, res) {
        result(null, res);
    });
};

Idea.delete = function(id, result){
    dbConn.query(`UPDATE idea SET deleted = NOW() WHERE id = ?`, id, function (err, res) {
        result(null, res);
    });
};

const RADIUS = 100000

Idea.findAll = function (params, result) {
    let sql = ''
    if (params.variant === 'self') {
        sql = `SELECT idea.* FROM idea WHERE userId = ${params.userId}`
    } else {
        const dist = params.latitude && params.longitude && "ST_Distance_Sphere(point(" + params.latitude + ", " + params.longitude + "), point(latitude, longitude))"
        let where = ''
        if (params.variant || params.ageFrom || params.ageTo || params.userId || (params.latitude && params.longitude)) {
            where += 'WHERE'
            where =' LEFT JOIN user ON user.id = idea.userId ' + where
            where += (params.deleted === 'true' ? ' idea.deleted IS NOT NULL OR idea.deleted IS NULL' : ' idea.deleted IS NULL')
            where += (params.ageFrom) ? ' AND user.age > ' + params.ageFrom : ''
            where += (params.ageTo) ? ' AND user.age < '+ params.ageTo : ''
            where += (params.userId) ? ' AND idea.userId = '+ params.userId : ''
            where += (params.latitude && params.longitude) ? ` AND ${dist} < ` + RADIUS : ''
            where = where + ((params.variant === 'recommendation' && params.passportId) ? ' AND idea.passportId != ' + params.passportId : '')
        }

        sql = `SELECT idea.* ${dist ? `, ${dist} AS distance` : ''} FROM idea ${where}`
    }
    dbConn.query(sql, function (err, res) {
        result(null, res || []);
    });
};
Idea.findById = function (id, result) {
    dbConn.query("SELECT * FROM idea WHERE id = ?", id, function (err, res) {
        result(null, res[0]);
    });
};

module.exports = Idea;