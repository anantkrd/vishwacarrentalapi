var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
require('dotenv').config()
var cors = require('cors')
const Sequelize=require('sequelize');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//var bookingRouter=require('./routes/booking');
var userRouter=require('./api/user/user.router');
var bookingRouter=require('./api/booking/booking.router');
var agentsRouters=require('./api/agent/agent.router');
var adminRouters=require('./api/admin/admin.router');
var driverRouters=require('./api/driver/driver.router');
var fs = require('fs');
var http = require('http');
var https = require('https');

console.log("certificate:"+certificate)
const sequelize=require("./config/database");
var credentials = {key: privateKey, cert: certificate};
var app = express();
app.use(cors());
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/users', usersRouter);
//app.use('/users/user', usersRouter);
app.use('/booking', bookingRouter);
app.use('/agent', agentsRouters);
app.use('/admin', adminRouters);
app.use('/driver', driverRouters);


sequelize.sync();
//sequelize.sync({ alter: true })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
  //res.render('error');
});

// error handler
app.use(function(err, req, res, next) {
  console.log(req+"======*"+err.message);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
console.log("=====port=="+process.env.API_PORT);
port=process.env.API_PORT;

/**
 * Server code for Local
 */
/*
const httpServer = http.createServer(app);


httpServer.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`)
    console.log('HTTP Server running on port '+port);
});
*/
/****
 * Server code for live
 * ** */
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/vishwacarrental.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/vishwacarrental.com/fullchain.pem', 'utf8');
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(4434, () => {
    console.log('HTTP Server running on port '+port);
});

httpsServer.listen(port, () => {
    console.log('HTTPS Server running on port'+port);
});

module.exports = app;
