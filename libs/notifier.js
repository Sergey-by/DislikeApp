//GCM api key
var apiKey = 'AIzaSyC26IQCEjyzocTkGHqMJ7Uxl0jKh_jIZA4',
    
    gcm = require('node-gcm'),
    sender = new gcm.Sender(apiKey),
    fs = require('fs');
    
module.exports = (function() {
  return {
    notify: function (platform, message) {
	if ('android' == platform) {
	    this.androidPush(message);
	} else {
	    console.log('Who are you?');
	}
    },
    androidPush: function(message) {
	var msg = new gcm.Message({
	    collapse_key: 'Collapse key',
	    delayWhileIdle: true,
	    timeToLive: 3,
	    data: {
			messageText: message.text,
			messageType: message.type,
			messageData: message.info
	    }
	});
	
	sender.send(msg, message.token, 2, function(err, messageId) {
	    if (err) {
		console.log(err);
	    } else {
		console.log("Sent with message ID: ", messageId);
	    }
	});
    },
    iosPush: function(message) {

	var deviceToken = message.token || null;

	if (deviceToken && deviceToken != 'undefined' && deviceToken != undefined) {
	   /* var key = _directory + '/../certs/new/key.pem'
	    var cert = _directory + '/../certs/new/cert.pem';

	    var certData = fs.readFileSync(cert, encoding='ascii');
	    var keyData = fs.readFileSync(key, encoding='ascii');
	    */
	    var options = {
		passphrase: '1234',
		//certData: certData,
		//keyData: keyData,
		/* A passphrase for the Key file */
		gateway: 'gateway.sandbox.push.apple.com',
		//port: 2195
	    };


	    note.expiry = Math.floor(Date.now() / 1000) + 3600;
	    note.sound = "ping.aiff";
	    note.alert = /*"\uD83D\uDCE7 \u2709 "+*/message.text;
	    note.payload = {
		'messageType':message.type,
		'profile_id': message.profile_id ? message.profile_id : ''
	    };

	} else {
	    console.log('Device token has not received');
	}
    },
    generateOnlineMessage: function(profile_id, tokens) {
	return {type:'online', text: 'contact came online', profile_id: profile_id, token: tokens};
    },
    generateOfflineMessage: function(profile_id, tokens) {
	return {type:'offline', text: 'contact came offline', profile_id: profile_id, token: tokens};
    },
    generateNewMessage: function() {
	return {type:'message', text:'You have new message(s)'};
    },
    generateNewDataMessage: function(user_name, curr_user_id, type, date) {
    	var tempData = {user_name: user_name, user_id: curr_user_id, type: type, date: date}; 
	return {type:'message', text:'You have new message(s)', info: tempData};
    },
    generateFriendRequest: function(profile_id) {
	return {type:'friend_request', text:'You have a new friend request', profile_id: profile_id};
    },
    generateFriendApproved: function(profile_id) {
	return {type:'friend_approved', text:'Your request has been approved', profile_id: profile_id};
    },
    
  }
})();