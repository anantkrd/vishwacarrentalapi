const express = require('express');
const jwt = require('jsonwebtoken');
const { startTrip, endTrip, completeTrip } = require('../driver/driver.controller');
const { } = require('./driver.controller');
const { getMyBookings, getbookingReport, getPaymentReport } = require('./driver.service');


const authenticate = require("../auth/index");
const router = express.Router();
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");
const driverController = require('../driver/driver.controller');

router.get('/get_my_trip', driverController.getMyTrip);
router.get('/get_payment_report', driverController.getMyTrip);
router.get('/get_my_trip', driverController.getMyTrip);
router.get('/start_trip', driverController.startTrip);


router.get('/get_my_trip_old', authenticate, async function (req, res, next) {
    results = await getMyBookings(req.query.userId, req.query.pageId);
    console.log("result=" + JSON.stringify(results))
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', msg: '', data: results, pageId: req.query.pageId });
    }
    res.send(responce);
});
router.get('/get_payment_report_log', authenticate, async function (req, res, next) {
    results = await getPaymentReport(req.query.userId, req.query.pageId);
    console.log("result=" + JSON.stringify(results))
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', msg: '', data: results, pageId: req.query.pageId });
    }
    res.send(responce);
});
router.get('/get_trip_report_old', authenticate, async function (req, res, next) {
    results = await getMyBookings(req.query.userId, req.query.pageId);
    console.log("result=" + JSON.stringify(results))
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', msg: '', data: results, pageId: req.query.pageId });
    }
    res.send(responce);
});
router.get('/start_trip', authenticate, async function (req, res, next) {
    results = await startTrip(req.query.userId, req.query.bookingId, req.query.startkm, req.query.startPin);
    console.log("result=" + JSON.stringify(results))
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', msg: 'Trip status updated', data: '' });
    }

    res.send(responce);
});
router.get('/end_trip', authenticate, async function (req, res, next) {
    results = await endTrip(req.query.userId, req.query.bookingId, req.query.endkm);
    console.log("result=" + JSON.stringify(results))
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', msg: 'Trip updated', data: '' });
    }

    res.send(responce);
});
router.get('/complete_trip', authenticate, async function (req, res, next) {
    results = await completeTrip(req.query.userId, req.query.bookingId);
    console.log("result=" + JSON.stringify(results))
    if (results.length <= 0) {
        responce = JSON.stringify({ code: '500', msg: 'some internal error', data: '' });
    } else {
        responce = JSON.stringify({ code: '200', msg: 'Trip updated', data: '' });
    }

    res.send(responce);
});
module.exports = router;