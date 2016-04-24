'use strict';

var jwt = require('jsonwebtoken');
var User = require('./model/user');
var config = require('./config');

exports.getToken = function(user) {
    
    return jwt.sign(user, config.secretKey, {
        expiresIn: 600
    });
    
};

exports.verifyOrdinaryUser = function(request, response, next) {
            
    var token = request.body.token || request.query.token || request.headers['x-access-token'];

    if (token) {
        
        jwt.verify(token, config.secretKey, function(err, decoded) {
            if (err) {
                var err = new Error('You are not authorized!');
                err.status = 401;
                return next(err);
            } else {
                request.decoded = decoded;
                next();
            }
            
        });
        
    } else {
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
    
}