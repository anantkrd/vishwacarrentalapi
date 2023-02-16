const express = require('express');

const jwt = require('jsonwebtoken');
const { createUser, getUserByMobile } = require('../user/user.controller');
const { create_booking, getCabs, create_booking_log, updateCab } = require('../booking/booking.controller');
const { getSurge, addPayment, updateBookingDetails } = require('../booking/booking.service');

const router = express.Router();
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");
const moment = require('moment');
const authenticate = require("../auth/index");
const bookingController = require("./booking.controller");
const userController = require("../user/user.controller");

router.post('/book_cab', bookingController.bookCab);
router.get('/getCabs', bookingController.getCabs);
router.get('/getBookingById', authenticate,userController.getBookingById);
router.post('/payment', bookingController.payment);
router.post('/success', bookingController.paymentSuccess);
router.get('/prepayment',bookingController.prepayment);

module.exports = router;