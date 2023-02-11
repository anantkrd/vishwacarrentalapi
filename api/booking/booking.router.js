const express = require('express');

const jwt = require('jsonwebtoken');
const { createUser, getUserByMobile } = require('../user/user.controller');
const { create_booking, getCabs, create_booking_log, updateCab } = require('../booking/booking.controller');
const { getSurge, addPayment, updateBookingDetails } = require('../booking/booking.service');
const authenticate = require("../auth/index");
const router = express.Router();
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");
const moment = require('moment');

const bookingController = require("./booking.controller");
const userController = require("../user/user.controller");

router.post('/book_cab', bookingController.bookCab);
router.get('/getCabs', bookingController.getCabs);
router.get('/getBookingById', userController.getBookingById);
router.post('/payment', bookingController.payment);
router.post('/success', bookingController.paymentSuccess);
router.get('/prepayment', bookingController.prepayment);



router.get('/book_cab_old', async function (req, res, next) {
    //console.log("mobileNo=="+req.query.mobileNo);
    let userId = 0;
    let error = '';

    let fname = req.query.fname;
    let lname = req.query.lname;
    let orderId = req.query.bookingId;
    let cabId = req.query.cabId;
    let pickup = req.query.pickup;
    let destination = req.query.destination;
    let pickupDate = req.query.pickupDate;
    let returnDate = req.query.returnDate;
    let isReturn = req.query.isReturn;
    let pickupLat = req.query.pickupLat;
    let pickupLong = req.query.pickupLong;
    let destinationLat = req.query.destinationLat;
    let destinationLong = req.query.destinationLong;
    let distance = req.query.distance;
    let rate = req.query.rate;
    let amount = req.query.amount;
    let discount = req.query.discountAmount;
    let finalAmount = req.query.finalAmount;
    let status = req.query.status;
    let pickupCityName = req.query.pickupCityName;
    let pickupDistrict = req.query.pickupDistrict;
    let pickupState = req.query.pickupState;
    let dropCityName = req.query.dropCityName;
    let dropDistrict = req.query.dropDistrict;
    let dropState = req.query.dropState;
    let journyTime = req.query.journyTime;
    let extraRate = req.query.extraRate;
    let responce;
    resultUser = await getUserByMobile(req.query.mobileNo);
    if (resultUser.length <= 0) {

        results = await createUser(req.query.fname, req.query.lname, req.query.mobileNo, req.query.email, 'user');
        if (results.length <= 0) {
            responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
        } else {
            userId = results.insertId;
            //userId=results[0]['id'];
            userName = fname + " " + lname;
            const body = {
                userId: userId, userName: userName, email: req.query.email, orderId: orderId, cabId: req.query.cabId, pickup: req.query.pickup, destination: req.query.destination, pickupDate: req.query.pickupDate, returnDate: req.query.returnDate, isReturn: req.query.isReturn, pickupLat: req.query.pickupLat, pickupLong: req.query.pickupLong,
                destinationLat: req.query.destinationLat, destinationLong: req.query.destinationLong, distance: req.query.distance, rate: rate, amount: req.query.amount, discount: discount, finalAmount: req.query.finalAmount, status: 'pending', journyTime: journyTime,
                payment_orderId: req.query.payment_orderId, pickupCityName: pickupCityName, pickupDistrict: pickupDistrict, pickupState: pickupState,
                dropCityName: dropCityName, dropDistrict: dropDistrict, dropState: dropState, mobileNo: req.query.mobileNo, extraRate: req.query.extraRate
            }
            console.log("logData***2*===" + JSON.stringify(body));
            let BookingRe = await create_booking(body);
            if (results.length <= 0) {
                responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
            } else {
                responce = JSON.stringify({ code: '200', msg: 'success', data: results.insertId });
            }
            /*create_booking(body,(err,results)=>{
                if(err){
                    error=err;
                    responce=JSON.stringify({code:'500',msg:'some internal error'+err,data:''});
                    
                }else{
                    responce=JSON.stringify({code:'200',msg:'success',data:results.insertId});
                                                    //responce=JSON.stringify({code:'200',msg:'user added',data:results.insertId});
                }
                //res.send(responce);

            });*/
        }
        console.log("Return responce with create user:" + JSON.stringify(responce));
        res.send(responce);
    } else {
        userId = results[0]['id'];
        userName = fname + " " + lname;
        const body = {
            userId: userId, userName: userName, email: req.query.email, orderId: orderId, cabId: req.query.cabId, pickup: req.query.pickup, destination: req.query.destination, pickupDate: req.query.pickupDate, returnDate: req.query.returnDate, isReturn: req.query.isReturn, pickupLat: req.query.pickupLat, pickupLong: req.query.pickupLong,
            destinationLat: req.query.destinationLat, destinationLong: req.query.destinationLong, distance: req.query.distance, rate: rate, amount: req.query.amount, discount: discount, finalAmount: req.query.finalAmount, status: 'pending', journyTime: journyTime, payment_orderId: req.query.payment_orderId,
            pickupCityName: pickupCityName, pickupDistrict: pickupDistrict, pickupState: pickupState,
            dropCityName: dropCityName, dropDistrict: dropDistrict, dropState: dropState, mobileNo: req.query.mobileNo, extraRate: req.query.extraRate
        }
        let BookingRe = await create_booking(body);
        if (results.length <= 0) {
            responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
        } else {
            responce = JSON.stringify({ code: '200', msg: 'success', data: results.insertId });
        }
        res.send(responce);
        /*create_booking(body,(err,results)=>{
            if(err){
                responce=JSON.stringify({code:'500',msg:'some internal error 2'+err,data:''});
                
            }else{
                userId=results.insertId;
                //responce=JSON.stringify({code:'200',msg:'user added',data:results.insertId});
                responce=JSON.stringify({code:'200',msg:'success',data:userId});  
                //res.send(responce);                      
            }
            res.send(responce);
        });*/
        console.log("Return responce :" + JSON.stringify(responce));
    }
});

router.post('/book_cab_old', async function (req, res, next) {
    console.log("mobileNo post==" + req.body.mobileNo);
    let userId = 0;
    let error = '';

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
    let payment_orderId = req.body.payment_orderId;
    let responce;
    resultUser = await getUserByMobile(mobileNo);
    if (resultUser.length <= 0) {

        results = await createUser(fname, lname, mobileNo, email, 'user');
        if (results.length <= 0) {
            responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
        } else {
            userId = results.insertId;
            //userId=results[0]['id'];
            userName = fname + " " + lname;
            const body = {
                userId: userId, userName: userName, email: email, orderId: orderId, cabId: cabId, pickup: pickup, destination: destination, pickupDate: pickupDate, returnDate: returnDate, isReturn: isReturn, pickupLat: pickupLat, pickupLong: pickupLong,
                destinationLat: destinationLat, destinationLong: destinationLong, distance: distance, rate: rate, amount: amount, discount: discount, finalAmount: finalAmount, status: 'pending', journyTime: journyTime,
                payment_orderId: payment_orderId, pickupCityName: pickupCityName, pickupDistrict: pickupDistrict, pickupState: pickupState,
                dropCityName: dropCityName, dropDistrict: dropDistrict, dropState: dropState, mobileNo: mobileNo, extraRate: extraRate
            }
            console.log("logData***2*===" + JSON.stringify(body));
            let BookingRe = await create_booking(body);
            if (results.length <= 0) {
                responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
            } else {
                responce = JSON.stringify({ code: '200', msg: 'success', data: results.insertId });
            }

        }
        console.log("Return responce with create user:" + JSON.stringify(responce));
        res.send(responce);
    } else {
        userId = results[0]['id'];
        userName = fname + " " + lname;
        const body = {
            userId: userId, userName: userName, email: email, orderId: orderId, cabId: cabId, pickup: pickup, destination: destination, pickupDate: pickupDate, returnDate: returnDate, isReturn: isReturn, pickupLat: pickupLat, pickupLong: pickupLong,
            destinationLat: destinationLat, destinationLong: destinationLong, distance: distance, rate: rate, amount: amount, discount: discount, finalAmount: finalAmount, status: 'pending', journyTime: journyTime, payment_orderId: payment_orderId,
            pickupCityName: pickupCityName, pickupDistrict: pickupDistrict, pickupState: pickupState,
            dropCityName: dropCityName, dropDistrict: dropDistrict, dropState: dropState, mobileNo: mobileNo, extraRate: extraRate
        }
        let BookingRe = await create_booking(body);
        if (results.length <= 0) {
            responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
        } else {
            responce = JSON.stringify({ code: '200', msg: 'success', data: results.insertId });
        }
        res.send(responce);

        console.log("Return responce :" + JSON.stringify(responce));
    }
});
router.get('/getCabs_old', async function (req, res, next) {

    // console.log("herere");
    distance.key('AIzaSyDzlGIoqMbQKaNwu1tCMXCtW3UEjzCfUvs');
    distance.mode('driving');
    console.log(req);
    originObj = JSON.parse(req.query.originObj);
    destinationObj = JSON.parse(req.query.destinationObj);
    //console.log("=**=="+originObj.lat);

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
    var origins = [originObj.lat + ',' + originObj.lng];
    var destinations = [destinationObj.lat + ',' + destinationObj.lng];

    let pickupCityName = req.query.pickupCityName;
    let pickupDistrict = req.query.pickupDistrict;
    let pickupState = req.query.pickupState;
    let dropCityName = req.query.dropCityName;
    let dropDistrict = req.query.dropDistrict;
    let dropState = req.query.dropState;
    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
    timeNow = moment().add(5, 'hours');
    timeNow = moment(timeNow).add(30, 'minutes');
    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
    console.log(timeNow + "==pickdate =" + moment(formattedDate).format("YYYY-MM-DD H:mm:ss"));
    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
    let earlyBookingCharges = 0;
    if (tripBookingBEforHours < 10) {
        earlyBookingCharges = Math.round((6 / tripBookingBEforHours) * 100) / 100;
    }
    console.log(tripBookingBEforHours + "==earlyBookingCharges==" + earlyBookingCharges);
    let distancekm = 0;

    distance.matrix(origins, destinations, async function (err, distances) {
        if (!err)
            //console.log("distances****"+JSON.stringify(distances.rows[0].elements[0]));
            //console.log("distances****"+JSON.stringify(distances.rows[0].elements[0].duration.text));
            distanceObj = JSON.parse(distances.rows[0].elements[0].distance.value);
        journyTime = JSON.parse(distances.rows[0].elements[0].duration.value);
        journyTime1 = distances.rows[0].elements[0].duration.text.toString();
        // timeObj=JSON.parse(distances);
        //journyTime1=JSON.parse(distances.rows[0].elements[0].duration);
        //console.log(distances.rows[0].elements[0].duration.text+"***journyTime=="+journyTime);
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
        let pickupcityName = pickupCity.split(",")[0];
        let surgePickpuResult = await getSurge(pickupcityName, pickupCityName);
        let destinationcityName = destinationCity.split(",")[0];
        let surgedestinationResult = await getSurge(destinationcityName, dropCityName);
        //console.log(distancekm+"**************surgeResult===");

        let results = await getCabs(req);
        distanceValue = distancekm;
        dataObj = [];
        let logPrice = '';
        if (results.length <= 0) {
            error = err;
            responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
        } else {
            for (var i = 0; i < results.length; i++) {
                rate = results[i]['rate'];
                let originalRate = rate;
                returnTripRate = results[i]['returnTripRate'];
                id = results[i]['id'];
                //console.log("ID: " + id);
                cabType = results[i]['cabType'];

                discount = results[i]['discount'];

                finalRate = rate + earlyBookingCharges;
                image = results[i]['image'];
                imageArray = results[i]['images'];
                //imageArray=JSON.stringify(imageArray);
                imageArray = JSON.parse(imageArray);
                //console.log("imageArray=="+(imageArray));
                let max = imageArray.length - 1;
                //console.log("Max=="+max);
                let min = 0;
                let imageNo = Math.floor(Math.random() * (max - min + 1)) + min;
                //console.log("imageNo=="+imageNo);
                image = imageArray[imageNo];
                ac = results[i]['ac'];
                bags = results[i]['bags'];
                cars = results[i]['cars'];
                capacity = results[i]['capacity'];
                note = results[i]['note'];
                extraRate = results[i]['extraRate'];
                multiply = 2;
                distanceValue = 0;
                let isReturnTrip = 'N';
                let tripDays = 0;
                let PerDayKm = 300;
                let PerDayKmSingle = 150;
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
                    //distancekm=distancekm*2;                        
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
                    //console.log(distanceValue+"=====tripDays*****************: " + tripDays+"======calculateKm==="+calculateKm);  
                    if (calculateKm > distanceValue) {
                        distanceValue = calculateKm;
                    } else {
                        calculateKm = distanceValue;
                    }
                }



                let cabTypecheck = cabType.toLowerCase();
                console.log("=returnDateTime=" + returnDateTime + "+==multiply=" + multiply + "==cabTypecheck==" + cabType);
                //console.log("surgePickpuResult==="+JSON.stringify(surgePickpuResult));
                //console.log("surgedestinationResult==="+JSON.stringify(surgedestinationResult));
                surgePrice = 0;
                if (isReturnTrip == 'N') {
                    if (cabTypecheck != "") {
                        let surgeDataPickup = surgePickpuResult[0]['surge'];
                        let surgeDataPickupObj = JSON.parse(surgeDataPickup);
                        //console.log("surgeData Pick============="+surgeDataPickupObj+"====="+surgeDataPickupObj[cabType]);
                        let surgeDataDrop = surgedestinationResult[0]['surge'];
                        let surgeDataDropObj = JSON.parse(surgeDataDrop);
                        //console.log("surgeData Drop============="+surgeDataDropObj+"====="+surgeDataDropObj[cabType]);
                        if (tripType == 'local' && distanceValue <= 80) {
                            surgePrice = surgeDataPickupObj['local'];
                            //surgePrice=surgePrice+(surgekm*surgeDataDropObj['local']);
                        } else {
                            surgePrice = surgekm * surgeDataPickupObj[cabType];
                            surgePrice = surgePrice + (surgekm * surgeDataDropObj[cabType]);
                        }
                        //console.log(surgeDataPickupObj[cabType]+"============surgeamout=========="+surgeDataDropObj[cabType]);
                        //surgePrice=surgekm*surgeDataPickupObj[cabType];
                        //surgePrice=surgePrice+(surgekm*surgeDataDropObj[cabType]);                            

                        finalRate = finalRate + surgePrice;
                        sedanPrice = finalRate;
                    } else {
                        surgePrice = surgekm * 1;
                        surgePrice = surgePrice + (surgekm * 1);

                        finalRate = finalRate + surgePrice;
                        sedanPrice = finalRate;
                    }
                    //console.log(finalRate+"============surgePrice=========="+surgePrice);
                } else {
                    sedanPrice = finalRate;
                }

                amount = Math.round(distanceValue * finalRate);
                discountAmount = Math.round(distanceValue * discount);
                discountedRate = finalRate - discount;
                finalAmount = Math.round(distanceValue * discountedRate);

                //console.log("surgekm"+surgekm);
                //console.log("surgePrice"+surgePrice);
                //console.log("finalRate"+finalRate);
                idKey = 'id';
                logPrice = logPrice + " " + cabType + ":" + finalAmount;
                dataObj1 = {};
                bookingId = id + "" + new Date().valueOf();
                dataObj1['id'] = id;
                dataObj1['bookingId'] = bookingId;

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
            responce = JSON.stringify({ code: '200', msg: '', data: dataObj });
        }
        const logData = {
            mobileNo: mobileNo, pickup: pickupCity, destination: destinationCity, pickupDate: pickdateTime, returnDate: returnDateTime, pickupLat: originlat, pickupLong: originlng, destinationLat: destinationlat, destinationLong: destinationlng, distance: distanceValue,
            journyTime: journyTime1, sedanRate: sedanPrice, luxuryRate: luxuryPrice, compactRate: compactPrice, note: logPrice
        }
        //console.log("logData==="+JSON.stringify(logData));
        create_booking_log(logData, (err, results) => {
            //console.log("create_booking_log Error====="+err);
            //console.log("create_booking_log results====="+JSON.stringify(results));
        });
        res.send(responce);

    });
});
//router.update('/updateCabs',authenticate,await updateCab(req,res));
router.get('/getBookingById_old', authenticate, async function (req, res, next) {

    let bookingId = req.query.bookingId;
    res1 = getBookingById(req, (err, results) => {
        if (err) {
            error = err;
            responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
            // console.log("Here2");            
        } else {
            console.log("****" + results.length);
            dataObj = [];
            responce = JSON.stringify({ code: '200', msg: '', data: results });
            //console.log(dataObj)
        }
        res.send(responce);

    });
});
router.get('/getBooking_by_order', function (req, res, next) {

    let mobileNo = req.query.mobileNo;
    let bookingId = req.query.bookingId;
    let token = req.query.token;
    var origins = [originObj.lat + ',' + originObj.lng];
    var destinations = [destinationObj.lat + ',' + destinationObj.lng];
    let distancekm = 0;

    res1 = getCabs(req, (err, results) => {
        if (err) {
            error = err;
            responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
            // console.log("Here2");            
        } else {
            console.log("****" + results.length);
            dataObj = [];
            distanceValue = distancekm;
            for (var i = 0; i < results.length; i++) {
                rate = results[i]['rate'];
                finalRate = results[i]['rate'];
                id = results[i]['id'];
                //console.log("ID: " + id);
                cabType = results[i]['cabType'];

                discount = results[i]['discount'];
                image = results[i]['image'];
                ac = results[i]['ac'];
                bags = results[i]['bags'];
                cars = results[i]['cars'];
                capacity = results[i]['capacity'];
                extraRate = results[i]['extraRate'];
                note = results[i]['note'];
                let multiply = 2;
                if (returnDateTime == "" || returnDateTime == undefined || returnDateTime == 'undefined') {
                    multiply = 1;
                }
                console.log("=returnDateTime=" + returnDateTime + "+==multiply=" + multiply);
                let amount = (distanceValue * rate) * multiply;
                let discountAmount = (distanceValue * discount) * multiply;
                let finalAmount = (distanceValue * finalRate) * multiply;

                //amount=distanceValue*rate;
                //discountAmount=distanceValue*discount;
                //finalAmount=distanceValue*finalRate;
                idKey = 'id';

                //console.log("ID: " + id);
                dataObj1 = {};
                bookingId = id + "" + Date.now();
                dataObj1['id'] = id;
                dataObj1['bookingId'] = bookingId;
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
                dataObj1['rate'] = rate;
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
                dataObj1['distance'] = distancekm;
                dataObj1['extraRate'] = extraRate;
                //dataObj1['originlng']=originlng;
                dataObj.push(dataObj1)
            }
            responce = JSON.stringify({ code: '200', msg: '', data: dataObj });
            //console.log(dataObj)
        }
        res.send(responce);
    });
});

router.post('/payment_old', async function (req, res, next) {

    let amount = req.body.amount;
    let receiptId = req.body.bookingId;
    let mobileNo = req.body.mobileNo;
    const instance = new Razorpay({
        key_id: process.env.paymentId,
        key_secret: process.env.paymentSecreat,
    });
    console.log("*****************amount**********" + amount);

    const options = {
        amount: amount, // amount in smallest currency unit
        currency: "INR",
        receipt: receiptId,
    };

    const order = await instance.orders.create(options);
    console.log("order=====******" + order)
    console.log("order====" + JSON.stringify(order));
    let orgAmount = amount / 100;
    addPayment(orgAmount, receiptId, mobileNo, order.id);
    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
});

router.post('/success_old', async function (req, res, next) {

    console.log("IN SUccess");
    let razorpayPaymentId = req.body.razorpayPaymentId;
    let razorpayOrderId = req.body.razorpayOrderId;
    let razorpaySignature = req.body.razorpaySignature;
    let rawResponce = req.body.rawResponce;
    let bookingAmount = 0;//req.body.bookingAmount;
    console.log("Body==" + JSON.stringify(req.body))
    let resData = await updateBookingDetails(razorpayOrderId, rawResponce);
    res.json(resData);
});
router.get('/prepayment_old', async function (req, res, next) {
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

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/upload', authenticate, async function (req, res, next) {
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

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});
module.exports = router;