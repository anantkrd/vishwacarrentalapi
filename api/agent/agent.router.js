const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, getUserByMobile } = require('../user/user.controller');
const { getBookingsForAgent, getMyBookings, getMyCompletedBookings } = require('./agent.controller');
const { getSurge, addPayment, } = require('../booking/booking.service');
const { addPaymentAgent, updateBookingDetails, addCar, getCars, addDriver, getDrivers, searchCar, searchDriver, assignBookingCar, assignBookingDriver,
    isCarAssign } = require('./agent.service');
const { authenticate } = require('../auth/index');
const router = express.Router();
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");
const agentController = require('./agent.controller');
router.get('/get_new_bookings',authenticate, agentController.getNewBookings);
router.get('/get_my_bookings', agentController.getbookingByAgent);
router.get('/get_my_completed_bookings', agentController.getCompletedBookings);
router.get('/get_cars', agentController.getCars);
router.get('/get_carbyid', agentController.getCarById);
router.put('/update_car', agentController.updateCar);

router.get('/add_car', agentController.addCar);
router.get('/get_driver_bymobile', agentController.getDriverByMobile);
router.post('/assign_booking_car', agentController.assignBookingCar);
router.post('/assign_booking_driver', agentController.assignBookingDriver);
router.post('/add_driver', agentController.addDriver);
router.put('/update_driver', agentController.updateDriver);
router.put('/updateImage', agentController.updateImage);

router.delete('/driver', agentController.deleteDriver);
router.delete('/car', agentController.deleteCar);

router.get('/get_driverbyid', agentController.getDriverById);

router.post('/assign_booking_driver', agentController.assignBookingDriver);
router.get('/get_drivers', agentController.getDrivers);
router.post('/payment', agentController.agentPayment);
router.post('/success', agentController.agentPaymentSuccess);
router.get('/prepayment', agentController.agentPrePayment);
router.get('/get_agent', agentController.getAgent);

module.exports = router;