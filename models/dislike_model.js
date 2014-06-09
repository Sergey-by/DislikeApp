var helper = require('../libs/helper.js'),
notifier = require('../libs/notifier.js'),
graph = require('../node_modules/fbgraph'),
FB = require('../libs/facebook.js');

module.exports = (function() {
	return {
		dislikeMessages: ["no message", "I dislike your post", "FacePalm", "FFFUUU", "I love your post", "Like", "Commented"],
		_db: null,
		_dislike: function(req,res) {
			var userId = req.params.userId;
			var postId = req.body.postId;
			var postType = req.body.postType;
			console.log(postId, postType, userId);
			var _self = this;
			this._db.queryWithParams("insert into dislikes (post_id, post_type, user_id) values (?, ?, ?)", [postId, postType, userId], function(response) {
				if(helper.isResponseValid(response)) {
					console.log('Disliked! id = ' + response.response.json.insertId);
					_self._db.queryWithParams("select post_id, post_type, count(user_id) as count, IFNULL((SELECT 1 FROM dislikes d2 WHERE d2.post_type = d1.post_type AND d2.user_id=? LIMIT 1), 0) AS flag FROM dislikes d1 where post_id=? group by post_type", [userId, postId], function(response) {
						console.log('Dislikes recounted');
						console.log(response.response.json);
						helper.respond(res,200,response.response.json);
					});
				};
			}			
			)},
			_undislike: function(req,res) {
				var userId = req.params.userId;
				var postId = req.body.postId;
				var postType = req.body.postType;
				console.log(postId, postType, userId);
				var _self = this;
				this._db.queryWithParams("delete from dislikes where post_id=? and post_type=? and user_id=?", [postId, postType, userId], function(response) {
					if(helper.isResponseValid(response)) {
						console.log('Undisliked!');
						console.log('Disliked! id = ' + response.response.json.insertId);
						_self._db.queryWithParams("select post_id, post_type, count(user_id) as count, IFNULL((SELECT 1 FROM dislikes d2 WHERE d2.post_type = d1.post_type AND d2.user_id=? LIMIT 1), 0) AS flag FROM dislikes d1 where post_id=? group by post_type", [userId, postId], function(response) {
							console.log('Dislikes recounted');
							console.log(response.response.json);
							helper.respond(res,200,response.response.json);
						});
					};
				}			
				)},	
				dislikes: function(req,res) {
					console.log('generating data for poste...');
					var userId = req.params.userId;
					var postList = req.body.posts.split(',');
					console.log(userId, postList);
					var _self = this;
					this._db.queryWithParams("SELECT post_id, post_type, COUNT(user_id) AS count, IFNULL((SELECT 1 FROM dislikes d2 WHERE d2.post_id = d1.post_id AND d2.post_type = d1.post_type AND d2.user_id = ? LIMIT 1), 0) AS flag FROM dislikes d1 WHERE post_id IN(?) GROUP BY post_id, post_type;", [userId, postList], function(response) {
						if(helper.isResponseValid(response)) {
							//console.log("!!!!response - ", response.response);
							helper.respond(res,200,response.response.json);
						};
					}			
					)},
					getnotifications: function(req,res) {
						var userId = req.params.userId;
						var fbUserName = req.body.fb_username;
						var userToken = req.body.token;
						console.log(fbUserName, fbUserName);
						var _self = this;
						this.addUserName(userId, fbUserName);
						this.addToken(userId, userToken);
						this._db.queryWithParams("SELECT notifications.id, users.user_name as sender_name, notifications.sender_id, notifications.type, notifications.post_id, notifications.sent_date FROM notifications LEFT JOIN users ON notifications.sender_id = users.fb_user_id WHERE notifications.receiver_id = ?", [userId, ], function(response) {
							if(helper.isResponseValid(response)) {
								//console.log("BD response - ", response.response.json);
								helper.respond(res,200,response.response.json);
							};
						}			
						)},
						addUserName: function(userId, userName) {
							var _self = this;
							var str = "select fb_user_id from users where fb_user_id = ? and user_name = ?";
							this._db.queryWithParams(str, [userId, userName], function(response) {
								if(helper.isResponseValid(response)) {
									if(response.response.json.length < 1){
										var str = "insert into users (fb_user_id, user_name) values (?, ?)";
										_self._db.queryWithParams(str, [userId, userName], function(response) {
											if(helper.isResponseValid(response)) {
												console.log('New user inserted :', userId, userName);
											}
										})
									}
								};
							}
//Error returned from facebook:  { message: 'An unexpected error has occurred. Please retry your request later.',type: 'OAuthException',code: 2 }
							)
						},
						dislike: function(req,res) {
							var date = new Date();
							var userId = req.params.userId;
							var access_token = req.body.access_token;
							var receiverId = req.body.postId.split('_')[0];
							var postId = req.body.postId.split('_')[1];
							var mesType = req.body.postType;
							dislikeObj = new Object(),
							// var userId = "1059734085";
							// //var userId = "2147483647";
							// var access_token = "";
							// var receiverId = "1059734085";
							// var postId = "10152488250739740";
							// var mesType = "4";
							// var _self = this;

							dislikeObj.userId = userId;
							dislikeObj.access_token = access_token;
							dislikeObj.receiverId = receiverId;
							dislikeObj.postId = req.body.postId;
							dislikeObj.mesType = mesType;
							dislikeObj.res = res;
							dislikeObj._self = this;

							console.log('inited variables');
							console.log(dislikeObj.userId, dislikeObj.receiverId, dislikeObj.postId, dislikeObj.mesType);
							//FB.postMessage(access_token, "EEEEEEHHHHAAAAAAAAAAAAA", req.body.postId) ;
							//this.postDislike(req.body.postId, access_token, receiverId, postId, mesType, userId, res);

							this.sendDislike(dislikeObj);
						},
						addToken: function(userId, token) {
							var _self = this;
							var str = "select fb_user_id from tokens where fb_user_id = ? and token = ?";
							this._db.queryWithParams(str, [userId, token], function(response) {
								if(helper.isResponseValid(response)) {
									if(response.response.json.length < 1){
										var str = "insert into tokens (fb_user_id, token) values (?, ?)";
										_self._db.queryWithParams(str, [userId, token], function(response) {
											if(helper.isResponseValid(response)) {
												console.log('new token inserted');
												console.log(response.response.json);
											}
										})
									}
								};
							}

							)
						},
		undislike: function(req,res){
			var mainRes = res;
			var userId = req.params.userId;
			var access_token = req.body.access_token;
			var postId = req.body.postId;
			var postType = req.body.postType;
			
			// var userId = 3;
			// var access_token = req.body.access_token;
			// var postId = 1;
			// var postType = 2;
			//console.log("___TEST___ ",postId, postType, userId);
			var _self = this;
			// delete from fb
			this._db.queryWithParams("SELECT facebook_comment_id FROM dislikes WHERE post_id=? AND post_type=? AND user_id=?", [postId, postType, userId], function(response) {
				if(helper.isResponseValid(response)) {
					console.log(response.response.json)
					console.log("dislike id :", response.response.json[0].facebook_comment_id);
					//var access_token = 'CAANJnecxehgBANmTrHDnZAEKxOxE9A9tDyARQdQOfaEX4rFIeBDvggbFusUN8ZAfdAI95AwSm2YrZALNaZCc8k5hYoc6owOXE7vQXdwqeYE1tUfY92OfsaNCwrfMGt0rEumW1anfgh4lyY6V5TNBP3AiAhZAZATZAua9rzB1TZCa0I8fBsXWMMCOBJeuozrgv9kZD';
					graph.setAccessToken(access_token);
					console.log("!___ Deleting :", response.response.json[0].facebook_comment_id);
					graph.del(response.response.json[0].facebook_comment_id, function(err, res) {
						console.log(res); // {data:true}/{data:false}
						console.log(err);
						if(res){
							_self._db.queryWithParams("delete from dislikes where post_id=? and post_type=? and user_id=?", [postId, postType, userId], function(response) {
								if(helper.isResponseValid(response)) {
								console.log('dislike deleted from DB');
									_self._db.queryWithParams("select post_id, post_type, count(user_id) as count, IFNULL((SELECT 1 FROM dislikes d2 WHERE d2.post_type = d1.post_type AND d2.user_id=? LIMIT 1), 0) AS flag FROM dislikes d1 where post_id=? group by post_type", [userId, postId], function(response) {
										console.log('Dislikes recounted');
										console.log(response.response.json);
										helper.respond(mainRes,200,response.response.json);
									});
									};			
							})	
						}else{
							helper.respond(mainRes, 400, 'DB Error notification was not created.');
						}
					});
				}		
			})	
		},
		pushNotification: function(disl) {
			//sending notification
			disl._self._db.queryWithParams("SELECT token FROM tokens WHERE fb_user_id = ?", [disl.postId.split('_')[0]], function(response) {
				if(helper.isResponseValid(response)) {
					console.log("tokens for user " + disl.userId+ " found :", response.response.json.length);
						if(helper.isResponseValid(response)) {
							var response = response;
							if(response.response.json.length >0){
								//for(var i = 0; i < response.response.json.length; i++){
									graph.get(disl.userId, function(err, res) {
   										var msg = notifier.generateNewDataMessage(res.first_name + ' ' + res.last_name, "1059734085", disl.mesType, '2014 05 01');
   										msg.token = [response.response.json[0].token];
   										notifier.notify('android', msg);
  									});
								//}
							}
						}
								
				}}
			)
		},
		sendDislike: function(disl){
			// disl._self._db.queryWithParams("select post_id, post_type, user_id FROM dislikes where post_id=? and post_type = ? and user_id = ?", [disl.postId, disl.postType, disl.userId], function(response) {
			// 		if(helper.isResponseValid(response)) {
			// 			console.log('--------------');
			// 			console.log(response);
			// 			console.log('--------------');
			// 		}
			// });
			console.log("_Sending dislike " + disl.mesType + " to FB");
			FB.postMessage(disl, this.dislikeMessages[disl.mesType], this.saveDislike, this.checkDislike);
		},
		checkDislike: function(disl){
			console.log('_Checking Dislike id for post :', disl.postId);
			FB.findCommentInPost(disl, disl._self.saveDislike);
		},
		saveDislike: function(disl){
			_self = this;
			console.log('_Creating notification');
			disl._self._db.queryWithParams("INSERT INTO notifications (receiver_id, post_id, notifications.type, sender_id, sent_date ) VALUES (?, ?, ?, ?, ?)", [disl.receiverId, disl.postId, disl.mesType, disl.userId, '2014-01-04'], function(response) {
  					if(helper.isResponseValid(response)) {
					//console.log("BD response - ", response.response.json);
					if(response.response.json.affectedRows == 1){
						console.log('_Saving Dislike...');
						disl._self._db.queryWithParams("insert into dislikes (post_id, post_type, user_id, facebook_comment_id) values (?, ?, ?, ?)", [disl.postId, disl.mesType, disl.userId, disl.dislikeId], function(response) {
							if(helper.isResponseValid(response)) {
								console.log('_Disliked saved, id :' + response.response.json.insertId);
								disl._self._db.queryWithParams("select post_id, post_type, count(user_id) as count, IFNULL((SELECT 1 FROM dislikes d2 WHERE d2.post_type = d1.post_type AND d2.user_id=? LIMIT 1), 0) AS flag FROM dislikes d1 where post_id=? group by post_type", [disl.userId, disl.postId], function(response) {
									//console.log(response.response.json);
									helper.respond(disl.res, 200, response.response.json);
									console.log('_Sending Push notification...');
									disl._self.pushNotification(disl);
								});
							};
						})
					}else{

						helper.respond(mainRes, 400, 'DB Error notification was not created.');
					}
				}
				}

				)
			
		},
		postDislike: function(post_id, access_token, receiverId, postId, mesType, userId, mainRes) {
			//var access_token = 'CAANJnecxehgBANmTrHDnZAEKxOxE9A9tDyARQdQOfaEX4rFIeBDvggbFusUN8ZAfdAI95AwSm2YrZALNaZCc8k5hYoc6owOXE7vQXdwqeYE1tUfY92OfsaNCwrfMGt0rEumW1anfgh4lyY6V5TNBP3AiAhZAZATZAua9rzB1TZCa0I8fBsXWMMCOBJeuozrgv9kZD';
			graph.setAccessToken(access_token);
			console.log(access_token);
			var wallPost = {
				message: "Test Dislike Comment"
			};
			// graph.get('/me/permissions', function(err, res) {
			// 							console.log('Permissions test   ');
			// 							console.log(res);
			// 							console.log(post_id);
  	// 								});
			_self=this;
			graph.post("/" + postId + "/comments", wallPost, function(err, res) {
  				if(res.id != null){
  					console.log('post dislikeed id: ', res.id); 
  					_self._db.queryWithParams("INSERT INTO notifications (receiver_id, post_id, notifications.type, sender_id, sent_date ) VALUES (?, ?, ?, ?, ?)", [receiverId, post_id, mesType, userId, '2014-01-04'], function(response) {
  					if(helper.isResponseValid(response)) {
					//console.log("BD response - ", response.response.json);
					if(response.response.json.affectedRows == 1){
						//helper.respond(res,200,response.response.json);
						_self._db.queryWithParams("insert into dislikes (post_id, post_type, user_id, facebook_comment_id) values (?, ?, ?, ?)", [post_id, mesType, userId, res.id], function(response) {
							if(helper.isResponseValid(response)) {
								console.log('Disliked, id :' + response.response.json.insertId);
								_self._db.queryWithParams("select post_id, post_type, count(user_id) as count, IFNULL((SELECT 1 FROM dislikes d2 WHERE d2.post_type = d1.post_type AND d2.user_id=? LIMIT 1), 0) AS flag FROM dislikes d1 where post_id=? group by post_type", [userId, post_id], function(response) {
									//console.log(response.response.json);
									helper.respond(mainRes,200,response.response.json);
									//console.log("--------",userId);
									_self.pushNotification(receiverId, post_id, mesType, '2014-01-04', userId);
								});
							};
						})
					}else{

						helper.respond(mainRes, 400, 'DB Error notification was not created.');
					}
				}
				}

				)
  				}else{
  					console.log('err', err)// { id: xxxxx}
  					helper.respond(mainRes, 400, err);
  				};
});
}
}
})();


