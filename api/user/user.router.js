var express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
var router = express.Router();
const { createUser, getUserByMobile, sendOTP, verifyOtp, getBookings, getBookingByUser, getBookingById,
    getBookingSearchLog, getUserByID, getAgentByID, verifyPassword, cancelBooking } = require('./user.controller');
const { json } = require('body-parser');
const authenticate = require("../auth/index");
const userController = require("./user.controller");

/* GET home page. */
router.get('/fetchUser', userController.getUser);


router.post('/create_user', userController.createUser);
router.post('/register_agent', userController.createPartner);


router.get('/get_user_byid', authenticate,userController.getUser);
router.get('/get_user',  userController.getUserByMobile);
router.get('/send_otp', userController.getUserByMobile);
router.get('/get_booking_details', userController.getBookingById);
router.get('/user_login', userController.verifyPassword);
router.get('/get_booking', userController.getBookings);
router.get('/get_my_booking', userController.getMyBookings);
router.get('/get_user_booking',authenticate, userController.getMyBookings);

router.get('/get_search_log', userController.getBookingSearchLog);
router.get('/cancel_booking', userController.cancelBooking);



//router.get('/create_user', createUser);
router.get('/create_user_old', async function (req, res, next) {

    res1 = createUser(req.query.fname, req.query.lname, req.query.mobileNo, req.query.email, (err, results) => {
        if (err) {
            responce = JSON.stringify({ code: '501', error: err, data: '' });
        } else {
            console.log("last inserted id=" + results.insertId);
            responce = JSON.stringify({ code: '200', msg: 'user added', data: results.insertId });
        }
        res.send(responce);
    });

});
router.get('/get_user_byid_old', authenticate, async function (req, res, next) {
    //console.log("In get_user_byid")
    results = await getUserByID(req.query.userId);
    //console.log("result="+JSON.stringify(results))
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
    } else {
        let agentData = [];
        //results[0]['agentData']=agentData;
        console.log("=userType=**" + results[0]['userType']);
        if (results[0]['userType'] == 'agent') {
            console.log("=Get agent detILS=**");
            agentDataDetails = await getAgentByID(req.query.userId);
            //console.log("result="+JSON.stringify(agentData))
            results[0]['adharNo'] = agentDataDetails[0]['adharNo'];
            results[0]['companyName'] = agentDataDetails[0]['companyName'];
            results[0]['registrationId'] = agentDataDetails[0]['registrationId'];
            results[0]['adharLink'] = agentDataDetails[0]['adharLink'];
            results[0]['licenseLink'] = agentDataDetails[0]['licenseLink'];
            results[0]['isBankAdded'] = agentDataDetails[0]['isBankAdded'];
            results[0]['isDriverAdded'] = agentDataDetails[0]['isDriverAdded'];
            results[0]['isCarAdded'] = agentDataDetails[0]['isCarAdded'];
            results[0]['panNumber'] = agentDataDetails[0]['panNumber'];
            results[0]['panLink'] = agentDataDetails[0]['panLink'];
            results[0]['officeAddress'] = agentDataDetails[0]['officeAddress'];

            console.log("results=" + JSON.stringify(results))
        }
        responce = JSON.stringify({ code: '200', msg: '', data: results });
    }
    res.send(responce);

    /*res1=getUserByID(req.query.userId,(err,results)=>{
        console.log("===resultsUser *****==="+JSON.stringify(results));
        if(err){
            responce=JSON.stringify({code:'501',error:err,data:''});
        }else{
            console.log("last inserted id="+results);
            responce=JSON.stringify({code:'200',msg:'',data:results});
        }
        res.send(responce);
    }); */

});
router.get('/get_user_old', async function (req, res, next) {

    res1 = getUserByMobile(req.query.mobileNo, (err, results) => {
        if (err) {
            responce = JSON.stringify({ code: '501', error: err, data: '' });
        } else {
            console.log("last inserted id=" + results);
            responce = JSON.stringify({ code: '200', msg: '', data: results });
        }
        res.send(responce);
    });

});

router.get('/send_otp_old', async function (req, res, next) {
    console.log("api mobileNo**" + req.query.mobileNo)
    responce = await sendOTP(req.query.mobileNo);
    //const data = await responce.json();
    console.log(responce.code + "api responce**" + JSON.stringify(responce));
    /*if(responce.code==200){        
        responce=JSON.stringify({code:'200',msg:'',data:responce.data});        
    }else{
        responce=JSON.stringify({code:'501',error:"User Not Found",data:''});
    }*/
    res.send(responce);
    /*res1=sendOTP(req.query.mobileNo,(err,results)=>{
        if(err){
            responce=JSON.stringify({code:'501',error:'user not found',data:''});
        }else{
            
            console.log("last inserted id="+results);
            responce=JSON.stringify({code:'200',msg:'',data:results});
        }
        res.send(responce);
    }); */

});
router.get('/verify_otp', async function (req, res, next) {
    responce = await verifyOtp(req.query.mobileNo, req.query.otp);
    res.send(responce);
    /*res1=verifyOtp(req.query.mobileNo,req.query.otp,(err,results)=>{
        if(err){
            responce=JSON.stringify({code:'501',error:'user not found',data:''});
        }else{            
            //console.log(results[0]['id']+"last inserted id="+JSON.stringify(results));
            const token= jwt.sign({ id: results[0]['id'] }, process.env.secrete);
            //console.log("token=="+token);
            results[0]['token']=token;
            responce=JSON.stringify({code:'200',msg:'',data:results});
        }
        res.send(responce);
    }); */

});
router.get('/user_login_old', async function (req, res, next) {
    responce = await verifyPassword(req.query.mobileNo, req.query.userPassword);
    res.send(responce);
});

router.get('/get_booking_old', authenticate, async function (req, res, next) {
    result = await getBookings(req.query.pageId);
    if (result.length <= 0) {
        responce = JSON.stringify({ code: '501', message: 'user not found', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', message: '', data: result });
    }
    res.send(responce);

});
router.get('/cancel_booking_old', authenticate, async function (req, res, next) {
    result = await cancelBooking(req.query.bookingId, req.query.userId);
    if (result.length <= 0) {
        responce = JSON.stringify({ code: '501', message: 'something is going wrong please try after sometime', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', message: 'booking canceled successfully', data: '' });
    }
    res.send(responce);

});
router.get('/get_user_booking_old', authenticate, async function (req, res, next) {
    responce = await getBookingByUser(req.query.userId);
    res.send(responce);
    /*res1=getBookingByUser(req.query.userId,(err,results)=>{
        if(err){
            responce=JSON.stringify({code:'501',error:'user not found',data:''});
        }else{            
            //console.log("last inserted id="+results);
            responce=JSON.stringify({code:'200',msg:'',data:results});
        }
        res.send(responce);
    }); */

});

router.get('/get_booking_details_old', authenticate, async function (req, res, next) {
    responce = await getBookingById(req.query.bookingId);
    res.send(responce);
    /*res1=getBookingById(req.query.bookingId,(err,results)=>{
        if(err){
            responce=JSON.stringify({code:'501',error:'user not found',data:''});
        }else{            
            console.log("last inserted id="+results);
            responce=JSON.stringify({code:'200',msg:'',data:results});
        }
        res.send(responce);
    });     */
});
router.get('/get_search_log_old', authenticate, async function (req, res, next) {

    results = await getBookingSearchLog(req.query.userId, req.query.pageId);
    results = JSON.parse(results);
    //res.send(results);
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });

    } else {
        let resultsData = results.results;
        let rowCount = results.rowCount;
        let totalPage = Math.ceil(results.totalPage);
        responce = JSON.stringify({ code: '200', msg: 'log fetched successfully', data: resultsData, rowCount: rowCount, totalPage: totalPage });
    }
    res.send(responce);
    /*res1=getBookingSearchLog(req.query.userId,1,(err,results)=>{
        if(err){
            responce=JSON.stringify({code:'501',error:'user not found',data:''});
        }else{            
            console.log("last inserted id="+results);
            responce=JSON.stringify({code:'200',msg:'',data:results});
        }
        res.send(responce);
    }); */
});

router.get('/register_old', async function (req, res, next) {
    resultUser = await getUserByMobile(req.query.mobileNo);
    if (resultUser.length <= 0) {
        results = await createUser(req.query.fname, req.query.lname, req.query.mobileNo, req.query.email, req.query.type);
        console.log("==results==" + JSON.stringify(results));
        if (results.length <= 0) {
            responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
        } else {
            responce = JSON.stringify({ code: '200', msg: 'agent create successfully', data: results });
        }
    } else {
        responce = JSON.stringify({ code: '500', msg: 'User already registered', data: '' });
    }
    res.send(responce);
});
module.exports = router;

