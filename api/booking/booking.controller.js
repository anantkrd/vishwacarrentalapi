const { json } = require('body-parser');
const { sentBookingSmsToCustomer } = require('../common/sendSms');
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
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");
const { Sequelize, DataTypes, Model } = require('sequelize');
module.exports = {
    bookCab: async (req, res) => {
        try {
            
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
            if(pickupDistrict=='' || pickupDistrict==null){
                pickupDistrict=pickupState;
            }
            if(dropDistrict=='' || dropDistrict==null){
                dropDistrict=dropState;
            }
            let payment_orderId = req.body.payment_orderId;
            let responce;
            const checkUser = await User.findOne({ where: { mobileNo: req.body.mobileNo } });
            if (checkUser === null) {
                const userCollection = await User.create({
                    firstName: req.body.fname,
                    lastName: req.body.lname,
                    mobileNo: req.body.mobileNo,
                    email: req.body.email,
                    userPassword: req.body.mobileNo,
                    userType: 'user',
                    status: 'Active'
                })
                userId = userCollection.id;
            } else {
                userId = checkUser.id;
            }
            userName = fname + " " + lname;
            if(returnDate=="0000-00-00 00:00:00"){
                returnDate=null;
            }
            bookingData = await Booking.create({
                userId: userId, userName: userName, email: email, orderId: orderId, cabId: cabId, pickup: pickup, destination: destination, pickupDate: pickupDate, returnDate: returnDate, isReturn: isReturn, pickupLat: pickupLat, pickupLong: pickupLong,
                destinationLat: destinationLat, destinationLong: destinationLong, distance: distance, rate: rate, amount: amount, discount: discount, finalAmount: finalAmount, status: 'pending', journyTime: journyTime,
                payment_orderId: payment_orderId, pickupCityName: pickupCityName, pickupDistrict: pickupDistrict, pickupState: pickupState,
                dropCityName: dropCityName, dropDistrict: dropDistrict, dropState: dropState, mobileNo: mobileNo, extraRate: extraRate
            });
            if (bookingData !== null) {
                responce = JSON.stringify({ code: '200', message: "Booking Created successfully", data: bookingData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: "Sorry, something went wrong", data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getCabs: async (req, res) => {
        try {
            const Op = Sequelize.Op;
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
            let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
            timeNow = moment().add(5, 'hours');
            timeNow = moment(timeNow).add(30, 'minutes');
            
            let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
           
            let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
            
            let earlyBookingCharges = 0;
            if (tripBookingBEforHours < 10) {
                earlyBookingCharges = Math.round((6 / tripBookingBEforHours) * 100) / 100;
            }
            //console.log(tripBookingBEforHours + "==earlyBookingCharges==" + earlyBookingCharges);
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
                let surgePickpuResult = await Surge.findOne({ where: {[Op.or]:{ city: { [Op.like]: '%' + pickupCityName + '%' },location: { [Op.like]: '%' + pickupDistrict + '%' } }} ,order: [['city', 'DESC']]});
               
                let destinationcityName = destinationCity.split(",")[0];
                //let surgedestinationResult=await getSurge(destinationcityName,dropCityName);
                let surgedestinationResult = await Surge.findOne({ where: {[Op.or]:{ city: { [Op.like]: '%' + destinationcityName + '%' },location: { [Op.like]: '%' + dropDistrict + '%' } }} ,order: [['city', 'DESC']]});
                //let surgedestinationResult = await Surge.findOne({ where: { city: { [Op.like]: '%' + destinationcityName + '%' }  }});
                if (surgePickpuResult === null) {
                    surgePickpuResult = { "city": "Pune", "surge": '{"Compact":1,"Sedan":1,"Luxury":1,"SUVErtiga":1,"Innova":1,"InnovaCrysta":1,"other":1,"local":20}' };
                }
                if (surgedestinationResult === null) {
                    surgedestinationResult = { "city": "Pune", "surge": '{"Compact":1,"Sedan":1,"Luxury":1,"SUVErtiga":1,"Innova":1,"InnovaCrysta":1,"other":1,"local":20}' };
                }

                //let results=await getCabs(req);
                cabObj = await Cabs.findAll({ where: { isDeleted: 'N' } });
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
                        id = cabData['id'];
                        
                        cabType = cabData['cabType'];

                        discount = cabData['discount'];

                        finalRate = rate + earlyBookingCharges;
                        image = cabData['image'];
                        /*imageArray = cabData['images'];
                        imageArray = JSON.parse(imageArray);
                        let max = imageArray.length - 1;
                        let min = 0;
                        let imageNo = Math.floor(Math.random() * (max - min + 1)) + min;
                        
                        image = imageArray[imageNo];*/
                        ac = cabData['ac'];
                        bags = cabData['bags'];
                        cars = cabData['cars'];
                        capacity = cabData['capacity'];
                        note = cabData['note'];
                        extraRate = cabData['extraRate'];
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
                        //console.log("=returnDateTime=" + returnDateTime + "+==multiply=" + multiply + "==cabTypecheck==" + cabType);
                        //console.log("surgePickpuResult==="+JSON.stringify(surgePickpuResult));
                        
                        surgePrice = 0;
                        if (isReturnTrip == 'N') {
                            if (cabTypecheck != "") {
                                let surgeDataPickup = surgePickpuResult['surge'];
                                let surgeDataPickupObj = JSON.parse(surgeDataPickup);
                                
                                let surgeDataDrop = surgedestinationResult['surge'];
                                let surgeDataDropObj = JSON.parse(surgeDataDrop);
                                
                                if (tripType == 'local' && distanceValue <= 80) {
                                    surgePrice = surgeDataPickupObj['local'];
                                    //surgePrice=surgePrice+(surgekm*surgeDataDropObj['local']);
                                } else {
                                    surgePrice = surgekm * surgeDataPickupObj[cabType];
                                    surgePrice = surgePrice + (surgekm * surgeDataDropObj[cabType]);
                                }
                                console.log(cabType+"***********surgePrice:"+surgePrice);
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
                    //responce=JSON.stringify({code:'200',msg:'',data:dataObj});
                    console.log("returnDateTime:"+returnDateTime)
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
                    res.status(200).send(responce);
                }
            });
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
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
                let bookingPayData = await BookingPayment.create({
                    bookingId: receiptId,
                    paymentId: order.id,
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
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while payment", data: '' });
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
            let bookingPaymentObj=await BookingPayment.findOne({where:{paymentId:razorpayOrderId}});
            let rawResponcedata=JSON.stringify(rawResponce);
            if(bookingPaymentObj!==null){
                bookingAmount=bookingPaymentObj['amount'];
                orderId=bookingPaymentObj['orderId'];
                updateBookingPay=await BookingPayment.update({status:'completed',rawResponce:rawResponcedata},{where:{paymentId:razorpayOrderId}});
                updateBooking=await Booking.update({paid:bookingAmount,status:'waiting'},{where:{payment_orderId:razorpayOrderId}});
                let sendSms=sentBookingSmsToCustomer(razorpayOrderId);
                responce = JSON.stringify({ code: '200', message: "Payment completed successfully", data: '' });
                res.status(200).send(responce);
            }else{
                responce = JSON.stringify({ code: '500', message: "Sorry, something went wrong", data: '' });
                res.status(500).send(responce);
            }
           
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving data.", data: '' });
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
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    }
}