var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var contact = require('./routes/contact');
var order_log = require('./routes/order_log');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', function(req, res, next) {
	  if (req.headers.host.match(/^www/) === null ) {
	    res.redirect('http://www.' +req.headers.host + req.url);
	  } else {
	    next();     
	  }
})

app.use('/contact' , contact);

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);
app.use('/cart',  order_log);

//firebase initialize
var admin = require("firebase-admin");

var serviceAccount = require("./helper/airpuri-1c6b7-firebase-adminsdk-c6bvx-763d32faa7.json");

admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: "https://airpuri-1c6b7.firebaseio.com"
});

exports.admin = admin;


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
