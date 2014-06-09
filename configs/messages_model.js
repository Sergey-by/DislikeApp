var helper = require('../libs/helper.js'),
    errors = require('../libs/errors.js');
    notifier = require('../libs/notifier.js');
    
module.exports = (function() {
  return {
    _db: null,
    get_messages: function(res, profile_id, friends_list) {
	var _self = this;
	this._db.select('profiles', {
	    profile_id: profile_id
	}, 1, function(response) {
	    if(helper.isResponseValidLength(response)) {
		var user = response.response.json[0];
		var query = 'select m.message_id as message_id, m.message as message, m.message_date as message_date, m.message_from_id as message_from_id, m.message_to_id as message_to_id, '+
			    'p1.profile_name as message_from, p2.profile_name as message_to '+
			    'from messages_queue m, profiles p1, profiles p2 '+
			    'where m.message_to_id = p2.profile_id and m.message_from_id = p1.profile_id and m.message_to_id = ?';
		
		_self._db.queryWithParams(query, [user.profile_id], function(response) {
		    var resp = [];
		    if(helper.isResponseValidLength(response)) {
			resp = response.response.json;
			//KOSTYL
			for(var i=0; i<resp.length; i++) {
			    var msg = resp[i];
			    msg.message_date = Date.parse(msg.message_date);
			    resp[i] = msg;
			}
		    } 
		    if(friends_list) {
		      var to_respond = {
			  friends: friends_list,
			  messages: resp
		      };
		      helper.respond(res, 200, to_respond);
		    } else {
		      helper.respond(res, 200, resp);
		    }
		});
	    } else {
		helper.respondError(res, errors.chat_recipient_not_found);
	    }
	});
	
    },
    confirm_messages: function(req,res) {
	var query = 'delete from messages_queue where (';
	var ids = req.body.ids.split(',');
	for(var i = 0; i<ids.length; i++) {
	    query += 'message_id = \''+ids[i]+'\' ';
	    if(i+1 < ids.length) query += ' OR ';
	}
	query += ' ) AND message_to_id = \''+req.params.id+'\'';
	this._db.query(query, function(response){
	      helper.respond(res, 200, {response: 'ok'});
	});
    },
    send_message: function(req,res) {
	var _self = this;
	this._db.select('profiles', {
	    profile_id: req.params.id
	}, 1, function(response) {
	    if(helper.isResponseValidLength(response)) {
		var sender = response.response.json[0];
		_self._db.select('profiles', {
		    profile_id: req.body.to
		}, 1, function(response) {
		    if(helper.isResponseValidLength(response)) {
			var receiver = response.response.json[0];
			_self._db.insert('messages_queue', {
			    message_from_id: sender.profile_id,
			    message_to_id: receiver.profile_id,
			    message: req.body.message
			}, function(response) {
			    var resp = {message_date: (new Date()).getTime()};
			    console.log('***********************');
			    console.log(resp);
			    helper.respond(res, 200, resp);
			    _self._db.select('users', {
				id: receiver.user_id
			    }, 1, function(response) {
				    if(helper.isResponseValidLength(response)) {
					var msg = notifier.generateNewMessage();
					msg.token = [response.response.json[0].token];
					notifier.notify(response.response.json[0].platform, msg);
				    }
			    });
			});
		    } else {
			helper.respondError(res, errors.chat_recipient_not_found);
		    }
		});
	    } else {
		helper.respondError(res, errors.chat_sender_not_found);
	    }
	});
    }
  }
})();
