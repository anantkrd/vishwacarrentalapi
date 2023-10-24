const { json } = require('body-parser');
const { sentBookingSmsToCustomer,logSerchedSmsm } = require('../common/sendSms');
const pool = require('../../config/database');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../../models/user');
const Otp = require('../../models/Otp');
const Booking = require('../../models/booking');
const Cabs = require('../../models/cabs');
const SearchLog = require('../../models/searchLog');
const CanceledBooking = require('../../models/canceledBooking');
const Surge = require('../../models/surge');
const BookingPayment = require('../../models/bookingPayment');
const SpecialPrices = require('../../models/specialPrices');
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var SHA256 = require("crypto-js/sha256");
//const { Sequelize, DataTypes, Model } = require('sequelize');
module.exports = {
    bookCab: async (req, res) => {
        try {
            
            let userId = '';
            let error = '';
            let isValid='Y';
            let fname = req.body.fname;
            let lname = req.body.lname;
            let mobileNo = req.body.mobileNo;
            let email = req.body.email;
            let orderId = req.body.bookingId;
            let cabId = req.body.cabId;
            let pickup = req.body.pickup;
            let destination = req.body.destination;
            let pickupDate = req.body.pickupDate;
            let returnDate = req.body.returnDate;
            let isReturn = req.body.isReturn;
            let pickupLat = req.body.pickupLat;
            let pickupLong = req.body.pickupLong;
            let destinationLat = req.body.destinationLat;
            let destinationLong = req.body.destinationLong;
            let distance = req.body.distance;
            let rate = req.body.rate;
            let amount = req.body.amount;
            let discount = req.body.discountAmount;
            let finalAmount = req.body.finalAmount;
            let status = req.body.status;
            let pickupCityName = req.body.pickupCityName;
            let pickupDistrict = req.body.pickupDistrict;
            let pickupState = req.body.pickupState;
            let dropCityName = req.body.dropCityName;
            let dropDistrict = req.body.dropDistrict;
            let dropState = req.body.dropState;
            let journyTime = req.body.journyTime;
            let extraRate = req.body.extraRate;
            userId = req.body.userId;
            
            if(pickupDistrict=='' || pickupDistrict==null){
                pickupDistrict=pickupState;
            }
            if(dropDistrict=='' || dropDistrict==null){
                dropDistrict=dropState;
            }
            let payment_orderId = req.body.payment_orderId;
            let responce;
            
            if(userId=='' || userId==null|| userId==undefined){
                console.log("In IF");
                const checkUser = await User.findOne({ mobileNo: req.body.mobileNo },{userPassword:0});
                //console.log("checkUser:"+checkUser);
                if (checkUser === null) {
                    const checkUserEmail = await User.findOne({ email: req.body.email },{userPassword:0});
                    if(checkUserEmail===null){
                        let ObjectId = Schema.ObjectId;
                        let userPass=req.body.mobileNo;
                        userPassDec=SHA256(userPass).toString();
                        const userCollection = await User.create({                            
                            firstName: req.body.fname,
                            lastName: req.body.lname,
                            mobileNo: req.body.mobileNo,
                            email: req.body.email,
                            userPassword: userPassDec,
                            userType: 'user',
                            status: 'Active'
                        })
                        userId = userCollection._id;
                    }else{
                        error="Email already exist with differant mobile no.";
                        isValid='N';                        
                        
                    }
                } else {
                    userId = checkUser._id;
                }
            }
            
            userName = fname + " " + lname;
            if(returnDate=="0000-00-00 00:00:00"){
                returnDate=null;
            }
            bookingData=null;
            if(isValid=='Y'){
                bookingData = await Booking.create({
                    userId: userId, userName: userName, email: email, orderId: orderId, cabId: cabId, pickup: pickup, destination: destination, pickupDate: pickupDate, returnDate: returnDate, isReturn: isReturn, pickupLat: pickupLat, pickupLong: pickupLong,
                    destinationLat: destinationLat, destinationLong: destinationLong, distance: distance, rate: rate, amount: amount, discount: discount, finalAmount: finalAmount, status: 'pending', journyTime: journyTime,
                    payment_orderId: payment_orderId, pickupCityName: pickupCityName, pickupDistrict: pickupDistrict, pickupState: pickupState,
                    dropCityName: dropCityName, dropDistrict: dropDistrict, dropState: dropState, userMobileNo: mobileNo, extraRate: extraRate
                });
                if (bookingData !== null) {
                    responce = JSON.stringify({ code: '200', message: "Booking Created successfully", data: bookingData });
                    res.status(200).send(responce);
                } else {
                    responce = JSON.stringify({ code: '400', message: "Sorry, something went wrong", data: '' });
                    res.status(200).send(responce);
                }
            }else{
                responce = JSON.stringify({ code: '400', message: "Email already exist with differant mobile no.", data: '' });
                res.status(200).send(responce);
            }
            
            
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getCabs: async (req, res) => {
        try {
            
            distance.key('AIzaSyDzlGIoqMbQKaNwu1tCMXCtW3UEjzCfUvs');
            distance.mode('driving');
           
            originObj = JSON.parse(req.query.originObj);
            destinationObj = JSON.parse(req.query.destinationObj);
            
            let originlat = originObj.lat;
            let originlng = originObj.lng;
            let destinationlat = destinationObj.lat;
            let destinationlng = destinationObj.lng;
            let pickupCity = req.query.pickupCity;
            let destinationCity = req.query.destinationCity;
            let pickdateTime = req.query.pickdateTime;
            let returnDateTime = req.query.returnDateTime;
            let mobileNo = req.query.mobileNo;
            let bookingId = req.query.bookingId;
            let userId = req.query.userId;
            
            var origins = [originObj.lat + ',' + originObj.lng];
            var destinations = [destinationObj.lat + ',' + destinationObj.lng];

            let pickupCityName = req.query.pickupCityName;
            let pickupDistrict = req.query.pickupDistrict;
            let pickupState = req.query.pickupState;
            let dropCityName = req.query.dropCityName;
            let dropDistrict = req.query.dropDistrict;
            let dropState = req.query.dropState;
            if(pickupDistrict=='' || pickupDistrict==null){
                pickupDistrict=pickupState;
            }
            if(dropDistrict=='' || dropDistrict==null){
                dropDistrict=dropState;
            }
            console.log("pickdateTime:"+pickdateTime)
            let timeNow = moment().format("YYYY-MM-DD HH:mm:ss");
            timeNow = moment().add(5, 'hours');
            timeNow = moment(timeNow).add(30, 'minutes');
            
            let formattedDate = moment(pickdateTime).format("YYYY-MM-DD HH:mm:ss");
            console.log("formattedDate:"+formattedDate);
            let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
            
            let earlyBookingCharges = 0;
            if (tripBookingBEforHours < 10) {
                earlyBookingCharges = Math.round((6 / tripBookingBEforHours) * 100) / 100;
            }
            
            let distancekm = 0;
                   
            distance.matrix(origins, destinations, async function (err, distances) {
                if (!err)
                    
                    distanceObj = JSON.parse(distances.rows[0].elements[0].distance.value);
                journyTime = JSON.parse(distances.rows[0].elements[0].duration.value);
                journyTime1 = distances.rows[0].elements[0].duration.text.toString();

                distancekm = 0;
                distancekm = Math.round(distanceObj / 1000);
                surgekm = Math.round(distancekm / 100);
                
                let tripType = "india";
                if (distancekm <= 80) {
                    tripType = "local";
                }
                let searchLog = [];
                //booking=[data.mobileNo,data.pickup,data.destination,data.pickupDate,data.returnDate,data.pickupLat,data.pickupLong,data.destinationLat,data.destinationLong,data.distance,data.journyTime,'N'];

                let sedanPrice = 0;
                let luxuryPrice = 0;
                let compactPrice = 0;  
                     
                let surgePickpuResult = await Surge.findOne({isDeleted: 'N', city: {$regex:'.*'+pickupCityName+'.*'}} ).sort({city:-1}); 
                
                //let surgePickpuResult = await Surge.findOne({ where: {[Op.or]:{ city: { [Op.like]: '%' + pickupCityName + '%' },location: { [Op.like]: '%' + pickupDistrict + '%' } }} ,order: [['city', 'DESC']]});
               
                let destinationcityName = destinationCity.split(",")[0];
                
                let surgedestinationResult = await Surge.findOne({isDeleted: 'N', city: {$regex:'.*'+destinationcityName+'.*'}} ).sort({city:-1});
                
                //let surgedestinationResult = await Surge.findOne({ where: {[Op.or]:{ city: { [Op.like]: '%' + destinationcityName + '%' },location: { [Op.like]: '%' + dropDistrict + '%' } }} ,order: [['city', 'DESC']]});
                
                if (surgePickpuResult === null || surgePickpuResult.length<=0) {
                    let surgePickpuResultOther = await Surge.findOne({city:'Other'});
                    if(surgePickpuResultOther==null || surgePickpuResultOther.length<=0){
                        surgePickpuResult = { "city": "Pune", "surge": '{"Hatchback":1,"Sedan":1,"Ertiga":1,"Innova":1,"Innova Crysta":1,"other":1,"local":20}' };
                    }else{
                        surgePickpuResult=surgePickpuResultOther;
                    }                    
                }
                if (surgedestinationResult === null || surgedestinationResult.length<=0) {
                    let surgedestinationResultOther = await Surge.findOne({city:'Other'});
                    if(surgedestinationResultOther===null || surgedestinationResultOther.length<=0){
                        surgedestinationResult = { "city": "Pune", "surge": '{"Hatchback":1,"Sedan":1,"Ertiga":1,"Innova":1,"Innova Crysta":1,"other":1,"local":20}' };
                    }else{
                        surgedestinationResult=surgedestinationResultOther;
                    }                    
                }

                //let results=await getCabs(req);
                cabObj = await Cabs.find({isDeleted: 'N' });
                distanceValue = distancekm;
                dataObj = [];
                let logPrice = '';
                if (cabObj.length <= 0) {
                    responce = JSON.stringify({ code: '501', message: 'Something went wrong, please try later', data: '' });
                    res.status(404).send(responce);
                } else {
                    for (const cabData of cabObj) {
                        rate = cabData['rate'];
                        
                        let originalRate = rate;
                        returnTripRate = cabData['returnTripRate'];
                        id = cabData['_id'];
                        
                        cabType = cabData['cabType'];
                        let speacialRate=0;
                        let speacialReturnRate=0;
                        let speacialExtraRate=0;
                        const weekDay = moment(pickdateTime).day();
                        const pickdateTimeFormate = moment(pickdateTime).format("YYYY-MM-DD");
                        let specialPricesResult=await SpecialPrices.findOne({cabType:cabType,type:'dateRange',isDeleted:'N',startDate:{$gt:pickdateTimeFormate},startDate:{$lte:pickdateTimeFormate}}).sort({createdAt:-1});
                        if(specialPricesResult===null){
                            if(weekDay==0 || weekDay==6){
                                let specialPricesWeekDayResult=await SpecialPrices.findOne({cabType:cabType,type:'weekday',isDeleted:'N'}).sort({createdAt:-1});
                                if(specialPricesWeekDayResult!=null){
                                    speacialRate=specialPricesWeekDayResult['rate'];
                                    speacialReturnRate=specialPricesWeekDayResult['returnTripRate'];
                                    speacialExtraRate=specialPricesWeekDayResult['extraRate'];
                                }
                            }
                        }else{
                            speacialRate=specialPricesResult['rate'];
                            speacialReturnRate=specialPricesResult['returnTripRate'];
                            speacialExtraRate=specialPricesResult['extraRate'];
                        }
                        rate=rate+speacialRate;
                        returnTripRate=returnTripRate+speacialReturnRate;
                        discount = cabData['discount'];

                        finalRate = rate + earlyBookingCharges;
                        image = cabData['image'];
                        
                        ac = cabData['ac'];
                        bags = cabData['bags'];
                        cars = cabData['cars'];
                        capacity = cabData['capacity'];
                        note = cabData['note'];
                        extraRate = cabData['extraRate']+speacialExtraRate;
                        multiply = 2;
                        distanceValue = 0;
                        let isReturnTrip = 'N';
                        let tripDays = 0;

                        let PerDayKm = cabData['PerDayKmReturn'];
                        let PerDayKmSingle = cabData['PerDayKmSingle'];
                        if (returnDateTime == "" || returnDateTime == undefined || returnDateTime == 'undefined' || returnDateTime == "0000-00-00 00:00:00") {
                            multiply = 1;
                            finalRate = rate + earlyBookingCharges;
                            if (PerDayKmSingle > distancekm) {
                                distanceValue = PerDayKmSingle;
                            } else {
                                distanceValue = distancekm;
                            }

                            returnDateTime = "0000-00-00 00:00:00";
                        } else {
                            distanceValue = distancekm * 2;
                                                   
                            finalRate = returnTripRate + earlyBookingCharges;
                            originalRate = returnTripRate;
                            isReturnTrip = 'Y';
                            tripDays = moment(returnDateTime).diff(moment(pickdateTime), 'days') + 1;
                            let calculateKm = 0;

                            if (tripDays > 1) {
                                calculateKm = PerDayKm * tripDays;
                            } else {
                                calculateKm = PerDayKm;
                            }
                            
                            if (calculateKm > distanceValue) {
                                distanceValue = calculateKm;
                            } else {
                                calculateKm = distanceValue;
                            }
                        }
                        let cabTypecheck = cabType.toLowerCase();
                                                
                        surgePrice = 0;
                        //console.log("cabTypecheck=="+cabTypecheck+"==isReturnTrip=="+isReturnTrip+"=surgePickpuResult=="+JSON.stringify(surgePickpuResult)+"===surgedestinationResult=="+JSON.stringify(surgedestinationResult));
                        if (isReturnTrip == 'N') {
                            let pickSurge=0;
                            let dropSurge=0;
                            if (cabTypecheck != "" ) {
                                if(surgePickpuResult!=null){
                                    let surgeDataPickup = JSON.parse(surgePickpuResult['surge']);
                                    
                                    pickSurge=surgeDataPickup[cabType];
                                }
                                if(surgedestinationResult!=null){
                                    let surgeDataDrop = JSON.parse(surgedestinationResult['surge']);
                                    
                                    dropSurge=surgeDataDrop[cabType];
                                }
                                
                                if (tripType == 'local' && distanceValue <= 80) {
                                    surgePrice = surgeDataPickupObj['local'];
                                } else {
                                    if(pickSurge>0){
                                        surgePrice = surgekm * pickSurge;                                       
                                    }
                                    if(dropSurge>0){
                                        surgePrice = surgePrice + (surgekm * dropSurge);
                                    }                                    
                                }
                                finalRate = finalRate + surgePrice;
                                sedanPrice = finalRate;
                            } else {
                                surgePrice = surgekm * 1;
                                surgePrice = surgePrice + (surgekm * 1);

                                finalRate = finalRate + surgePrice;
                                sedanPrice = finalRate;
                            }
                            
                        } else {
                            sedanPrice = finalRate;
                        }

                        let amount = Math.round(distanceValue * finalRate);
                        discountAmount = Math.round(distanceValue * discount);
                        discountedRate = finalRate - discount;
                        finalAmount = Math.round(distanceValue * discountedRate);

                        idKey = Math.floor(Math.random() * (999 - 100))
                        logPrice = logPrice + " " + cabType + ":" + finalAmount;
                        dataObj1 = {};
                        bookingId = idKey + "" + new Date().valueOf();
                        dataObj1['_id'] = id;
                        dataObj1['bookingId'] = bookingId;
                        dataObj1['userId'] = userId;
                        dataObj1['surgePrice'] = surgePrice;
                        dataObj1['discount'] = discount;
                        dataObj1['finalRate'] = finalRate;
                        

                        dataObj1['pickupCityName'] = pickupCityName;
                        dataObj1['pickupDistrict'] = pickupDistrict;
                        dataObj1['pickupState'] = pickupState;
                        dataObj1['dropCityName'] = dropCityName;
                        dataObj1['dropDistrict'] = dropDistrict;
                        dataObj1['dropState'] = dropState;
                        dataObj1['cabType'] = cabType;
                        dataObj1['image'] = image;
                        dataObj1['ac'] = ac;
                        dataObj1['bags'] = bags;
                        dataObj1['cars'] = cars;
                        dataObj1['capacity'] = capacity;
                        dataObj1['note'] = note;
                        dataObj1['amount'] = amount;
                        dataObj1['journyTime'] = journyTime1;
                        dataObj1['discountAmount'] = discountAmount;
                        dataObj1['rate'] = discountedRate;
                        dataObj1['finalAmount'] = finalAmount;
                        dataObj1['mobileNo'] = mobileNo;
                        dataObj1['pickupCity'] = pickupCity;
                        dataObj1['destinationCity'] = destinationCity;
                        dataObj1['pickupDate'] = pickdateTime;
                        dataObj1['returnDateTime'] = returnDateTime;
                        dataObj1['originlat'] = originlat;
                        dataObj1['originlng'] = originlng;
                        dataObj1['destinationlat'] = destinationlat;
                        dataObj1['destinationlng'] = destinationlng;
                        dataObj1['distance'] = distanceValue;
                        dataObj1['originalRate'] = originalRate;
                        dataObj1['extraRate'] = extraRate;

                        //dataObj1['originlng']=originlng;
                        dataObj.push(dataObj1);
                    }
                    //responce=JSON.stringify({code:'200',msg:'',data:dataObj});
                    if(returnDateTime=="0000-00-00 00:00:00"){
                        returnDateTime=null;
                    }
                    await SearchLog.create({
                        mobileNo:mobileNo,
                        pickup:pickupCity,
                        destination:destinationCity,
                        city:pickupCityName,
                        district:pickupDistrict,
                        state:pickupState,
                        pickupDate:pickdateTime,
                        returnDate:returnDateTime,
                        pickupLat:originlat,
                        pickupLong:originlng,
                        destinationLat:destinationlat,
                        destinationLong:destinationlng,
                        distance:distanceValue,
                        journyTime:journyTime1,
                        note:logPrice
                    });
                    responce = JSON.stringify({ code: '200', message: "", data: dataObj });
                    let sms=logSerchedSmsm(mobileNo,pickupCityName,destinationCity,pickdateTime);
                    res.status(200).send(responce);
                }
            });
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    payment: async (req, res) => {
        try {
            let amount = req.body.amount;
            let receiptId = req.body.bookingId;
            let mobileNo = req.body.mobileNo;
            const instance = new Razorpay({
                key_id: process.env.paymentId,
                key_secret: process.env.paymentSecreat,
            });
            
            const options = {
                amount: amount, // amount in smallest currency unit
                currency: "INR",
                receipt: receiptId,
            };
            const order = await instance.orders.create(options);
            
            let orgAmount = amount / 100;
            if (!order) {
                responce = JSON.stringify({ code: '501', message: "Sorry, something went wrong", data: '' });
                res.status(500).send(responce);
            } else {
                
                let payId=order.id;
                //console.log("payId:=="+payId)
                let bookingPayData = await BookingPayment.create({
                    bookingId: receiptId,
                    paymentId: payId,
                    mobileNo: mobileNo,
                    amount: orgAmount,
                    rawResponce: '',
                    paymentType: 'credit',
                    status: 'pending',
                    isDeleted: 'N'
                })
                responce = JSON.stringify({ code: '200', message: "", data: order });
                res.status(200).send(responce);
            }

        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while payment", data: '' });
            res.status(500).send(responce);
        }
    },
    paymentSuccess: async (req, res) => {
        try {
            console.log("IN SUccess");
            let razorpayPaymentId = req.body.razorpayPaymentId;
            let razorpayOrderId = req.body.razorpayOrderId;
            let razorpaySignature = req.body.razorpaySignature;
            let rawResponce = req.body.rawResponce;
            let bookingAmount = 0;//req.body.bookingAmount;
            let bookingPaymentObj=await BookingPayment.findOne({paymentId:razorpayOrderId});
            let rawResponcedata=JSON.stringify(rawResponce);
            if(bookingPaymentObj!==null && razorpayOrderId!==""){
                bookingAmount=bookingPaymentObj['amount'];
                orderId=bookingPaymentObj['orderId'];
                updateBookingPay=await BookingPayment.updateOne({paymentId:razorpayOrderId},{$set:{status:'completed',rawResponce:rawResponcedata}});
                updateBooking=await Booking.updateOne({payment_orderId:razorpayOrderId},{$set:{paid:bookingAmount,status:'waiting'}});
                let sendSms=sentBookingSmsToCustomer(razorpayOrderId);
                responce = JSON.stringify({ code: '200', message: "Payment completed successfully", data: '' });
                res.status(200).send(responce);
            }else{
                responce = JSON.stringify({ code: '500', message: "Sorry, something went wrong", data: '' });
                res.status(500).send(responce);
            }
           
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    prepayment: async (req, res) => {
        try {
            const instance = new Razorpay({
                key_id: process.env.paymentId,
                key_secret: process.env.paymentSecreat,
            });
            let amount = req.body.amount;
            let receiptId = req.body.bookingId;
            const options = {
                amount: amount, // amount in smallest currency unit
                currency: "INR",
                receipt: receiptId,
            };
            const order = await instance.orders.create(options);
            if (!order) {
                responce = JSON.stringify({ code: '501', message: "Sorry, something went wrong", data: '' });
                res.status(500).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: "", data: order });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    }
}