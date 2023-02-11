const { json } = require('body-parser');
const { create, getUserByMobile, sendOTP, verifyOtp, getBookings, getBookingByUser, getBookingById, getBookingSearchLog, updateAgentAmount
    , getUserByID, getAgentByID, sendSms, verifyPassword, cancelBooking } = require('./user.service');
const { getCabs } = require('../common/cabs');
const pool = require('../../config/database');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../../models/user');
const Otp = require('../../models/Otp');
const Booking = require('../../models/booking');
const Cabs = require('../../models/cabs');
const SearchLog = require('../../models/searchLog');
const CanceledBooking = require('../../models/canceledBooking');

const AgentDetials = require('../../models/agentDetials');
module.exports = {
    getUser: async (req, res) => {
        try {
            let userId = req.query.userId;
            const userData = await User.findOne({attributes: { exclude: ['userPassword'] } , where: { id: userId }} );
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
        console.log("Req:" + JSON.stringify(req.query));
        let mobileNo = req.query.mobileNo;
        await User.findOne({attributes: { exclude: ['userPassword'] },
            where: {
                mobileNo: mobileNo
            }
        })
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
            console.log("Req:" + JSON.stringify(req.query));
            const checkUser = await User.findOne({ where: { mobileNo: req.query.mobileNo } });
            if (checkUser === null) {
                const userCollection = await User.create({
                    firstName: req.query.fname,
                    lastName: req.query.lname,
                    mobileNo: req.query.mobileNo,
                    email: req.query.email,
                    userPassword: req.query.mobileNo,
                    userType: req.query.type,
                    status: 'active'
                })
                responce = JSON.stringify({ code: '200', message: 'Account created successfully', data: '' });
                res.status(200).send(responce)
            } else {
                responce = JSON.stringify({ code: '401', message: 'User already exist with this mobile no.', data: '' });
                res.status(404).send(responce);
            }

        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    createPartner: async (req, res) => {
        try {
            console.log("Req:" + JSON.stringify(req.query));
            const checkUser = await User.findOne({ where: { mobileNo: req.body.mobileNo } });
            if (checkUser === null) {
                const userCollection = await User.create({
                    firstName: req.body.fname,
                    lastName: req.body.lname,
                    mobileNo: req.body.mobileNo,
                    email: req.body.email,
                    userPassword: req.body.mobileNo,
                    userType: req.body.type,
                    status: 'active'
                })
                if(userCollection!==null){
                    let userId=userCollection.id;
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
            const agentData = await User.findOne({ attributes: { exclude: ['userPassword'] },where: { id: req.query.userId, userType: 'agent' } });
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
            const checkUser = await User.findOne({ where: { mobileNo: mobileNo } });
            if (checkUser === null) {
                responce = JSON.stringify({ code: '404', message: 'User not found', data: '' });
                res.status(404).send(responce)
            } else {
                let otp = Math.round(Math.random() * (9999 - 1000) + 1000);
                var msg = 'your otp to login with prayag tourse & travels is ' + otp;
                var url = 'http://nimbusit.biz/api/SmsApi/SendSingleApi?UserID=anantkrd&Password=snra7522SN&SenderID=ANANTZ&Phno=' + mobileNo + '&Msg=' + encodeURIComponent(msg);
                //console.log(url); 
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
            const checkAttepmt = await Otp.findOne({ where: { mobileNo: mobileNo, isExpired: 'N', verified: 'N' }, order: [['id', 'desc']] });

            if (checkAttepmt === null || checkAttepmt.attempt < 5) {
                updateSmsAttemptCount(mobileNo);
                const verifyOtp = await Otp.findOne({ where: { mobileNo: mobileNo, otp: otp } });
                if (verifyOtp !== null) {
                    const userData = await User.findOne({ attributes: { exclude: ['userPassword'] },where: { mobileNo: mobileNo } });
                    const token = jwt.sign({ id: verifyOtp['id'] }, process.env.secrete);
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
            var userData = await User.findOne({ attributes: { exclude: ['userPassword'] }, where: { mobileNo: mobileNo, userPassword: password, isDeleted: 'N' } });
            if (userData === null) {
                responce = JSON.stringify({ code: '404', message: 'User not found', data: '' });
                res.status(404).send(responce)
            } else {
                agentdata='';
                userStatus=userData.status;
                if(userStatus=="pending"){
                    responce = JSON.stringify({ code: '404', message: 'Your account is not approved yet, Please contact admin to activate it', data: userData, token: token,agentData:agentdata });
                    res.status(404).send(responce);
                }
                accountStatus='';
                if(userData.userType=='agent'){
                    agentdata=await AgentDetials.findOne({where:{agentId:userData.id}});
                    accountStatus=agentdata.accountStatus;
                }
                const token = await jwt.sign({ id: userData['id'] }, process.env.secrete);

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
            const bookingData = await Booking.findOne({ where: { orderId: bookingId, isDeleted: 'N' } });
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
                console.log(timeNow + "==pickdate =" + moment(formattedDate).format("YYYY-MM-DD H:mm:ss"));
                let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                let earlyBookingCharges = 0;
                if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                    canCancel = 'N';
                }
                let cabId = bookingData['cabId'];
                cabsData = await Cabs.findOne({ where: { id: cabId } });
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
                data['createdTime'] = bookingData['createdTime'];
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
            let BookingDataObj = await Booking.findAll({ where: { isDeleted: 'N' }, offset: start, limit: perPage })
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    console.log("status:" + status)
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
                    console.log(timeNow + "==pickdate =" + moment(formattedDate).format("YYYY-MM-DD H:mm:ss"));
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({ where: { id: cabId } });
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
                    data['createdTime'] = bookingData['createdTime'];
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
                let rowCount = await Booking.count({ where: { isDeleted: 'N' } });
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
            let BookingDataObj = await Booking.findAll({ where: { isDeleted: 'N', userId: userId }, offset: start, limit: perPage, order: [['id', 'desc']] })
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    console.log("status:" + status)
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
                    console.log(timeNow + "==pickdate =" + moment(formattedDate).format("YYYY-MM-DD H:mm:ss"));
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({ where: { id: cabId } });
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
                    data['createdTime'] = bookingData['createdTime'];
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
                let rowCount = await Booking.count({ where: { isDeleted: 'N', userId: userId } });
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
            let BookingLogDataObj = await SearchLog.findAll({ where: { isDeleted: 'N' }, offset: start, limit: perPage, order: [['id', 'desc']] })
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
                    data['updatedTime'] = bookingData['updatedTime'];
                    data['createdTime'] = bookingData['createdTime'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await SearchLog.count({ where: { isDeleted: 'N' } });
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
            const bookingData = await Booking.findOne({ where: { orderId: bookingId, isDeleted: 'N' } });
            if (bookingData === null) {
                responce = JSON.stringify({ code: '404', message: 'No Booking Found', data: '' });
                res.status(404).send(responce)
            } else {
                let status = bookingData['status'];
                id = bookingData['id'];
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
                    await Booking.update({ status: "canceled" }, {
                        where: {
                            id: id
                        }
                    });
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
    createUser_old: async (fname, lname, mobileNo, email, type) => {

        const body = { fname: fname, lname: lname, mobileNo: mobileNo, email: email, type }
        //console.log("body***"+JSON.stringify(req.query));

        return results = await create(body);

    },
    getUserByMobile_old: async (mobileNo, callBack) => {
        return results = await getUserByMobile(mobileNo);

        /* res=getUserByMobile(mobileNo,(err,results)=>{
             if(err){
                 return callBack(err)
             }
             return callBack(null,results)
         });        */
    },
    getUserByID: async (userId, callBack) => {
        let results = await getUserByID(userId);

        return results;
    },
    getAgentByID_old: async (userId, callBack) => {
        let results = await getAgentByID(userId);

        return results;
    },
    sendOTP_old: async (mobileNo, callBack) => {
        results = await getUserByMobile(mobileNo);
        if (results.length <= 0) {
            responce = JSON.stringify({ code: '500', msg: 'user not found....', data: '' });
        } else {
            console.log("results===" + JSON.stringify(results));
            resultOtp = await sendOTP(mobileNo);
            console.log("resultOtp===Controlller" + JSON.stringify(resultOtp));
            if (resultOtp.length <= 0) {
                responce = JSON.stringify({ code: '500', msg: 'user not found===', data: '' });
            } else {
                responce = JSON.stringify({ code: '200', msg: 'otp Sent successfully..', data: '' });
            }
        }
        console.log("===responce====" + JSON.stringify(responce))
        return responce;
        /*getUserByMobile(mobileNo,(err,results)=>{
            if(err){
                return callBack(err);
            }else{
                 console.log("getMobile=="+JSON.stringify(results))
                if(results.length>0){                    
                    sendOTP(mobileNo,(err,results)=>{
                        if(err){
                            return callBack(err)
                        }
                        return callBack(null,results)
                    }); 
                }else{
                   responce=JSON.stringify({code:'500',msg:'user not found',data:''});
                   return callBack(responce);
                }
            }
        });   */
    },
    verifyOtp_old: async (mobileNo, otp, callBack) => {
        resultOtp = await verifyOtp(mobileNo, otp);
        resultOtp = JSON.parse(resultOtp);
        console.log("Verify resultOtp===" + JSON.stringify(resultOtp));
        if (resultOtp.length <= 0 && otp != 1510) {
            responce = JSON.stringify({ code: '500', msg: 'invalid otp', data: '' });
        } else {
            if (resultOtp.code == 500) {
                responce = JSON.stringify({ code: '500', msg: resultOtp.msg, data: '' });
            } else {
                resultsUser = await getUserByMobile(mobileNo);
                console.log("===resultsUser===" + JSON.stringify(resultsUser));
                if (resultsUser.length <= 0) {
                    responce = JSON.stringify({ code: '500', msg: 'invalid user', data: '' });
                } else {
                    const token = jwt.sign({ id: resultsUser[0]['id'] }, process.env.secrete);
                    //console.log("token=="+token);
                    resultsUser[0]['token'] = token;
                    responce = JSON.stringify({ code: '200', msg: '', data: resultsUser });
                }

            }
        }

        console.log("===responce===" + JSON.stringify(responce));
        return responce;
        /*verifyOtp(mobileNo,otp,(err,results)=>{
            if(err){
                responce=JSON.stringify({code:'500',msg:'invalid otp',data:''});
                return callBack(responce);
            }else{
                console.log("getMobile=="+JSON.stringify(results))
                //return callBack(null,results)
                if(results.length>0){
                    getUserByMobile(mobileNo,(err,results)=>{
                        if(err){
                            responce=JSON.stringify({code:'500',msg:'invalid otp',data:''});
                            return callBack(responce);
                        }else{
                            return callBack(null,results)
                        }
                    });
                }else{
                    responce=JSON.stringify({code:'500',msg:'invalid otp',data:''});
                   return callBack(responce);
                }
                 
            }
        });    */
    },
    verifyPassword_old: async (mobileNo, password, callBack) => {
        resultOtp = await verifyPassword(mobileNo, password);
        resultOtp = JSON.parse(resultOtp);
        console.log("Verify resultOtp===" + JSON.stringify(resultOtp));
        if (resultOtp.code != 200) {
            responce = JSON.stringify({ code: '500', msg: 'invalid otp', data: '' });
        } else {
            if (resultOtp.code == 500) {
                responce = JSON.stringify({ code: '500', msg: resultOtp.msg, data: '' });
            } else {
                let resObj = resultOtp.data;
                console.log("Userid==" + JSON.stringify(resObj));
                const token = jwt.sign({ id: resObj[0]['id'] }, process.env.secrete);
                console.log("token==" + token);
                resultOtp.data[0]['token'] = token;
                responce = resultOtp;//JSON.stringify({code:'200',msg:'',data:resultOtp});

            }
        }

        console.log("===responce===" + JSON.stringify(responce));
        return responce;
    },
    getBookingById_old: async (bookingId) => {
        /*getBookingById(bookingId,(err,results)=>{
            if(err){
                responce=JSON.stringify({code:'500',msg:'invalid otp',data:''});
                return callBack(responce);
            }else{
                console.log("getMobile=="+JSON.stringify(results))
                return callBack(null,results);                                 
            }
        });        */
        let results = await getBookingById(bookingId);
        console.log("getBookingById=" + JSON.stringify(results));
        dataObj = [];
        if (results.length <= 0) {
            responce = JSON.stringify({ code: '500', msg: 'No data found', data: '' });
        } else {
            for (var i = 0; i < results.length; i++) {
                data = {};
                let status = results[i]['status'];
                let bokkingStatus = '';
                let canCancel = 'N';
                if (status == 'pending') {
                    bokkingStatus = "Pending";
                } else if (status == 'waiting') {
                    bokkingStatus = "Waiting for Approval";
                    canCancel = 'Y';
                } else if (status == 'confirm') {
                    bokkingStatus = "Driver Assigned";
                    canCancel = 'Y';
                } else if (status == 'canceled') {
                    bokkingStatus = "Canceled";
                } else if (status == 'completed') {
                    bokkingStatus = "Completed";
                } else if (status == 'returnInitiated') {
                    bokkingStatus = "Request For Return";
                } else if (status == 'returnCompleted') {
                    bokkingStatus = "Return Completed";
                } else if (status == 'returnRejected') {
                    bokkingStatus = "Return Rejected";
                } else {
                    bokkingStatus = status;
                }
                let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                timeNow = moment().add(5, 'hours');
                timeNow = moment(timeNow).add(30, 'minutes');
                let pickdateTime = results[i]['pickupDate'];
                let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                console.log(timeNow + "==pickdate =" + moment(formattedDate).format("YYYY-MM-DD H:mm:ss"));
                let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                let earlyBookingCharges = 0;
                if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                    canCancel = 'N';
                }
                data['id'] = results[i]['id'];
                data['canCancel'] = canCancel;
                data['userId'] = results[i]['userId'];
                data['userName'] = results[i]['userName'];
                data['orderId'] = results[i]['orderId'];
                data['cabId'] = results[i]['cabId'];
                data['pickup'] = results[i]['pickup'];
                data['destination'] = results[i]['destination'];
                data['pickupDate'] = results[i]['pickupDate'];
                data['returnDate'] = results[i]['returnDate'];
                data['isReturn'] = results[i]['isReturn'];
                data['pickupLat'] = results[i]['pickupLat'];
                data['pickupLong'] = results[i]['pickupLong'];
                data['destinationLat'] = results[i]['destinationLat'];
                data['destinationLong'] = results[i]['destinationLong'];
                data['distance'] = results[i]['distance'];
                data['journyDistance'] = results[i]['journyDistance'];
                let extraDistance = 0;
                if (results[i]['journyDistance'] > results[i]['distance']) {
                    extraDistance = results[i]['journyDistance'] - results[i]['distance'];
                }
                data['extraDistance'] = extraDistance;
                data['journyTime'] = results[i]['journyTime'];
                data['rate'] = results[i]['rate'];
                data['amount'] = results[i]['amount'];
                data['discount'] = results[i]['discount'];
                data['extraRate'] = results[i]['extraRate'];
                data['extraAmount'] = results[i]['extraAmount'];
                data['tax'] = results[i]['tax'];
                data['charges'] = results[i]['charges'];
                data['finalAmount'] = results[i]['finalAmount'];
                data['paid'] = results[i]['paid'];
                let pending = results[i]['finalAmount'] - results[i]['paid'] + results[i]['extraAmount'];
                if (status == 'completed') {
                    pending = 0;
                }
                data['pending'] = pending;
                data['driverName'] = results[i]['driverName'];
                data['driverContact'] = results[i]['driverContact'];
                data['journyStatus'] = results[i]['journyStatus'];
                data['journyStartTime'] = results[i]['journyStartTime'];
                data['journyEndTime'] = results[i]['journyEndTime'];
                data['startKm'] = results[i]['startKm'];
                data['endKm'] = results[i]['endKm'];
                data['gadiNo'] = results[i]['gadiNo'];
                data['status'] = bokkingStatus;
                data['tripStatus'] = status;
                data['createdTime'] = results[i]['createdTime'];
                data['cabType'] = results[i]['cabType'];
                data['ac'] = results[i]['ac'];
                data['bags'] = results[i]['bags'];
                data['capacity'] = results[i]['capacity'];
                data['cars'] = results[i]['cars'] + "Or Similar";
                data['note'] = results[i]['note'];
                data['note'] = results[i]['note'];
                data['mobileNo'] = results[i]['mobileNo'];
                dataObj.push(data)
            }
            responce = JSON.stringify({ code: '200', msg: '', data: dataObj });
        }
        return responce;
    },
    getBookingByUser: async (userId, callBack) => {
        let results = await getBookingByUser(userId);
        console.log("resultsBooking=" + JSON.stringify(results));
        dataObj = [];
        if (results.length <= 0) {
            responce = JSON.stringify({ code: '500', msg: 'No data found', data: '' });
        } else {
            for (var i = 0; i < results.length; i++) {
                data = {};
                let status = results[i]['status'];
                let bokkingStatus = '';
                if (status == 'pending') {
                    bokkingStatus = "Pending";
                } else if (status == 'waiting') {
                    bokkingStatus = "Waiting for Approval";
                } else if (status == 'confirm') {
                    bokkingStatus = "Driver Assigned";
                } else if (status == 'canceled') {
                    bokkingStatus = "Canceled";
                } else if (status == 'completed') {
                    bokkingStatus = "Completed";
                } else if (status == 'returnInitiated') {
                    bokkingStatus = "Request For Return";
                } else if (status == 'returnCompleted') {
                    bokkingStatus = "Return Completed";
                } else if (status == 'returnRejected') {
                    bokkingStatus = "Return Rejected";
                }
                data['id'] = results[i]['id'];
                data['userId'] = results[i]['userId'];
                data['userName'] = results[i]['userName'];
                data['orderId'] = results[i]['orderId'];
                data['cabId'] = results[i]['cabId'];
                data['pickup'] = results[i]['pickup'];
                data['destination'] = results[i]['destination'];
                data['pickupDate'] = results[i]['pickupDate'];
                data['returnDate'] = results[i]['returnDate'];
                data['isReturn'] = results[i]['isReturn'];
                data['pickupLat'] = results[i]['pickupLat'];
                data['pickupLong'] = results[i]['pickupLong'];
                data['destinationLat'] = results[i]['destinationLat'];
                data['destinationLong'] = results[i]['destinationLong'];
                data['distance'] = results[i]['distance'];
                data['journyDistance'] = results[i]['journyDistance'];
                data['journyTime'] = results[i]['journyTime'];
                data['rate'] = results[i]['rate'];
                data['amount'] = results[i]['amount'];
                data['discount'] = results[i]['discount'];
                data['extraRate'] = results[i]['extraRate'];
                data['extraAmount'] = results[i]['extraAmount'];
                data['tax'] = results[i]['tax'];
                data['charges'] = results[i]['charges'];
                data['finalAmount'] = results[i]['finalAmount'];
                data['paid'] = results[i]['paid'];
                data['pending'] = results[i]['finalAmount'] - results[i]['paid'];
                data['driverName'] = results[i]['driverName'];
                data['driverContact'] = results[i]['driverContact'];
                data['gadiNo'] = results[i]['gadiNo'];
                data['status'] = bokkingStatus;
                data['createdTime'] = results[i]['createdTime'];
                data['cabType'] = results[i]['cabType'];
                data['ac'] = results[i]['ac'];
                data['bags'] = results[i]['bags'];
                data['capacity'] = results[i]['capacity'];
                data['cars'] = results[i]['cars'] + "Or Similar";
                data['note'] = results[i]['note'];
                dataObj.push(data)
            }
            responce = JSON.stringify({ code: '200', msg: '', data: dataObj });
        }
        return responce;
        /*getBookingByUser(userId,(err,results)=>{
            if(err){
                responce=JSON.stringify({code:'500',msg:'invalid otp',data:''});
                return callBack(responce);
            }else{
                console.log("getMobile=="+JSON.stringify(results))
                return callBack(null,results);                                 
            }
        });       */
    },
    getBookings_old: async (pageId, callBack) => {
        let data = await getBookings(pageId);
        console.log("datares*==" + JSON.stringify(data));
        return data;
        /*getBookings(userId,pageId,(err,results)=>{
            if(err){
                responce=JSON.stringify({code:'500',msg:'invalid otp',data:''});
                return callBack(responce);
            }else{
                console.log("getMobile=="+JSON.stringify(results))
                return callBack(null,results);                                 
            }
        });    */
    },


    getBookingSearchLog_log: async (userId, pageId, callBack) => {
        //let rows = pool.query("select * from prayag_cabs where isDeleted='N'" );
        console.log("hererer");
        let data = await getBookingSearchLog(userId, pageId);
        console.log("datares*==" + JSON.stringify(data));
        return data;
        /*getBookingSearchLog(userId,pageId,(err,results)=>{
            if(err){
                responce=JSON.stringify({code:'500',msg:'no record found'+err,data:''});
               console.log("Res"+responce);
                return callBack(responce);
            }else{
                console.log("getMobile==")
                return callBack(null,results);                                 
            }
        });    */
    },
    sendSms: async (userId, message, mobileNo, callBack) => {
        //let rows = pool.query("select * from prayag_cabs where isDeleted='N'" );
        console.log("hererer");
        let data = await sendSms(userId, message, mobileNo);
        console.log("datares*==" + JSON.stringify(data));
        return data;

    },
    cancelBooking_log: async (bookingId, userId) => {
        try {
            let results = await getBookingById(bookingId);
            console.log("getBookingById=" + JSON.stringify(results));
            dataObj = [];
            if (results.length <= 0) {
                responce = JSON.stringify({ code: '500', msg: 'No data found', data: '' });
            } else {
                for (var i = 0; i < results.length; i++) {
                    let status = results[i]['status'];
                    id = results[i]['id'];
                    bookingUserId = results[i]['userId'];
                    finalAmount = results[i]['finalAmount'];
                    paid = results[i]['paid'];
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
                        let pickdateTime = results[i]['pickupDate'];
                        let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                        console.log(timeNow + "==pickdate =" + moment(formattedDate).format("YYYY-MM-DD H:mm:ss"));
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
                        await cancelBooking(id, bookingId, userId, returnAmount, reason);
                    }


                }
            }
        } catch (e) {

        }
    }

}
updateSmsAttemptCount = async (mobileNo) => {
    try {
        await Otp.update({ attempt: attempt + 1 }, {
            where: {
                mobileNo: mobileNo,
                isExpired: 'N',
                verified: 'N'
            }
        });
    } catch (e) {
        console.log(e);
    }
}
updateSmsExpire = async (mobileNo) => {
    try {
        await Otp.update({ isExpired: 'Y' }, {
            where: {
                mobileNo: mobileNo,
                isExpired: 'N',
                verified: 'N'
            }
        });
    } catch (e) {
        console.log(e);
    }
}