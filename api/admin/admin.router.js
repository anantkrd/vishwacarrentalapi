var express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
var router = express.Router();
const { getBookingsAdminHome, updateAgentAmount, getWaitingForAgentBooking, getCompletedBookings, getReadyBooking, getConfirmBooking,
    getAgents } = require('./admin.controller');
const { addPaymentAgent, updateBookingDetails, assignAggent, addSurge, addCab, getSurge, getCab } = require('./admin.service');
const { json } = require('body-parser');
const authenticate = require("../auth/index");
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");

const bookingController = require("../booking/booking.controller");
const userController = require("../user/user.controller");
const adminController = require("./admin.controller");

router.get('/get_booking_admin', adminController.getBookings);
router.get('/get_bookings', adminController.getAllBookings);

router.get('/get_completed_bookings', adminController.getCompletedBookings);
router.get('/get_ready_booking', adminController.getReadyBookings);
router.get('/get_confirms_booking', adminController.getConfirmBookings);
router.get('/get_waiting_agent_bookings', adminController.getWaitingForAgentBookings);
router.get('/update_agent_amount', adminController.updateAgentAmount);
router.get('/get_agent', adminController.getAgents);
router.get('/get_agentbyid', adminController.getAgentById);
router.put('/update_cab', adminController.updateCab);
router.post('/add_cab', adminController.addCab);
router.get('/get_cabs', adminController.getCabs);
router.get('/get_cabbyid', adminController.getCabById);
router.post('/add_surge', adminController.addSurge);
router.get('/get_surge', adminController.getSurge);
router.get('/get_surgebyid', adminController.getSurgeById);
router.put('/update_surge', adminController.updateSurge);
router.get('/assign_agent', adminController.assignAggent);
router.get('/get_cars', adminController.getCars);
router.get('/get_drivers', adminController.getDrivers);
router.put('/update_driver_status', adminController.updatDriverStatus);
router.put('/update_car_status', adminController.updatCarStatus);
router.put('/update_agent_status', adminController.updatAgentStatus);
router.put('/agent_activate', adminController.activateAgent);
router.delete('/cab', adminController.deleteCab);
router.delete('/surge', adminController.deleteSurge);


router.get('/get_booking_admin_old', authenticate, async function (req, res, next) {
    resultsdata = await getBookingsAdminHome(req.query.pageId);
    resultsdata = JSON.parse(resultsdata);
    //console.log("results=====results===******"+JSON.stringify(resultsdata));
    dataObj = [];
    let results = resultsdata.results;
    let rowCount = resultsdata.rowCount;
    let totalPage = Math.ceil(resultsdata.totalPage);
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
    } else {
        for (var i = 0; i < results.length; i++) {
            id = results[i]['id'];
            userId = results[i]['userId'];
            userName = results[i]['userName'];
            bookingId = results[i]['orderId'];
            cabId = results[i]['cabId'];
            pickup = results[i]['pickup'];
            destination = results[i]['destination'];
            pickupDate = results[i]['pickupDate'];
            returnDate = results[i]['returnDate'];
            isReturn = results[i]['isReturn'];
            pickupLat = results[i]['pickupLat'];
            pickupLong = results[i]['pickupLong'];
            destinationLat = results[i]['destinationLat'];
            destinationLong = results[i]['destinationLong'];
            distance = results[i]['distance'];
            journyDistance = results[i]['journyDistance'];
            journyTime = results[i]['journyTime'];
            amount = results[i]['amount'];
            discount = results[i]['discount'];
            extraRate = results[i]['extraRate'];
            extraAmount = results[i]['extraAmount'];
            tax = results[i]['tax'];
            charges = results[i]['charges'];
            finalAmount = results[i]['finalAmount'];
            paid = results[i]['paid'];
            pending = results[i]['pending'];
            payment_orderId = results[i]['payment_orderId'];
            agentId = results[i]['agentId'];
            agentPrice = results[i]['agentPrice'];
            driverName = results[i]['driverName'];
            driverContact = results[i]['driverContact'];
            //console.log("ID: " + id);
            gadiNo = results[i]['gadiNo'];
            image = results[i]['image'];
            cabType = results[i]['cabType'];
            ac = results[i]['ac'];
            bags = results[i]['bags'];
            cars = results[i]['cars'];
            capacity = results[i]['capacity'];
            note = results[i]['note'];

            mobileNo = results[i]['mobileNo'];
            rate = results[i]['rate'];
            dataObj1 = {};
            dataObj1['id'] = id;
            dataObj1['bookingId'] = bookingId;
            dataObj1['userName'] = userName;
            dataObj1['mobileNo'] = mobileNo;
            dataObj1['pickup'] = pickup;
            dataObj1['destination'] = destination;
            dataObj1['pickupDate'] = pickupDate;
            dataObj1['returnDate'] = returnDate;
            dataObj1['finalAmount'] = finalAmount;
            dataObj1['agentPrice'] = agentPrice;
            dataObj1['cabType'] = cabType;
            dataObj1['image'] = image;
            dataObj1['ac'] = ac;
            dataObj1['bags'] = bags;
            dataObj1['cars'] = cars;
            dataObj1['capacity'] = capacity;
            dataObj1['note'] = note;
            dataObj1['amount'] = amount;
            dataObj1['paid'] = paid;
            dataObj1['pending'] = amount - paid;
            dataObj1['journyTime'] = journyTime;
            dataObj1['discountAmount'] = discount;
            dataObj1['rate'] = rate;
            dataObj1['agentId'] = agentId;
            dataObj1['driverName'] = driverName;
            dataObj1['driverContact'] = driverContact;
            dataObj1['gadiNo'] = gadiNo;
            //dataObj1['originlng']=originlng;
            dataObj.push(dataObj1);
        }

        responce = JSON.stringify({ code: '200', msg: '', data: dataObj, pageId: req.query.pageId, rowCount: rowCount, totalPage: totalPage });
    }
    res.send(responce);
});

router.get('/get_completed_bookings_old', authenticate, async function (req, res, next) {
    results = await getCompletedBookings(req.query.userId, req.query.pageId);
    //console.log("result="+JSON.stringify(results))

    res.send(results);
});
router.get('/get_ready_booking_old', authenticate, async function (req, res, next) {
    results = await getReadyBooking(req.query.userId, req.query.pageId);
    console.log("result=" + JSON.stringify(results))

    res.send(results);
});
router.get('/get_confirms_booking_old', authenticate, async function (req, res, next) {
    results = await getConfirmBooking(req.query.userId, req.query.pageId);
    console.log("result=" + JSON.stringify(results))

    res.send(results);
});
router.get('/get_waiting_agent_bookings_old', authenticate, async function (req, res, next) {
    results = await getWaitingForAgentBooking(req.query.userId, req.query.pageId);
    console.log("result=" + JSON.stringify(results))

    res.send(results);
});

router.get('/update_agent_amount_old', authenticate, async function (req, res, next) {
    results = await updateAgentAmount(req.query.amount, req.query.bookingId);
    res.send(results);
});
router.get('/get_agent_old', authenticate, async function (req, res, next) {
    result = await getAgents(req.query.userId);
    if (result.length <= 0) {
        responce = JSON.stringify({ code: '501', message: 'user not found', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', message: '', data: result });
    }
    res.send(responce);

});

router.get('/assign_agent_old', authenticate, async function (req, res, next) {
    results = await assignAggent(req.query.agentId, req.query.bookingId);

    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'No Data found', data: '' });
    } else {

        responce = JSON.stringify({ code: '200', msg: 'Agent assined successfully', data: '' });
    }
    //return responce; 
    res.send(responce);
});

router.post('/add_surge_old', authenticate, async function (req, res, next) {

    results = await addSurge(req.body.userId, req.body.city, req.body.surgeData);
    console.log("****************result=" + JSON.stringify(results));
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'No Data found', data: '' });
    } else {

        responce = JSON.stringify({ code: '200', msg: 'Agent assined successfully', data: '' });
    }
    //return responce; 
    res.send(responce);
});

router.post('/add_cab_old', authenticate, async function (req, res, next) {

    results = await addCab(req.body.userId, req.body);
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'No Data found', data: '' });
    } else {

        responce = JSON.stringify({ code: '200', msg: 'Agent assined successfully', data: '' });
    }
    //return responce; 
    res.send(responce);
});

router.get('/get_surge_old', authenticate, async function (req, res, next) {

    results = await getSurge(req.query.userId);
    console.log("****************result=" + JSON.stringify(results));
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'No Data found', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', msg: 'successfully', data: results });
    }
    //return responce; 
    res.send(responce);
});

router.get('/get_cab', authenticate, async function (req, res, next) {

    results = await getCab(req.query.userId);
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'No Data found', data: '' });
    } else {

        responce = JSON.stringify({ code: '200', msg: 'successfully', data: results });
    }
    //return responce; 
    res.send(responce);
});
/*
router.get('/update_agent_amount',authenticate, async function(req, res, next) {
    console.log("in update route")
    //results =await updateAgentAmount(req.query.amount,req.query.bookingId);
    res.send();
  });*/
module.exports = router;