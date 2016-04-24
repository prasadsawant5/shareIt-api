'use strict'
var https = require('https');

exports.sendPushNotification = function(sourceEmail, destinationPlayerId, sourceFirstName, sourceLastName, fileName) {
    
    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Basic ZTNjNTc3ZGEtNjZkZi00ZTE1LTliZjYtYzI5NzM4NTMxYTBj"
    };
    
    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };
    
    var req = https.request(options, function(res) {  
        res.on('data', function(data) {
            console.log("Response:");
            console.log(JSON.parse(data));
        });
    });
    
    var message = { 
        app_id: "2c94ce2f-5009-4680-852c-35c21d2fea7c",
        contents: { "en": sourceFirstName + " " + sourceLastName + " wants to share a file with you." },
        headings: { "en": "Share IT" },
        include_player_ids: [ destinationPlayerId ],
        data: { "sender": sourceEmail, "fileName": fileName },
        android_background_data: true
    };
    
    console.log(JSON.stringify(message));
    
    req.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
    });
  
  req.write(JSON.stringify(message));
  req.end();
  
    
    
}