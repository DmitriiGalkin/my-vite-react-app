'use strict';
var dbConn = require('../db');

var Participation = function(data){
    this.userId = data.userId;
    this.projectId = data.projectId;
};

Participation.create = function (data, result) {
    dbConn.query("INSERT INTO participation set ?", data, function (err, res) {
        result(err, res.insertId);
    });
};

Participation.delete = function(id, result){
    dbConn.query(`DELETE FROM participation WHERE id = ?`, id, function (err, res) {
        result(null, res);
    });
};

Participation.deleteByUserId = function(id, result){
    dbConn.query(`DELETE FROM participation WHERE userId = ?`, id, function (err, res) {
        result(null, res);
    });
};

Participation.findById = function(id, result){
    dbConn.query("SELECT * FROM participation WHERE id = ?", [id], function (err, res) {
        result(null, res.length ? res[0] : undefined);
    });
};

Participation.findByIdeaId = function(id, result){
    dbConn.query("SELECT * FROM participation WHERE ideaId = ?", [id], function (err, res) {
        result(null, res.length ? res[0] : undefined);
    });
};

// Участия проекту
Participation.findByProjectId = function (id, result) {
    dbConn.query("SELECT * FROM participation WHERE projectId = ? ", id, function (err, res) {
        result(null, res);
    });
};

Participation.findByUserAndProjectIds = function(userId, projectId, result){
    dbConn.query("SELECT * FROM participation WHERE userId = ? AND projectId =?", [userId, projectId], function (err, res) {
        result(null, res.length ? res[0] : undefined);
    });
};

module.exports = Participation;