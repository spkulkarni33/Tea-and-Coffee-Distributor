var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
const MongoDBStore = require('connect-mongodb-session')(session);

// -----------------------------------MongoDb connection----------------------- //
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/BrewedAromas')
.then(() => console.log('connection successful'))
.catch((err) => console.error(err));
// -----------------------------------MongoDb connection----------------------- //


// var usersRouter = require('./routes/users');
// var teacoffeeRouter = require('./routes/teacoffee');
var app = express();

app.use(session({
  secret: 'secretkey', // a secret key you can write your own 
  resave: true,
  saveUninitialized: true
}));
app.use(express.static('routes/coffee'))

var indexRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, '/routes/coffee'));
app.set('view engine', 'ejs');

const store = new MongoDBStore({
  uri: 'mongodb://localhost/BrewedAromas',
  collection: 'sessions'
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/teacoffee', teacoffeeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

module.exports = app;
