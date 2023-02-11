
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('respond with a booking');
  });
router.get('/booking',function(req,res,next){
    console.log("booking");
    console.log("Here in call");
    con.getConnection((err, connection) => {
      if(err) responce=JSON.stringify({code:'501',error:err,data:''});
  
      console.log('connected as id ' + req.query.mobileno);
      let mobileNo=req.query.mobileno;
      let fName=req.query.fName;
      let lName=req.query.lName;
      let email=req.query.email;
      let pickup=req.query.pickup;
      let destination=req.query.destination;
      let pickupDate=req.query.pickupDate;
      let ReturnDate=req.query.returnDate;
      let isReturn=req.query.isReturn;
      let cabId=req.query.cabId;
      let status='pending';
     // let ReturnDate=req.query.ReturnDate;
      connection.query('select * from payag_users where mobileNo=?',[mobileNo], (err, rows) => {
          connection.release(); // return the connection to pool
          let responce;
          console.log("Rows*****"+rows.length);
          let userId=0;
          if(err) {
            responce=JSON.stringify({code:'501',error:err,data:''});
          }else{
            if(rows.length>0){
              userId=rows[0].id;
              let userName=fName+" "+lName;
              responce=JSON.stringify({code:'200',error:'',data:userId});
              
            }else{
              users=[[fName,lName,mobileNo,email,'Active']];
              let sql="INSERT INTO payag_users (firstName, lastName,mobileNo,email,status) VALUES ?";
              connection.query(sql,[users], (err, result) => {
                if(err) {
                  responce=JSON.stringify({code:'501',error:err,data:''});
                }else{
                  console.log("*****user*****"+JSON.stringify(result));
                  console.log("Number of records inserted: " + result.affectedRows);
                  responce=JSON.stringify({code:'200',msg:'user added',data:''});
                }                
              });
            }
            booking=[[userId,userName,cabId,pickup,destination,pickupDate,ReturnDate,isReturn,status]];
            sqlBooking="INSERT INTO payag_booking (userId, userName,cabId,pickup,destination,pickupDate,returnDate,isReturn,status) VALUES ?";
              
            connection.query(sqlBooking,[booking], (err, result) => {
              if(err) {
                responce=JSON.stringify({code:'501',error:err,data:''});
              }else{
                console.log("***book*******"+JSON.stringify(result));
                console.log("Number of records inserted: " + result.affectedRows);
                responce=JSON.stringify({code:'200',msg:'cab booked',data:''});
              }                
            });
            //responce=JSON.stringify({code:'200',error:err,data:rows});
          }
          //console.log('The data from users table are: \n', rows);
          res.send(responce);
      });
    });
});

module.exports = router;