'use strict';

exports.checkConstructor = function(req, res, next) {
    if(req.body.constructor === Object && Object.keys(req.body).length === 0){
        res.status(400).send({ error:true, message: 'Please provide all required field' });
    }else{
        next()
    }
};
