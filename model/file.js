'use strict';

var config = require('../config');
var db = require('./db');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
    
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    fileName: { type: String, require: true },
    createdAt: Date
    
});

var File = mongoose.model('File', fileSchema);
module.exports = File;