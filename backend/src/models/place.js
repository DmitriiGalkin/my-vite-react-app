'use strict';
var dbConn = require('../db');

var Place = function(data){
    // this.id = data.id;
    this.title = data.title;
    this.image = data.image;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
};

Place.create = function (data, result) {
    dbConn.query("INSERT INTO place SET ?", data, function (err, res) {
        console.log(err, "err");
        result(err, res.insertId);
    });
};

Place.findAll = () => function (result) {
    dbConn.query("SELECT * FROM place", function (err, res) {
        result(null, res || []);
    });
};
// Place.findByMeet = function (meet, result) {
//     dbConn.query("SELECT * FROM place WHERE latitude = ? AND longitude = ?", [meet.latitude, meet.longitude], function (err, res) {
//         result(null, res.length ? res[0] : undefined);
//     });
// };
Place.findById = function (id, result) {
    dbConn.query("SELECT * FROM place WHERE id = ?", [id], function (err, res) {
        result(null, res.length ? res[0] : undefined);
    });
};


module.exports = Place;