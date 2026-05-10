'use strict';
var dbConn = require('../db');
const Project = require('./project');
var LocalDateTime = require('@js-joda/core').LocalDateTime;
var ChronoUnit = require('@js-joda/core').ChronoUnit;

var Meet = function(data){
    this.id = data.id;
    this.passportId = data.passportId; // Идентификатор наблюдателя
    this.datetime = data.datetime;
    this.duration = data.duration; // Длительность
    this.projectId = data.projectId; // Идентификатор проекта
    this.price = data.price;
};

Meet.create = function (data, result) {
    dbConn.query("INSERT INTO meet set ?", data, function (err, res) {
        console.log(err, "err");
        result(err, res.insertId);
    });
};

Meet.update = function(id, meet, result){
    dbConn.query("UPDATE meet SET datetime=?, duration=?, price=? WHERE id = ?", [meet.datetime, meet.duration, meet.price, id], function (err, res) {
        result(null, res);
    });
};

Meet.delete = function(id, result){
    dbConn.query(`UPDATE meet SET deleted = NOW() WHERE id = ?`, id, function (err, res) {
        result(null, res);
    });
};
Meet.deleteByProjectId = function(id, result){
    dbConn.query(`UPDATE meet SET deleted = NOW() WHERE projectId = ?`, id, function (err, res) {
        result(null, res);
    });
};

Meet.findAll = function (result) {
    dbConn.query("SELECT *, date_format(datetime, '%Y-%m-%d %H:%i:%s') as datetime from meet " +
        "WHERE DATE(datetime) >= CURDATE() " +
        // "AND deleted IS NULL " +
        // "AND ST_Distance_Sphere(point(" + x + ", " + y + "), point(x, y)) < " + RADIUS + " " +
        "ORDER BY datetime", function (err, res) {
        result(null, res || []);
    });
};

Meet.findById = function (id, result) {
    dbConn.query("SELECT *, date_format(datetime, '%Y-%m-%d %H:%i:%s') as datetime FROM meet WHERE id = ?", id, function (err, res) {
        result(null, res[0]);
    });
};
Meet.findByProjectId = function (id, result) {
    dbConn.query("SELECT meet.*, date_format(datetime, '%Y-%m-%d %H:%i:%s') as datetime FROM meet WHERE projectId = ? AND DATE(datetime) >= CURDATE() AND deleted IS NULL ORDER BY datetime", id, function (err, res) {
        result(null, res);
    });
};

/**
 * Поиск одной рекомендованной пользователю встречи
 */
Meet.findRecommendationByProjectId = function (id, result) {
    dbConn.query("SELECT meet.*, date_format(datetime, '%Y-%m-%d %H:%i:%s') as datetime FROM meet WHERE projectId = ? AND DATE(datetime) >= CURDATE() AND deleted IS NULL ORDER BY datetime LIMIT 1", id, function (err, res) {
        result(null, res?.[0]);
    });
};

Meet.findByUserId = function (id, result) {
    dbConn.query("SELECT meet.*, date_format(datetime, '%Y-%m-%d %H:%i:%s') as datetime FROM meet LEFT JOIN participation ON participation.projectId = meet.projectId WHERE participation.userId = ? AND deleted IS NULL AND DATE(datetime) >= CURDATE()", id, function (err, res) {
        result(null, res || []);
    });
};
Meet.findByPassportId = function (id, result) {
    const l = "SELECT meet.*, date_format(datetime, '%Y-%m-%d %H:%i:%s') as datetime FROM meet WHERE passportId = ? AND deleted IS NULL AND DATE(datetime) >= CURDATE()"
    console.log(l,'l')
    dbConn.query(l, id, function (err, res) {
        console.log(res,'res')
        result(null, res || []);
    });
};

// Встречи участника
Meet.findAllByUserId2 = (id) => function (result) {
    dbConn.query("SELECT * FROM user_meet WHERE userId = ?", id, function (err, res) {
        result(null, res);
    });
};
// Встречи участника
Meet.findAllByUserId = () => function (result) {
    dbConn.query("SELECT *, date_format(datetime, '%Y-%m-%d %H:%i:%s') as datetime from meet where DATE(datetime) >= CURDATE() ORDER BY datetime", function (err, res) {
        //console.log(err,'err')
        result(null, res || []);
    });
};
// Встречи на которые пользователь принимает участие
Meet.findUserMeet = function(userId, result){
    dbConn.query("SELECT *, date_format(datetime, '%Y-%m-%d %H:%i:%s') as datetime FROM meet LEFT JOIN user_meet ON user_meet.meetId = meet.id WHERE user_meet.userId = ? ORDER BY datetime DESC", [userId], function (err, res) {
        result(null, res.length ? res : []);
    });
};

//(1 = Sunday, 2 = Monday, …, 7 = Saturday)
function toODBC (l) {
    switch (l) {
        case 0: {
            return 2
        }
        case 1: {
            return 3
        }
        case 2: {
            return 4
        }
        case 3: {
            return 5
        }
        case 4: {
            return 6
        }
        case 5: {
            return 7
        }
        case 6: {
            return 1
        }
    }
}

Meet.check = function (timer, result) {
    const day = toODBC(timer.dayOfWeek)
    dbConn.query("SELECT *, DAYOFWEEK(datetime) as pm FROM meet WHERE DATE(datetime) >= CURDATE() AND DAYOFWEEK(datetime) = ? AND projectId = ?", [day, timer.projectId], function (err, res) {
        if (!res.length) {
            result(null, timer);
        } else {
            result(null);
        }
    });
};

// Встреча по номеру
Meet.createByTimer = function (timer, result) {
    Project.findById(timer.projectId, function(err, project) {
        const correctDayOfWeek = timer.dayOfWeek + 1
        const sevenDays = [0,1,2,3,4,5,6].map(number => {
            return LocalDateTime.now().plusDays(number).withHour(timer.time)
        })

        const data = {
            title: project.title,
            description: project.description,
            image: project.image,
            datetime: sevenDays.find(d=>d.dayOfWeek().value()===correctDayOfWeek).truncatedTo(ChronoUnit.HOURS).toString(),
            userId: project.userId,
            projectId: project.id,
            latitude: project.latitude,
            longitude: project.longitude,
            ageFrom: project.ageFrom,
            ageTo: project.ageTo,
        }
        dbConn.query("INSERT INTO meet set ?", data, function (err, res) {
            console.log(err, "err");
            result(err, res.insertId);
        });
    })
};





module.exports = Meet;