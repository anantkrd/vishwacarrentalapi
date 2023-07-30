const { json } = require('body-parser');
const { create, getUserByMobile, sendOTP, verifyOtp, getBookings, getBookingByUser, getBookingById, getBookingSearchLog, updateAgentAmount
    , getUserByID, getAgentByID, sendSms, verifyPassword, cancelBooking } = require('./user.service');
const { getCabs } = require('../common/cabs');
//const pool = require('../../config/database');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../../models/user');
const Otp = require('../../models/Otp');
const Booking = require('../../models/booking');
const Cabs = require('../../models/cabs');
const SearchLog = require('../../models/searchLog');
const CanceledBooking = require('../../models/canceledBooking');
const Razorpay = require("razorpay");
const AgentDetials = require('../../models/agentDetials');
var SHA256 = require("crypto-js/sha256");

module.exports = {
    getUser: async (req, res) => {
        try {
            let userId = req.query.userId;
            const userData = await User.findOne({ _id: userId },{userPassword:0});
            //const userData = await User.findOne({attributes: { exclude: ['userPassword'] } , where: { id: userId }} );
            if (userData === null) {                
                responce = JSON.stringify({ code: '404', message: 'User Not Found', data: '' });
                res.status(404).send(responce)
            } else {
                responce = JSON.stringify({ code: '200', message: '', data: userData });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getUserByMobile: async (req, res) => {
        
        let mobileNo = req.query.mobileNo;
        await User.findOne({ mobileNo: mobileNo},{userPassword:0})
            .then(data => {
                if (data !== null) {
                    responce = JSON.stringify({ code: '200', message: '', data: data });
                    res.status(200).send(responce);
                } else {
                    responce = JSON.stringify({ code: '501', message: 'User Not Found', data: '' });
                    res.status(404).send(responce);
                }
            })
            .catch(err => {
                responce = JSON.stringify({ code: '501', message: err.message || "Some error occurred while retrieving tutorials.", data: '' });
                res.status(500).send(responce);
            });
    },    
    createUser: async (req, res) => {
        try {
           
            const checkUser = await User.findOne({mobileNo: req.body.mobileNo },{userPassword:0}).sort({createdAt:-1});
            //console.log("checkUser:"+JSON.stringify(checkUser));
            userId=1;
            const checkUserCount = await User.findOne().sort({createdAt:-1});
            if(checkUserCount==null){
                userId=1;
            }else{
                userId=checkUserCount.userId+1;
            }
            //console.log("userId:"+userId);
            let userPass=req.body.userPassword;
            userPassDec=SHA256(userPass).toString();
            if (checkUser === null) {
                const userCollection = await User.create({
                    firstName: req.body.fname,
                    lastName: req.body.lname,
                    mobileNo: req.body.mobileNo,
                    email: req.body.email,
                    userPassword: userPassDec,
                    userType: req.body.type,
                    status: 'active'
                })
                
                responce = JSON.stringify({ code: '200', message: 'Partner created successfully', data: '' });
                res.status(200).send(responce)
            } else {
                responce = JSON.stringify({ code: '401', message: 'User already exist with this mobile no.', data: '' });
                res.status(401).send(responce);
            }

        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred.", data: '' });
            res.status(500).send(responce);
        }
    },
    createPartner: async (req, res) => {
        try {
           
            const checkUser = await User.findOne({mobileNo: req.body.mobileNo },{userPassword:0}).sort({createdAt:-1});
            //console.log("checkUser:"+JSON.stringify(checkUser));
            userId=1;
            const checkUserCount = await User.findOne().sort({createdAt:-1});
            if(checkUserCount==null){
                userId=1;
            }else{
                userId=checkUserCount.userId+1;
            }
            //console.log("userId:"+userId);
            if (checkUser === null) {
                let userPass=req.body.userPassword;
                userPassDec=SHA256(userPass).toString();
                const userCollection = await User.create({
                    firstName: req.body.fname,
                    lastName: req.body.lname,
                    mobileNo: req.body.mobileNo,
                    email: req.body.email,
                    userPassword: userPassDec,
                    userType: req.body.type,
                    status: 'active'
                })
                //console.log("userCollection:"+JSON.stringify(userCollection));
                if(userCollection!==null){
                    let userId=userCollection._id;
                    const agentDetial=await AgentDetials.create({
                        agentId:userId,
                        accountStatus:"pending"
                    });
                }
                responce = JSON.stringify({ code: '200', message: 'Partner created successfully', data: '' });
                res.status(200).send(responce)
            } else {
                responce = JSON.stringify({ code: '401', message: 'User already exist with this mobile no.', data: '' });
                res.status(401).send(responce);
            }

        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred.", data: '' });
            res.status(500).send(responce);
        }
    },
    getAgentByID: async (req, res) => {
        try {
            const agentData = await User.findOne({ _id: req.query.userId, userType: 'agent' },{userPassword:0});
            if (agentData === null) {
                responce = JSON.stringify({ code: '404', message: 'Agent not found', data: '' });
                res.status(404).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: 'Agent found', data: agentData });
                res.status(200).send(responce)
            }
        } catch (e) {
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    sendOTP: async (req, res) => {
        try {
            let mobileNo = req.query.mobileNo
            const checkUser = await User.findOne({ mobileNo: mobileNo },{userPassword:0});
            if (checkUser === null) {
                responce = JSON.stringify({ code: '404', message: 'User not found', data: '' });
                res.status(404).send(responce)
            } else {
                let otp = Math.round(Math.random() * (9999 - 1000) + 1000);
                var msg = 'your otp to login with prayag tourse & travels is ' + otp;
                var url = 'http://nimbusit.biz/api/SmsApi/SendSingleApi?UserID=anantkrd&Password=snra7522SN&SenderID=ANANTZ&Phno=' + mobileNo + '&Msg=' + encodeURIComponent(msg);
                
                let resOtp = await module.exports.expireOtp(mobileNo);
                await request.get({ url: url }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log("==otp sent==" + JSON.stringify(response));
                    }
                });
                const otpCreated = await Otp.create({
                    mobileNo: mobileNo,
                    otp: otp
                })
                responce = JSON.stringify({ code: '200', msg: 'otp Sent successfully..', data: '' });
                res.status(200).send(responce)
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }


    },
    verifyOtp: async (req, res) => {
        try {
            let mobileNo = req.query.mobileNo;
            let otp = req.query.otp;
            const checkAttepmt = await Otp.findOne({mobileNo: mobileNo, isExpired: 'N', verified: 'N'});

            if (checkAttepmt === null || checkAttepmt.attempt < 5) {
                updateSmsAttemptCount(mobileNo);
                const verifyOtp = await Otp.findOne({ mobileNo: mobileNo, otp: otp });
                if (verifyOtp !== null) {
                    const userData = await User.findOne({  mobileNo: mobileNo },{userPassword:0});
                    const token = jwt.sign({ _id: verifyOtp['id'] }, process.env.secrete);
                    //userData[0]['token']=token;                    
                    responce = JSON.stringify({ code: '200', message: 'Verified', data: userData });
                    res.status(200).send(responce)
                } else {
                    responce = JSON.stringify({ code: '404', message: 'invalid OTP', data: '' });
                    res.status(404).send(responce)
                }
            } else {
                updateSmsExpire(mobileNo);
                responce = JSON.stringify({ code: '404', message: 'Otp Expired', data: '' });
                res.status(404).send(responce)
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    verifyPassword: async (req, res) => {
        try {

            let mobileNo = req.query.mobileNo;
            let password = req.query.userPassword;
            userPassDec=SHA256(password).toString();
            var userData = await User.findOne({mobileNo: mobileNo, userPassword: userPassDec, isDeleted: 'N'},{userPassword:0});
            if (userData === null || userData.length<=0) {
                responce = JSON.stringify({ code: '404', message: 'User not found', data: '' });
                res.status(404).send(responce)
            } else {
                agentdata='';
                const token = await jwt.sign({ _id: userData['userId'] }, process.env.secrete);
                userStatus=userData.status;
                if(userStatus=="pending"){
                    responce = JSON.stringify({ code: '404', message: 'Your account is not approved yet, Please contact admin to activate it', data: userData, token: token,agentData:agentdata });
                    res.status(404).send(responce);
                }
                accountStatus='';
                if(userData.userType=='agent'){
                    agentdata=await AgentDetials.findOne({agentId:userData._id});
                    accountStatus=agentdata.accountStatus;
                }
                

                responce = JSON.stringify({ code: '200', message: 'user found', data: userData, token: token,agentStatus:accountStatus });

                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },

    getBookingById: async (req, res) => {
        try {
            bookingId = req.query.bookingId;
            const bookingData = await Booking.findOne({orderId: bookingId, isDeleted: 'N' });
            if (bookingData === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce)
            } else {
                data = {};
                let status = bookingData['status'];
                let bookingStatus = '';
                let canCancel = 'N';
                if (status == 'pending') {
                    bookingStatus = "Pending";
                } else if (status == 'waiting') {
                    bookingStatus = "Waiting for Approval";
                    canCancel = 'Y';
                } else if (status == 'confirm') {
                    bookingStatus = "Driver Assigned";
                    canCancel = 'Y';
                } else if (status == 'canceled') {
                    bookingStatus = "Canceled";
                } else if (status == 'completed') {
                    bookingStatus = "Completed";
                } else if (status == 'returnInitiated') {
                    bookingStatus = "Request For Return";
                } else if (status == 'returnCompleted') {
                    bookingStatus = "Return Completed";
                } else if (status == 'returnRejected') {
                    bookingStatus = "Return Rejected";
                } else {
                    bookingStatus = status;
                }
                let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                timeNow = moment().add(5, 'hours');
                timeNow = moment(timeNow).add(30, 'minutes');
                let pickdateTime = bookingData['pickupDate'];
                let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
               
                let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                let earlyBookingCharges = 0;
                if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                    canCancel = 'N';
                }
                let cabId = bookingData['cabId'];
                cabsData = await Cabs.findOne({_id: cabId });
                let cabType = cabsData['cabType'];
                let ac = cabsData['ac'];
                let bags = cabsData['bags'];
                let capacity = cabsData['capacity'];
                let cars = cabsData['cars'];
                let note = cabsData['note'];
                data['id'] = bookingData['id'];
                data['canCancel'] = canCancel;
                data['userId'] = bookingData['userId'];
                data['userName'] = bookingData['userName'];
                data['orderId'] = bookingData['orderId'];
                data['cabId'] = bookingData['cabId'];
                data['pickup'] = bookingData['pickup'];
                data['destination'] = bookingData['destination'];
                data['pickupDate'] = bookingData['pickupDate'];
                data['returnDate'] = bookingData['returnDate'];
                data['isReturn'] = bookingData['isReturn'];
                data['pickupLat'] = bookingData['pickupLat'];
                data['pickupLong'] = bookingData['pickupLong'];
                data['destinationLat'] = bookingData['destinationLat'];
                data['destinationLong'] = bookingData['destinationLong'];
                data['distance'] = bookingData['distance'];
                data['journyDistance'] = bookingData['journyDistance'];
                let extraDistance = 0;
                if (bookingData['journyDistance'] > bookingData['distance']) {
                    extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                }
                data['extraDistance'] = extraDistance;
                data['journyTime'] = bookingData['journyTime'];
                data['rate'] = bookingData['rate'];
                data['amount'] = bookingData['amount'];
                data['discount'] = bookingData['discount'];
                data['extraRate'] = bookingData['extraRate'];
                data['extraAmount'] = bookingData['extraAmount'];
                data['tax'] = bookingData['tax'];
                data['charges'] = bookingData['charges'];
                data['finalAmount'] = bookingData['finalAmount'];
                data['paid'] = bookingData['paid'];
                let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                if (status == 'completed') {
                    pending = 0;
                }
                data['pending'] = pending;
                data['driverName'] = bookingData['driverName'];
                data['driverContact'] = bookingData['driverContact'];
                data['journyStatus'] = bookingData['journyStatus'];
                data['journyStartTime'] = bookingData['journyStartTime'];
                data['journyEndTime'] = bookingData['journyEndTime'];
                data['startKm'] = bookingData['startKm'];
                data['endKm'] = bookingData['endKm'];
                data['gadiNo'] = bookingData['gadiNo'];
                data['status'] = bookingStatus;
                data['tripStatus'] = status;
                data['createdTime'] = bookingData['createdAt'];
                data['cabType'] = cabType;
                data['ac'] = ac;
                data['bags'] = bags;
                data['capacity'] = capacity;
                data['cars'] = cars + " Or Similar";
                data['note'] = note;
                data['mobileNo'] = bookingData['mobileNo'];
                responce = JSON.stringify({ code: '200', message: '', data: data });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getBookings: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let dataObj = [];
            let BookingDataObj = await Booking.findAll({isDeleted: 'N' }).sort({createdAt:-1}).skip(start).limit(perPage);
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    
                    let canCancel = 'N';
                    if (status == 'pending') {
                        bookingStatus = "Pending";
                    } else if (status == 'waiting') {
                        bookingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bookingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    } else if (status == 'canceled') {
                        bookingStatus = "Canceled";
                    } else if (status == 'completed') {
                        bookingStatus = "Completed";
                    } else if (status == 'returnInitiated') {
                        bookingStatus = "Request For Return";
                    } else if (status == 'returnCompleted') {
                        bookingStatus = "Return Completed";
                    } else if (status == 'returnRejected') {
                        bookingStatus = "Return Rejected";
                    } else {
                        bookingStatus = status;
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                   
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({_id: cabId });
                    let cabType = cabsData['cabType'];
                    let ac = cabsData['ac'];
                    let bags = cabsData['bags'];
                    let capacity = cabsData['capacity'];
                    let cars = cabsData['cars'];
                    let note = cabsData['note'];
                    data['id'] = bookingData['id'];
                    data['canCancel'] = canCancel;
                    data['userId'] = bookingData['userId'];
                    data['userName'] = bookingData['userName'];
                    data['orderId'] = bookingData['orderId'];
                    data['cabId'] = bookingData['cabId'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['isReturn'] = bookingData['isReturn'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    let extraDistance = 0;
                    if (bookingData['journyDistance'] > bookingData['distance']) {
                        extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                    }
                    data['extraDistance'] = extraDistance;
                    data['journyTime'] = bookingData['journyTime'];
                    data['rate'] = bookingData['rate'];
                    data['amount'] = bookingData['amount'];
                    data['discount'] = bookingData['discount'];
                    data['extraRate'] = bookingData['extraRate'];
                    data['extraAmount'] = bookingData['extraAmount'];
                    data['tax'] = bookingData['tax'];
                    data['charges'] = bookingData['charges'];
                    data['finalAmount'] = bookingData['finalAmount'];
                    data['paid'] = bookingData['paid'];
                    let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                    if (status == 'completed') {
                        pending = 0;
                    }
                    data['pending'] = pending;
                    data['driverName'] = bookingData['driverName'];
                    data['driverContact'] = bookingData['driverContact'];
                    data['journyStatus'] = bookingData['journyStatus'];
                    data['journyStartTime'] = bookingData['journyStartTime'];
                    data['journyEndTime'] = bookingData['journyEndTime'];
                    data['startKm'] = bookingData['startKm'];
                    data['endKm'] = bookingData['endKm'];
                    data['gadiNo'] = bookingData['gadiNo'];
                    data['status'] = bookingStatus;
                    data['tripStatus'] = status;
                    data['createdTime'] = bookingData['createdAt'];
                    data['cabType'] = cabType;
                    data['ac'] = ac;
                    data['bags'] = bags;
                    data['capacity'] = capacity;
                    data['cars'] = cars + " Or Similar";
                    data['note'] = note;
                    data['mobileNo'] = bookingData['mobileNo'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await Booking.find({isDeleted: 'N' }).count();
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getMyBookings: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let userId = req.query.userId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let dataObj = [];
            let BookingDataObj = await Booking.find({isDeleted: 'N', userId: userId }).sort({createdAt:-1}).skip(start).limit(perPage);
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    
                    let canCancel = 'N';
                    if (status == 'pending') {
                        bookingStatus = "Pending";
                    } else if (status == 'waiting') {
                        bookingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bookingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    } else if (status == 'canceled') {
                        bookingStatus = "Canceled";
                    } else if (status == 'completed') {
                        bookingStatus = "Completed";
                    } else if (status == 'returnInitiated') {
                        bookingStatus = "Request For Return";
                    } else if (status == 'returnCompleted') {
                        bookingStatus = "Return Completed";
                    } else if (status == 'returnRejected') {
                        bookingStatus = "Return Rejected";
                    } else {
                        bookingStatus = status;
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                   
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({_id: cabId});
                    let cabType = cabsData['cabType'];
                    let ac = cabsData['ac'];
                    let bags = cabsData['bags'];
                    let capacity = cabsData['capacity'];
                    let cars = cabsData['cars'];
                    let note = cabsData['note'];
                    let userId=bookingData['userId'];
                    const agentData = await User.findOne({ _id: userId, userType: 'agent' },{userPassword:0});
                    data['id'] = bookingData['id'];
                    data['canCancel'] = canCancel;
                    data['userId'] = bookingData['userId'];
                    data['userName'] = bookingData['userName'];
                    data['orderId'] = bookingData['orderId'];
                    data['cabId'] = bookingData['cabId'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['isReturn'] = bookingData['isReturn'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    let extraDistance = 0;
                    if (bookingData['journyDistance'] > bookingData['distance']) {
                        extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                    }
                    data['extraDistance'] = extraDistance;
                    data['journyTime'] = bookingData['journyTime'];
                    data['rate'] = bookingData['rate'];
                    data['amount'] = bookingData['amount'];
                    data['discount'] = bookingData['discount'];
                    data['extraRate'] = bookingData['extraRate'];
                    data['extraAmount'] = bookingData['extraAmount'];
                    data['tax'] = bookingData['tax'];
                    data['charges'] = bookingData['charges'];
                    data['finalAmount'] = bookingData['finalAmount'];
                    data['paid'] = bookingData['paid'];
                    let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                    if (status == 'completed') {
                        pending = 0;
                    }
                    data['pending'] = pending;
                    data['driverName'] = bookingData['driverName'];
                    data['driverContact'] = bookingData['driverContact'];
                    data['journyStatus'] = bookingData['journyStatus'];
                    data['journyStartTime'] = bookingData['journyStartTime'];
                    data['journyEndTime'] = bookingData['journyEndTime'];
                    data['startKm'] = bookingData['startKm'];
                    data['endKm'] = bookingData['endKm'];
                    data['gadiNo'] = bookingData['gadiNo'];
                    data['status'] = bookingStatus;
                    data['tripStatus'] = status;
                    data['createdTime'] = bookingData['createdAt'];
                    data['cabType'] = cabType;
                    data['ac'] = ac;
                    data['bags'] = bags;
                    data['capacity'] = capacity;
                    data['cars'] = cars + " Or Similar";
                    data['note'] = note;
                    data['mobileNo'] = bookingData['mobileNo'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await Booking.find({isDeleted: 'N', userId: userId }).count();
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getBookingSearchLog: async (req, res) => {

        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let dataObj = [];
            let BookingLogDataObj = await SearchLog.find({isDeleted: 'N' }).sort({createdAt:-1}).skip(start).limit(perPage);
            if (BookingLogDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'No Booking Log found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingLogDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    data['id'] = bookingData['id'];
                    data['mobileNo'] = bookingData['mobileNo'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['city'] = bookingData['city'];
                    data['district'] = bookingData['district'];
                    data['state'] = bookingData['state'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    data['note'] = bookingData['note'];
                    data['updatedTime'] = bookingData['updatedAt'];
                    data['createdTime'] = bookingData['createdAt'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await SearchLog.find({isDeleted: 'N' }).count();
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    cancelBooking: async (req, res) => {
        try {
            let bookingId = req.query.bookingId;
            let userId = req.query.userId;
            const bookingData = await Booking.findOne({orderId: bookingId, isDeleted: 'N' });
            if (bookingData === null) {
                responce = JSON.stringify({ code: '404', message: 'No Booking Found', data: '' });
                res.status(404).send(responce)
            } else {
                let status = bookingData['status'];
                id = bookingData['_id'];
                bookingUserId = bookingData['userId'];
                finalAmount = bookingData['finalAmount'];
                paid = bookingData['paid'];
                let bokkingStatus = '';
                let canCancel = 'N';

                if (bookingUserId == userId) {
                    if (status == 'waiting') {
                        bokkingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bokkingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");

                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    returnAmount = 0;
                    if (tripBookingBEforHours > 24 && canCancel == 'Y') {
                        returnAmount = paid;
                    } else if (tripBookingBEforHours > 2 && canCancel == 'Y') {
                        returnAmount = (finalAmount * 50) / 100;
                        if (paid < returnAmount) {
                            returnAmount = paid;
                        }
                    }
                    reason = 'Booking canceled by customer';
                    await Booking.updateOne({_id: id},{$set:{status: "canceled" }});
                    const userCollection = await CanceledBooking.create({
                        bookingId: id,
                        orderId: bookingId,
                        canceledBy: 'customer',
                        userId: userId,
                        returnAmount: returnAmount,
                        reason: reason,
                        returnStatus: 'pending'
                    });

                    responce = JSON.stringify({ code: '404', message: 'Booking cancelled successfully', data: '' });
                    res.status(404).send(responce)
                } else {
                    responce = JSON.stringify({ code: '404', message: "Sorry, you can not cancel this booking", data: '' });
                    res.status(404).send(responce)
                }
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    updatePassword: async (req, res) => {
        try {
            let userPassword = req.body.userPassword;
            let userId = req.body.userId;
            userPassDec=SHA256(userPassword).toString();
            await User.updateOne({_id: userId},{$set:{userPassword: userPassDec }});
            responce = JSON.stringify({ code: '200', message: 'Password updated', data: '', rowCount: '', totalPage: '' });
            res.status(200).send(responce);        
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    }

}
updateSmsAttemptCount = async (mobileNo) => {
    try {
        await Otp.updateOne({
            mobileNo: mobileNo,
            isExpired: 'N',
            verified: 'N'
        },{ $set:{attempt: attempt + 1 }});
    } catch (e) {
        console.log(e);
    }
}
updateSmsExpire = async (mobileNo) => {
    try {
        await Otp.updateOne({
            mobileNo: mobileNo,
            isExpired: 'N',
            verified: 'N'
        },{$set:{isExpired: 'Y' }});
    } catch (e) {
        console.log(e);
    }
}
