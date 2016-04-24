'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var config = require('../config');
var db = require('./db');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactNumber: { type: String, required: true, unique: true },
    deviceId: String,
    avatar: String,
    playerId: { type: String, unique: true },
    createdAt: Date,
    updatedAt: Date
});

userSchema.pre('save', function(callback) {
    
    var user = this;
    var currentDate = new Date();
    
    user.createdAt = currentDate;
    user.updatedAt = currentDate;
    
    bcrypt.genSalt(5, function(error, salt) {
        
        if (error)
            return callback(error);
            
        bcrypt.hash(user.password, salt, null, function(error, hash) {
            
            if (error)
                return callback();
                
            user.password = hash;
            callback();
            
        });
    });
    
});
var User = mongoose.model('User', userSchema);
module.exports = User;