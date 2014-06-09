var express = require('express'),
    app = express(),
    db = require('./libs/db.js'),
    fbConfig = require('./configs/facebook.js'),
    dislike_model = require('./models/dislike_model.js'),
    port = 8200;
    
db._init(require('./configs/mysql.js'));
dislike_model._db = db;
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.query());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.cookieParser());

app.post('/api/dislike/:userId', function (req,res, next) {
  console.log('_Dislike Requested____________');
  dislike_model.dislike(req,res);
});
app.post('/api/undislike/:userId', function (req,res, next) {
  dislike_model.undislike(req,res);
});
app.post('/api/dislikes/:userId', function (req,res, next) {
  dislike_model.dislikes(req,res);
});
app.post('/api/getnotifications/:userId', function (req,res, next) {
  dislike_model.getnotifications(req,res);
});

app.listen(port);
console.log('Listening on port ', port);