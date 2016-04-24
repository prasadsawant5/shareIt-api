'use strict';

var mongoose = require('mongoose');
var config = require('../config');
var db = require('./db');

var Schema = mongoose.Schema;

var contactSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true, unique: true },
    avatar: String,
    playerId: { type: String }
});

var Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;