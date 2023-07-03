const express = require('express');
const jwt = require('jsonwebtoken');


const router = express.Router();
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");
const agentController = require('./agent.controller');
const authenticate = require("../auth/index");
router.get('/get_new_bookings',authenticate, agentController.getNewBookings);
router.get('/get_my_bookings',authenticate, agentController.getbookingByAgent);
router.get('/get_my_completed_bookings',authenticate, agentController.getCompletedBookings);
router.get('/get_cars',authenticate, agentController.getCars);
router.get('/get_carByNo',authenticate, agentController.getCar);

router.get('/get_carbyid',authenticate, agentController.getCarById);
router.put('/update_car',authenticate, agentController.updateCar);

router.get('/add_car',authenticate, agentController.addCar);
router.get('/get_driver_bymobile', authenticate,agentController.getDriverByMobile);
router.post('/assign_booking_car',authenticate, agentController.assignBookingCar);
router.post('/assign_booking_driver', authenticate,agentController.assignBookingDriver);
router.post('/add_driver',authenticate, agentController.addDriver);
router.put('/update_driver',authenticate, agentController.updateDriver);
router.put('/updateImage',authenticate, agentController.updateImage);

router.delete('/driver',authenticate, agentController.deleteDriver);
router.delete('/car',authenticate, agentController.deleteCar);

router.get('/get_driverbyid', authenticate,agentController.getDriverById);

router.post('/assign_booking_driver',authenticate, agentController.assignBookingDriver);
router.get('/get_drivers', authenticate,agentController.getDrivers);
router.post('/payment',authenticate, agentController.agentPayment);
router.post('/success',authenticate, agentController.agentPaymentSuccess);
router.get('/prepayment', authenticate,agentController.agentPrePayment);
router.get('/get_agent',authenticate, agentController.getAgent);

module.exports = router;