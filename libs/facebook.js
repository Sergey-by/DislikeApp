var request = require('request');

function postMessage(disl, message, success, error) {

  console.log("_Posting dislike : ", message);
    // Specify the URL and query string parameters needed for the request
    var url = 'https://graph.facebook.com/' + disl.postId + '/comments';
    var params = {
      access_token: disl.access_token,
      message: message + '\n\n\n Dislike powered by {http://www.hightorquesoftware.com/}'
    };

	// Send the request
  request.post({url: url, qs: params}, function(err, resp, body) {

  // Handle any errors that occur
  if (err) return console.error("Error occured: ", err);
  body = JSON.parse(body);
  if (body.error){
    console.error("Error returned from facebook: ", body.error);
    error(disl);
  }else{
    console.log('Dislike posted, id: ', body.id);
    disl.dislikeId = body.id;
    success(disl);
  }
    });

}
function findCommentInPost(disl, success){
  var url = 'https://graph.facebook.com/' + disl.postId + '/comments';
  var params = {
    access_token: disl.access_token,
  };
  request.get({url: url, qs: params}, function(err, resp, body) {
    var comments = JSON.parse(body);
    console.log("found",comments.data.length);
    
    for(var i = 0; i < comments.data.length; i++){
      //console.log('compare :', comments.data[i].message, disl._self.dislikeMessages[disl.mesType]);
      if(comments.data[i].from.id == disl.userId && comments.data[i].message == disl._self.dislikeMessages[disl.mesType]){
        console.log("comment found with id :", comments.data[i].id)
        disl.dislikeId = comments.data[i].id;
        success(disl);
        return;
      };
    };
    if(comments.paging && comments.paging.next){
      searchInNextPage(comments.paging.next, disl, success)
    }
  });
}
function searchInNextPage(url, disl, success){
  console.log('Searching on next page...');
  var params = {
    access_token: disl.access_token,
  };
  request.get({url: url, qs: params}, function(err, resp, body) {
    var comments = JSON.parse(body);
    for(var i = 0; i < comments.data.length; i++){
      if(comments.data[i].from.id == disl.userId && comments.data[i].message == disl._self.dislikeMessages[disl.mesType]){
        console.log("comment found with id :", comments.data[i].id);
        console.log(comments.data[i]);
        disl.dislikeId = comments.data[i].id;
        disl._self.saveDislike(disl);
        return;
      };
    };
    if(comments.paging && comments.paging.next)
      searchInNextPage(comments.paging.next, disl, success)
  });
}

exports.postMessage = postMessage;
exports.findCommentInPost = findCommentInPost;