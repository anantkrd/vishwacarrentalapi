var express = require('express');
var router = express.Router();
con=require('./config');
conn=require('../config/database')

//var conn=con.pool;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource....');
  
});
router.post('/cab_booking',function(req,res,next){
  console.log("Here in call");
  conn.getConnection((err, connection) => {
    if(err) responce=JSON.stringify({code:'501',error:err,data:''});

    console.log('connected as id ' + req);
    connection.query('select * from payag_users where mobileNo=?',[req.mobileno], (err, rows) => {
        connection.release(); // return the connection to pool
        let responce;
        if(err) {
          responce=JSON.stringify({code:'501',error:err,data:''});
        }else{
          responce=JSON.stringify({code:'200',error:err,data:rows});
        }
        //console.log('The data from users table are: \n', rows);
        res.send(responce);
    });
  });
});
router.get('/user', function(req, res, next) {
  res.send('respond with a user..');
});
module.exports = router;
