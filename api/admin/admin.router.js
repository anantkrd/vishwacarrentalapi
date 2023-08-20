var express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
var router = express.Router();
const { getBookingsAdminHome, updateAgentAmount, getWaitingForAgentBooking, getCompletedBookings, getReadyBooking, getConfirmBooking,
    getAgents } = require('./admin.controller');
const { addPaymentAgent, updateBookingDetails, assignAggent, addSurge, addCab, getSurge, getCab } = require('./admin.service');
const { json } = require('body-parser');
var distance = require('google-distance-matrix');
const Razorpay = require("razorpay");

const bookingController = require("../booking/booking.controller");
const userController = require("../user/user.controller");
const adminController = require("./admin.controller");
const authenticate = require("../auth/index");
router.get('/get_booking_admin', authenticate,adminController.getBookings);
router.get('/get_bookings', authenticate,adminController.getAllBookings);

router.get('/get_completed_bookings',authenticate, adminController.getCompletedBookings);
router.get('/get_ready_booking', authenticate,adminController.getReadyBookings);
router.get('/get_confirms_booking',authenticate, adminController.getConfirmBookings);
router.get('/get_waiting_agent_bookings',authenticate, adminController.getWaitingForAgentBookings);
router.get('/update_agent_amount',authenticate, adminController.updateAgentAmount);
router.get('/get_agent', authenticate,adminController.getAgents);
router.get('/get_agentbyid',authenticate, adminController.getAgentById);
router.put('/update_cab',authenticate, adminController.updateCab);
router.post('/add_cab',authenticate, adminController.addCab);
router.get('/get_cabs',authenticate, adminController.getCabs);
router.get('/get_cabbyid',authenticate, adminController.getCabById);
router.post('/add_surge',authenticate, adminController.addSurge);
router.get('/get_surge',authenticate, adminController.getSurge);
router.get('/get_surgebyid',authenticate, adminController.getSurgeById);
router.put('/update_surge',authenticate, adminController.updateSurge);
router.get('/assign_agent',authenticate, adminController.assignAggent);
router.get('/get_cars',authenticate, adminController.getCars);
router.get('/get_drivers', authenticate,adminController.getDrivers);
router.put('/update_driver_status', authenticate,adminController.updatDriverStatus);
router.put('/update_car_status', authenticate,adminController.updatCarStatus);
router.put('/update_agent_status', authenticate,adminController.updatAgentStatus);
router.put('/agent_activate', authenticate,adminController.activateAgent);
router.delete('/cab', authenticate,adminController.deleteCab);
router.delete('/surge',authenticate, adminController.deleteSurge);
router.delete('/cancel_booking',authenticate, adminController.cancelBooking);
router.get('/get_cab_types',authenticate, adminController.getCabTypes);
router.get('/get_specialprice',authenticate, adminController.getSpecialPrice);
router.get('/get_specialpricebyid',authenticate, adminController.getSpecialPriceById);
router.post('/add_specialprice',authenticate, adminController.addSpecialPrice);
router.delete('/remove_specialprice',authenticate, adminController.deleteSpecialPrice);
router.put('/update_specialprice',authenticate, adminController.updateSpecialPrice);

router.post('/add_cabbooking',authenticate, adminController.addManualBooking);
router.get('/get_cabbooking',authenticate, adminController.getCabBookings);
router.delete('/cabBooking',authenticate, adminController.deleteCabBooking);

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