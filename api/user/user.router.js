var express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
var router = express.Router();

const { json } = require('body-parser');
const authenticate = require("../auth/index");
const userController = require("./user.controller");

/* GET home page. */
router.get('/fetchUser',authenticate, userController.getUser);


router.post('/create_user', userController.createUser);
router.post('/register_agent', userController.createPartner);
router.post('/register_user', userController.createUser);


router.get('/get_user_byid', authenticate,userController.getUser);
router.get('/get_user', authenticate, userController.getUserByMobile);
router.get('/send_otp', userController.getUserByMobile);
router.get('/get_booking_details', authenticate,userController.getBookingById);
router.get('/user_login', userController.verifyPassword);
router.get('/get_booking',authenticate, userController.getBookings);
router.get('/get_my_booking', authenticate,userController.getMyBookings);
router.get('/get_user_booking',authenticate, userController.getMyBookings);

router.get('/get_search_log',authenticate, userController.getBookingSearchLog);
router.get('/cancel_booking', authenticate,userController.cancelBooking);
router.post('/update_password', authenticate,userController.updatePassword);
router.post('/request_call_back', authenticate,userController.requestCallBack);
router.post('/send_sms', userController.sendSmsVishwajeetcab);


module.exports = router;

