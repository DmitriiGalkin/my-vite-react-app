'use strict';
var dbConn = require('../db');

var Project = function (data) {
  this.id = data.id;
  this.title = data.title;
  this.description = data.description;
  this.image = data.image;
  this.passportId = data.passportId; // Создатель проекта
  this.ageFrom = data.ageFrom;
  this.ageTo = data.ageTo;
  this.placeId = data.placeId;
};

Project.create = function (data, result) {
  dbConn.query('INSERT INTO project set ?', data, function (err, res) {
    if (err) {
      console.error('Project.create error:', err);
      return result(err);
    }

    result(null, res?.insertId);
  });
};

Project.update = function (id, obj, result) {
  dbConn.query(
    'UPDATE project SET title=?, description=?, image=?, ageFrom=?, ageTo=?, placeId=? WHERE id = ?',
    [obj.title, obj.description, obj.image, obj.ageFrom, obj.ageTo, obj.placeId, id],
    function (err, res) {
      if (err) {
        console.error('Project.update error:', err);
        return result(err);
      }

      result(null, res);
    },
  );
};

Project.delete = function (id, result) {
  dbConn.query(
    'UPDATE project SET deleted = CURRENT_TIMESTAMP() WHERE id = ?',
    [id],
    function (err, res) {
      if (err) {
        console.error('Project.delete error:', err);
        return result(err);
      }

      result(null, res);
    },
  );
};

Project.findAll = function (params, result) {
  if (params.variant === 'participation' && !params.userId) {
    return result(null, []);
  }

  let where = 'WHERE ';
  where +=
    params.deleted === 'true' ? 'deletedAt IS NOT NULL OR deleted IS NULL' : 'deletedAt IS NULL';
  where =
    params.variant === 'participation' && params.userId
      ? 'LEFT JOIN participation ON participation.projectId = project.id ' +
        where +
        ' AND participation.userId = ' +
        params.userId
      : where;
  where +=
    ' AND passportId = ' +
    (params.variant === 'self' && params.passportId ? params.passportId : 'passportId');
  where +=
    params.type === 'recommendation' && params.passportId
      ? ' AND passportId != ' + params.passportId
      : '';

  const query = `SELECT project.* FROM project ${where}`;
  console.log(query, 'Project.findAll query');

  dbConn.query(query, function (err, res) {
    if (err) {
      console.error('Project.findAll error:', err);
      return result(err, []);
    }

    result(null, res || []);
  });
};

Project.findById = function (id, result) {
  dbConn.query('SELECT * FROM project WHERE id = ?', [id], function (err, res) {
    if (err) {
      console.error('Project.findById error:', err);
      return result(err);
    }

    result(null, res?.[0]);
  });
};

module.exports = Project;
