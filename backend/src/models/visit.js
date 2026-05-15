'use strict';
var dbConn = require('../db');

var Visit = function (data) {
  this.userId = data.userId;
  this.meetId = data.meetId;
};

Visit.create = function (newEmp, result) {
  dbConn.query(
    'INSERT INTO visit (userId, meetId) VALUES (?, ?)',
    [newEmp.userId, newEmp.meetId],
    function (err, res) {
      result(null, res.insertId);
    },
  );
};
Visit.delete = function (id, result) {
  dbConn.query(`DELETE FROM visit WHERE id = ${id}`, function (err, res) {
    result(null, res);
  });
};
Visit.findById = function (id, result) {
  dbConn.query('SELECT * FROM visit WHERE id = ?', [id], function (err, res) {
    result(null, res.length ? res[0] : undefined);
  });
};
Visit.findByUserId = function (userId, result) {
  dbConn.query(
    'SELECT visit.*, meet.startedAt FROM visit LEFT JOIN meet ON meet.id = visit.meetId WHERE userId = ? ORDER BY meet.startedAt DESC',
    [userId],
    function (err, res) {
      if (err) console.log(err, 'Visit.findByUserId.err');
      result(null, res.length ? res : []);
    },
  );
};
Visit.findByUserAndMeetIds = function (userId, meetId, result) {
  dbConn.query(
    'SELECT * FROM visit WHERE userId = ? AND meetId =?',
    [userId, meetId],
    function (err, res) {
      result(null, res.length ? res[0] : undefined);
    },
  );
};
Visit.findByMeet = function (meet, result) {
  dbConn.query('SELECT visit.* FROM visit WHERE meetId = ?', [meet.id], function (err, res) {
    result(null, res || []);
  });
};

module.exports = Visit;
