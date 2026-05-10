'use strict';
const Place = require('../models/place');

// Места
exports.findAll = function(req, res) {
    Place.findAll(req.query.latitude, req.query.longitude)(function(err, meets) {
        res.send(meets)
    });
};
// Создание места
exports.create = function(req, res) {
    const meet = new Place(req.body);
    if(req.body.constructor === Object && Object.keys(req.body).length === 0){
        res.status(400).send({ error:true, message: 'Please provide all required field' });
    }else{
        Place.create(meet, function(err, placeId) {
            res.json(placeId);
        });
    }
};

