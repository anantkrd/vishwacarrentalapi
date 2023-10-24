const express = require('express')
const app = express()
var bodyParser = require('body-parser');
require('dotenv').config()
var cors = require('cors')
var path = require('path');
//const helmet = require("helmet");
//const port = 3000
app.use(cors());
//app.use(helmet());
// view engine setup
//var indexRouter = require('./api/userRoute');
//var jaapRoute = require('./api/jaapRoute');
var indexRouter = require('./routes/index');
var userRouter=require('./api/user/user.router');
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
require('dotenv').config()
const mongoose = require("mongoose");
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/users', usersRouter);
//app.use('/users/user', usersRouter);
app.use('/booking', bookingRouter);
app.use('/agent', agentsRouters);
app.use('/admin', adminRouters);
app.use('/driver', driverRouters);
//app.use('/v1/user', indexRouter);
//app.use('/v1/jaap', jaapRoute);
app.use(function(req, res, next) {
  next(createError(404));
  //res.render('error');
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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

let port=8080;//process.env.API_PORT;
/*
const httpServer = http.createServer(app);


mongoose.connect('mongodb+srv://vishwacarrental:L19pRrBYoa12UYv0@cluster0.mzxxv66.mongodb.net/vishwacarrental?retryWrites=true&w=majority')
  .then((result) =>{
    console.log('Connected!');
    httpServer.listen(port, () => {
      console.log(`Example app listening at https://localhost:${port}`)
        console.log('HTTP Server running on port '+port);
    });
  } );
*/
  /***FOR LIVE WITH HTTPS */
  var privateKey  = fs.readFileSync('/etc/letsencrypt/live/vishwacarrental.com/privkey.pem', 'utf8');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/vishwacarrental.com/fullchain.pem', 'utf8');
  //console.log("certificate:"+certificate);
  var credentials = {key: privateKey, cert: certificate};
  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);

//mongodb+srv://vishwacarrental:<password>@cluster0.mzxxv66.mongodb.net/?retryWrites=true&w=majority
mongoose.connect('mongodb+srv://vishwacarrental:L19pRrBYoa12UYv0@cluster0.mzxxv66.mongodb.net/vishwacarrental?retryWrites=true&w=majority')
  .then((result) =>{
    console.log('Connected!');
    
    httpServer.listen(4434, () => {
      console.log('HTTP Server running on port 4434');
  });
  
  httpsServer.listen(port, () => {
      console.log('HTTPS Server running on port'+port);
  });
  } );
//app.use('/', indexRouter);