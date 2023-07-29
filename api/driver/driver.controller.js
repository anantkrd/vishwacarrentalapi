const { json } = require('body-parser');
const { startTrip, endTrip, completeTrip } = require('./driver.service');
const { createUser, getUserByMobile } = require('../user/user.controller');

const { sentBookingSmsDriverAssined } = require('../common/sendSms');
const moment = require('moment');
const User = require('../../models/user');
const Otp = require('../../models/Otp');
const Booking = require('../../models/booking');
const Cabs = require('../../models/cabs');
const SearchLog = require('../../models/searchLog');
const CanceledBooking = require('../../models/canceledBooking');
const AgentBooking = require('../../models/agentBooking');
const Surge = require('../../models/surge');
const AgentCars = require('../../models/agentCars');

const Razorpay = require("razorpay");
module.exports = {
    getMyTrip: async (req, res) => {
        try {
            userId = req.query.userId;
            pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            

            //bookingObj = await Booking.find({isDeleted: 'N', status: { $or: ['confirm', 'started'] }, driverId: userId }).sort({createdAt:-1}).skip(start).limit(perPage);
            bookingObj = await Booking.find({isDeleted: 'N', status: 'confirm', driverId: userId }).sort({createdAt:-1}).skip(start).limit(perPage);
            if (bookingObj !== null) {
                let rowCount = await Booking.find({isDeleted: 'N', status: 'confirm', driverId: userId }).count();
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: bookingObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '400', message: e.message || "No data found", data: '' });
                res.status(400).send(responce);
            }
            //isDeleted='N' and (status='confirm' || status='started') and driverId=?
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred", data: '' });
            res.status(500).send(responce);
        }
    },
    getPaymentReport: async (req, res) => {
        try {
            userId = req.query.userId;
            pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            

            bookingObj = await Booking.find({isDeleted: 'N', driverId: userId }).sort({createdAt:-1}).skip(start).limit(perPage);
            if (bookingObj !== null) {
                let rowCount = await Booking.find({ isDeleted: 'N',driverId: userId }).count();
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: bookingObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '400', message: e.message || "No data found", data: '' });
                res.status(400).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred", data: '' });
            res.status(500).send(responce);
        }
    },
    startTrip: async (req, res) => {
        try {
            userId = req.query.userId;
            bookingId = req.query.bookingId;
            startkm = req.query.startkm;
            startPin = req.query.startPin;
            let dateNow = moment().format('YYYY-MM-DD hh:mm:ss');
            //sqlcheck="update `prayag_booking` set startKm=?,journyStartTime=?,status='started',journyStatus='start' WHERE orderId=?";   
            updateBooking = await Booking.updateOne({ orderId: bookingId },{$set:{startKm: startkm, journyStartTime: dateNow, status: 'started', journyStatus: 'start' } });
            if (updateBooking !== null) {
                responce = JSON.stringify({ code: '200', message: 'Trip started', data: updateBooking });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '400', message: e.message || "Somethign went wrong, please try again", data: '' });
                res.status(400).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred", data: '' });
            res.status(500).send(responce);
        }
    },
    endTrip: async (req, res) => {
        try {
            let dateNow = moment().format('YYYY-MM-DD hh:mm:ss');
            userId = req.query.userId;
            bookingId = req.query.bookingId;
            endkm = req.query.endkm;
            bookingObj = await Booking.findOne({isDeleted: 'N', orderId: bookingId });
            if (bookingObj === null) {
                responce = JSON.stringify({ code: '400', message: "Booking not found", data: '' });
                res.status(400).send(responce);
            } else {
                let startKm = bookingObj['startKm'];
                let rate = bookingObj['rate'];
                let extraRate = bookingObj['extraRate'];
                let journyDistance = endKm - startKm;
                let distance = bookingObj['distance'];
                let extraKm = 0;
                let extraAmount = 0;
                if (journyDistance > distance) {
                    extraKm = journyDistance - distance;
                }
                extraAmount = extraRate * extraKm;
                updateBooking = await Booking.updateOne({ orderId: bookingId } ,{$set:{
                    endKm: extraKm,
                    journyEndTime: dateNow,
                    journyStatus: 'completed',
                    extraAmount: extraAmount,
                    extraRate: extraRate,
                    journyDistance: journyDistance,
                }});
                if (updateBooking !== null) {
                    sms = await module.exports.tripCompletedsms(bookingId);
                } else {
                    responce = JSON.stringify({ code: '400', message: "Trip ended successfullly", data: '' });
                    res.status(400).send(responce);
                }
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred", data: '' });
            res.status(500).send(responce);
        }
    },
    completeTrip: async (req, res) => {
        try {
            userId = req.query.userId;
            bookingId = req.query.bookingId;
            let dateNow = moment().format('YYYY-MM-DD hh:mm:ss');
            checkBooking = await Booking.findOne({ isDeleted: 'N', journyStatus: 'completed', status: 'started', orderId: bookingId });
            if (checkBooking == null) {
                responce = JSON.stringify({ code: '400', message: "Booking Not Found", data: '' });
                res.status(400).send(responce);
            } else {
                let extraAmount = checkBooking['extraAmount'];
                let pending = checkBooking['pending'] + results[0]['extraAmount'];
                let finalAmount = checkBooking['finalAmount'] + extraAmount;
                let cashAmount = pending;
                updateBooking = Booking.updateOne({ orderId: bookingId}, {$set:{status: 'completed', pending: '0', finalAmount: finalAmount, paid: finalAmount, extraAmount: extraAmount, cashAmount: cashAmount } });
            }
            responce = JSON.stringify({ code: '200', message: "Trip Completed successfully", data: '' });
            res.status(200).send(responce);

        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred", data: '' });
            res.status(500).send(responce);
        }
    },
    startTrip_old: async (userId, bookingId, startKm) => {
        treipRes = await startTrip(userId, bookingId, startKm);
        //console.log("treipRes==="+JSON.stringify(treipRes));
        return treipRes;
    },
    endTrip_old: async (userId, bookingId, endKm) => {
        treipRes = await endTrip(userId, bookingId, endKm);
        //console.log("endTrip==="+JSON.stringify(treipRes));
        return treipRes;
    },
    completeTrip_old: async (userId, bookingId) => {
        treipRes = await completeTrip(userId, bookingId);
        //console.log("endTrip==="+JSON.stringify(treipRes));
        return treipRes;
    },

}