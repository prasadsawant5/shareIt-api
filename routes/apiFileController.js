'use strict';

var multer = require('multer');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var dirname = require('path').dirname(__dirname);
var fs = require('fs');
var db = require('../model/db');
var helperModule = require('./helperModule');
var File = require('../model/file');
var User = require('../model/user');
 

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, dirname + '/uploads/avatars');
    }, 
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

var fileStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, dirname + '/uploads/files');
    }, 
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage : storage}).single('userPhoto');

var fileUpload = multer({ storage : storage}).single('userFile');

module.exports = function(app, __dirname) {
    
    app.post('/api/uploads/avatar', function(req, res, next) {
        
        upload(req, res, function(err) {
                                    
            if (err) {                
                console.log(err);
                var err = new Error('Something went wrong!');
                err.status = 400;
                return next(err);
            }
            console.log(req.file.destination + '/' + req.file.originalname);
                       
            res.status(201).json({ message: 'File uploaded successfully!' });
       }); 
    });
    
    app.post('/api/uploads/file', function(req, res, next) {
        
        fileUpload(req, res, function(err) {
            
            if (err) {
                console.log(err);
                var err = new Error('Something went wrong!');
                err.status = 400;
                return next(err);
            }
            
            console.log(req.file.destination + '/' + req.file.originalname);
            
            var readStream = fs.createReadStream(req.file.destination + '/' + req.file.originalname);
            Grid.mongo = mongoose.mongo;
            
            var gfs = Grid(db.getDb());
            
            var fileName = req.file.originalname;
            
            var writeStream = gfs.createWriteStream({
                filename: req.file.originalname
            });
            
            readStream.pipe(writeStream);
            
            fs.unlink(req.file.destination + '/' + req.file.originalname, function(err) {
                if (err) {
                    console.log(err);
                }
            });
            
            var sourceId, destinationId, destinationPlayerId, sourceFirstName, sourceLastName, sourceEmail;
            
            User.findOne({ email: req.headers.source }, function(err, user) {
                
                if (err) {
                    console.log(err);
                }
                
                sourceId = user.id;
                sourceFirstName = user.firstName;
                sourceLastName = user.lastName;
                sourceEmail = user.email;
                console.log(sourceFirstName + ' ' + sourceLastName);
                
            });
            
            User.findOne({ email: req.headers.destination }, function(err, user) {
                
                if (err) {
                    console.log(err);
                }
                
                destinationId = user.id;
                destinationPlayerId = user.playerId;
                console.log(destinationPlayerId);
                
                if (sourceId !== null && destinationId !== null) {
                    
                    var file = new File({
                        source: sourceId,
                        destination: destinationId,
                        fileName: fileName,
                        createdAt: new Date()
                    });
                    
                    file.save(function(err, user) {
                       
                       if (err) {
                           console.log(err);
                       } else {
                           console.log('Sending Notification');
                           helperModule.sendPushNotification(sourceEmail, destinationPlayerId, sourceFirstName, sourceLastName, req.file.originalname);
                       }
                        
                    });
                    
                }
                
            });                      
            
            
            
            res.sendStatus(201);
        });
        
    });
    
    app.get('/api/downloads', function(req, res, next) {
        
        var fileName = req.headers.filename;
        console.log(fileName);       
        
        Grid.mongo = mongoose.mongo;
        var gfs = Grid(db.getDb());
        
        var readStream = gfs.createReadStream({
            filename: fileName
        });
        
        var writeStream = fs.createWriteStream(__dirname + '/uploads/files/' + fileName);
        console.log(__dirname + '/uploads/files/' + fileName);
        
        readStream.pipe(writeStream);
        
        writeStream.on('close', function(){
            console.log('File ' + fileName + ' written successfully');
            
            res.status(200).sendFile(__dirname + '/uploads/files/' + fileName);
            
            fs.readdir(__dirname + '/uploads/files/', function(err, files) {
                
                if (err) {
                    console.log(err);
                    return;
                }
                
                files.forEach(function(f) {
                    console.log(f);
                    if (f !== fileName) {
                        
                        fs.unlink(__dirname + '/uploads/files/' + f, function(err) {
                            if (err)
                                console.log('Error deleating file ' + err);
                        });
                        
                    }
                });                                                    
            });
                       
        });
                      
        
    }); 
    
};
