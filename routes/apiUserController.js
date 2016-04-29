'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var deasync = require('deasync');
var authenticate = require('../authenticate');
var User = require('../model/user');
var Contact = require('../model/contact');
var config = require('../config');


module.exports = function(app, __dirname) { 
    
    app.use(bodyParser.json());  
    
    
    app.post('/api/register', function(req, res, next) {
        
        if (req.body == null)
            res.sendStatus(404);
        
        var json = req.body;
        console.log(json);
        
        var firstName = json.firstName;
        var lastName = json.lastName;
        var email = json.email;
        var password = json.password;
        var contactNumber = json.contactNumber;
        var deviceId = json.deviceId;
        var avatar = json.avatar;
        var playerId = json.playerId;
        
        
        var user = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            contactNumber: contactNumber,
            deviceId: deviceId,
            avatar: avatar,
            playerId: playerId
        });
        
        user.save(function(err, user) {
            
            if (err) {
                var err = new Error('Bad request!');
                err.status = 400;
                return next(err);   
            }
            
            console.log("user saved!");

            var token = authenticate.getToken(user);

            res.status(201).json({ message: 'User saved!', token: token, expiresIn: '10' });
        });                
    });
    
    
    app.get('/api/checkUser/:email', function(req, res, next) {

        console.log(req.params.email);
                
        User.find({ email: req.params.email }, function(err, user) {
            
            if (err) {
                var err = new Error('Incorrect request!');
                err.status = 400;
                return next(err);
            }
            
            if (user.length != 0) {    
                console.log(user);
                res.sendStatus(200);
            } else {
                var err = new Error('Unable to find user!');
                err.status = 404;
                return next(err);
            }
            
        });
        
    });
    
    app.get('/api/testUser', function(req, res, next) {
       
        var email = req.headers['email'];
       
        User.find({ 'email': email }, function(err, user) {
           
            if (err) {
                var err = new Error('Bad request!');
                err.status = 400;
                return next(err);
            }
                
            if (user.length == 0) {
                var err = new Error('Unable to find user!');
                err.status = 404;
                return next(err);
            }
            
            res.sendStatus(200);
       }); 
    });
    
    app.post('/api/contacts', function(req, res, next) {
        
        var json = req.body;
        
        if (json === null) {
            var err = new Error('No JSON body.');
                err.status = 400;
                return next(err);
        }
        
        var email = json.email;
        var contacts = json.contacts;
        var userId;
        User.findOne({ email: email }, function(err, mainUser) {
            
            if (err) {
                console.log(err);
                var err = new Error('Bad request!');
                err.status = 400;
                return next(err);
            }
            
            if (mainUser === null) {
                var err = new Error('User not found!');
                err.status = 404;
                return next(err);
            }
            userId = mainUser.id;
        
            if (contacts.length > 0) {
                for (var i = 0; i < contacts.length; i++) {                                       
                    User.findOne({ 'contactNumber': contacts[i] }, function(err, user) {                        
                                              
                        if (err) {
                            var err = new Error('Bad request!');
                            err.status = 400;
                            return next(err);
                        }
                
                        if (user !== null) {                
                            var contact = new Contact({
                                userId: userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                contactNumber: user.contactNumber,
                                avatar: user.avatar,
                                playerId: user.playerId
                            });
                            Contact.findOne({ userId: userId, email: user.email }, function(err, savedContact) {
                                
                                if (err) {
                                    console.log(err);
                                    var err = new Error('Cannot save contact.');
                                    err.status = 400;
                                    return next(err);
                                }

                                if (savedContact === null) {
                                    contact.save(function(err, con) {
                                        if (err) {
                                            console.log(err);
                                            var err = new Error('Cannot save contact.');
                                            err.status = 400;
                                            return next(err);
                                        }
                                    });
                                }
                                
                            });                                                        
                        }
                    });                       
                } 
    
            }
            
            res.status(200).json({ message: 'Contacts received.' });
            
         });
        
       
    });
    
    app.get('/api/contacts', function(req, res, next) {
        var email = req.headers['email'];
        console.log(email);
        
        User.findOne({ email: email }, function(err, user) {
            
            if (err) {
                console.log(err);
                var err = new Error('Bad request!');
                err.status = 400;
                return next(err);
            }
            
            if (user === null) {
                var err = new Error('User not found.');
                err.status = 404;
                return next(err);
            }
            
            var id = user.id;
            
            Contact.find({ userId: id }, function(err, contact) {
                var result = [];
                if (err) {
                    console.log(err);
                    var err = new Error('Bad request!');
                    err.status = 400;
                    return next(err);
                }
                
                if (contact !== null && contact.length > 0) {
                    console.log('Contact found: ' + contact);
                    result.push({ contact });
                }
                
                res.status(200).json({ contacts: result });
                
            });
        });
    });
    
    app.get('/uploads/avatars/:fileName', function(req, res, next) {
        var fileName = __dirname + '/uploads/avatars/' + req.params.fileName;
        console.log(fileName);
        
        res.status(200).sendFile(fileName);
    })

    
    app.get('/api/oauth/token', function(req, res, next) {
        var email = req.headers['email'];
        
        if (email === null) {
            var err = new Error('Bad request!');
            err.status = 400;
            return next(err);
        } else {
            User.find({ email: email }, function (err, user) {
                if (err) {
                    var err = new Error('Bad request!');
                    err.status = 400;
                    return next(err);
                }
            
                if (user.length === 0) {
                    var err = new Error('Unable to find user!');
                    err.status = 404;
                    return next(err);
                }
            
                var token = authenticate.getToken(user);
            
                res.status(200);
                res.json({
                    token: token,
                    expiresIn: 10
                });
            });
        }  
    });
    
};

