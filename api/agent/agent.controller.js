const { json } = require('body-parser');
const { create, getCabs, getBookingsForAgent, getMyBookings, getMyCompletedBookings } = require('./agent.service');

const { sentAgentTripConfirmation } = require('../common/sendSms');
const { createUser, getUserByMobile } = require('../user/user.controller');
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
const AgentDetial=require('../../models/agentDetials');
const { Sequelize, DataTypes, Model, where } = require('sequelize');
module.exports = {
    getAgent: async (req, res) => {
        try {
            let userId = req.query.userId;
            const userData = await User.findOne({attributes: { exclude: ['userPassword'] } , where: { id: userId }} );
            if (userData === null) {                
                responce = JSON.stringify({ code: '404', message: 'User Not Found', data: '' });
                res.status(404).send(responce)
            } else {
                agentId=userData.id;
                const agentData = await AgentDetial.findOne({where: { agentId: agentId }});
                responce = JSON.stringify({ code: '200', message: '', data: userData,agentData:agentData });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },    
    getNewBookings: async (req, res) => {
        try {
            agentId = req.query.agentId;
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;

            let agentData = await Booking.findAll({ where: { isDeleted: 'N', status: 'waiting' }, offset: start, limit: perPage, order: [['id', 'desc']] });
            if (agentData !== null) {
                let rowCount = await Booking.count({ where: { isDeleted: 'N', status: 'waiting' }, offset: start, limit: perPage, order: [['id', 'desc']] });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: 'Agents Booking', data: agentData, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Agent Booking not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getbookingByAgent: async (req, res) => {
        try {
            agentId = req.query.agentId;
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;

            let agentData = await Booking.findAll({ where: { agentId: agentId, isDeleted: 'N' }, offset: start, limit: perPage, order: [['id', 'desc']] });
            if (agentData !== null) {
                let rowCount = await Booking.count({ where: { agentId: agentId, isDeleted: 'N' }, offset: start, limit: perPage, order: [['id', 'desc']] });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: 'Agents Booking', data: agentData, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Agent Booking not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getCompletedBookings: async (req, res) => {
        try {
            agentId = req.query.agentId;
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;

            let agentData = await AgentBooking.findAll({ where: { agentId: agentId, isDeleted: 'N', status: 'completed' }, offset: start, limit: perPage, order: [['id', 'desc']] });
            if (agentData !== null) {
                let rowCount = await AgentBooking.count({ where: { agentId: agentId, isDeleted: 'N', status: 'completed' }, offset: start, limit: perPage, order: [['id', 'desc']] });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: 'Agents Booking', data: agentData, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Agent Booking not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getCar: async (req, res) => {
        try {
            carNo = req.query.carNo;
            agentId = req.query.agentId;
            let agentData = await AgentCars.findAll({ where: { isDeleted: 'N', agentId: agentId, carNo: carNo } });
            if (agentData !== null) {
                responce = JSON.stringify({ code: '200', message: 'cars', data: agentData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Car not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getCarById:async(req,res)=>{
        try {
            agentId = req.query.userId;            
            carId = req.query.carId;
            let agentData = await AgentCars.findOne({ where: { isDeleted: 'N', agentId: agentId,id:carId}});
            if (agentData !== null) {
                
                responce = JSON.stringify({ code: '200', message: 'cars', data: agentData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Car not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getCars:async(req,res)=>{
        try {
            agentId = req.query.userId;
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let agentData = await AgentCars.findAll({ where: { isDeleted: 'N', agentId: agentId},offset: start, limit: perPage, order: [['id', 'desc']] });
            if (agentData !== null) {
                let rowCount = await AgentCars.count({ where: { isDeleted: 'N', agentId: agentId}, offset: start, limit: perPage, order: [['id', 'desc']] });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: 'cars', data: agentData,totalPage:totalPage,rowCount:rowCount });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Car not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getDriverByMobile: async (req, res) => {
        try {
            mobileNo = req.query.mobileNo;
            let agentData = await User.findOne({ where: { isDeleted: 'N', mobileNo: mobileNo, userType: 'driver' } });
            if (agentData !== null) {
                responce = JSON.stringify({ code: '200', message: 'Drives', data: agentData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Driver Not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getDriverById:async(req,res)=>{
        try {
            driverId = req.query.driverId;
            let agentData = await User.findOne({ where: { isDeleted: 'N', id: driverId, userType: 'driver' } });
            if (agentData !== null) {
                responce = JSON.stringify({ code: '200', message: 'Drives', data: agentData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Driver Not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    getDrivers: async (req, res) => {
        try {
            userId = req.query.userId;
            let agentData = await User.findAll({ where: { isDeleted: 'N', parentId: userId, userType: 'driver' } });
            if (agentData !== null) {
                responce = JSON.stringify({ code: '200', message: 'Drives', data: agentData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'Driver Not found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    addCar: async (req, res) => {
        try {
            agentId = req.query.userId;
            let carNo=req.query.carNo;
            let carModelName=req.query.carModelNo;
            carType= req.query.carType;
            rcBook=req.query.rcBook;

            agentCarObj = await AgentCars.create({
                agentId: agentId,
                carNo: carNo,
                carModelName: carModelName,
                carType: carType,
                rcBook: rcBook,
                isDeleted: 'N'
            });
            if (agentCarObj === null) {
                responce = JSON.stringify({ code: '500', message: 'Something went wrong', data: '' });
                res.status(500).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: 'Cars', data: agentCarObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    updateCar: async (req, res) => {
        try {
            agentId = req.body.userId;
            let carNo=req.body.carNo;
            let carModelName=req.body.carModelNo;
            carType= req.body.carType;
            rcBook=req.body.rcBook;
            carId=req.body.carId;
            checkCarObj=await AgentCars.findOne({where:{id:carId, agentId:agentId}});
            if(checkCarObj==null){
                responce = JSON.stringify({ code: '500', message: 'Not authorised for delete car', data: agentCarObj });
                res.status(500).send(responce);
            }
            agentCarObj = await AgentCars.update({
                agentId: agentId,
                carNo: carNo,
                carModelName: carModelName,
                carType: carType,
                rcBook: rcBook,
                status:'pending',
                isDeleted: 'N'
            },{where:{id:carId}});
            if (agentCarObj === null) {
                responce = JSON.stringify({ code: '500', message: 'Something went wrong', data: '' });
                res.status(500).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: 'Cars', data: agentCarObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    
    assignBookingCar: async (req, res) => {
        try {
            agentId = req.body.agentId;
            carId = req.body.carId;
            modelName = req.body.modelName;
            carNo = req.body.carNo;
            bookingId = req.body.bookingId;
            updateObj = await Booking.update({
                carId: carId,
                gadiNo: carNo,
                gadiModel: modelName
            }, {
                where: { orderId: bookingId }
            });
            if (updateObj === null) {
                responce = JSON.stringify({ code: '500', message: 'Something went wrong', data: '' });
                res.status(500).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: 'Cars', data: updateObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    assignBookingDriver: async (req, res) => {
        try {
            bookingId = req.body.bookingId;
            driverName: req.body.driverName;
            mobileNo = req.body.mobileNo;
            bookingId = req.body.bookingId;
            contactNo = req.body.contactNo;
            driverId = req.body.driverId;
            assignDrive = await Booking.findOne({
                where: {
                    orderId: bookingId
                }
            });

            if (assignDrive == null) {
                responce = JSON.stringify({ code: '500', message: 'Something went wrong', data: '' });
                res.status(500).send(responce);
            } else {
                if (assignDrive.carId > 0) {
                    assignDriverObj = await Booking.update({
                        driverName: driverName,
                        driverContact: mobileNo,
                        driverId: driverId
                    }, {
                        where: { orderId: bookingId }
                    });
                    if (assignDriverObj === null) {
                        responce = JSON.stringify({ code: '500', message: 'Something went wrong', data: '' });
                        res.status(500).send(responce);
                    } else {
                        let sendSms = sentAgentTripConfirmation(bookingId, 'drivers');
                        responce = JSON.stringify({ code: '200', message: 'Success', data: assignDriverObj });
                        res.status(200).send(responce);
                    }
                } else {
                    responce = JSON.stringify({ code: '400', message: 'Please add car first', data: '' });
                    res.status(400).send(responce);
                }
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    addDriver: async (req, res) => {
        try {
            userId = req.body.userId;
            firstName = req.body.firstName;
            lastName = req.body.lastName;
            mobileNo = req.body.mobileNo;
            email = req.body.email;
            licenseNo = req.body.licenseNo;
            licenseUrl = req.body.licenseUrl;

            checkDriver = await User.findOne({ where: { mobileNo: mobileNo } });
            if (checkDriver !== null) {
                responce = JSON.stringify({ code: '400', message: "mobile no is already register", data: '' });
                res.status(400).send(responce);
            } else {
                createUserObj = await User.create({
                    firstName: firstName,
                    lastName: lastName,
                    mobileNo: mobileNo,
                    email: email,
                    userPassword: mobileNo,
                    parentId: userId,
                    idProof: licenseUrl,
                    idNumber: licenseNo,
                    userType: 'driver',
                    status: 'pending'
                })
                if (createUserObj == null) {
                    responce = JSON.stringify({ code: '400', message:"Something went wrong", data: '' });
                    res.status(400).send(responce);
                } else {
                    responce = JSON.stringify({ code: '200', message: "success", data: createUserObj });
                    res.status(200).send(responce);
                }
            }

        } catch (e) {
            console.log(e);
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    updateDriver: async (req, res) => {
        try {
            userId = req.body.userId;
            firstName = req.body.firstName;
            lastName = req.body.lastName;
            mobileNo = req.body.mobileNo;
            email = req.body.email;
            licenseNo = req.body.licenseNo;
            licenseUrl = req.body.licenseUrl;
            driverId = req.body.driverId;
            const Op = Sequelize.Op;
            // { [Op.or]: ['pending', 'waiting'] } }
            checkDriver = await User.findOne({ where: { mobileNo: mobileNo,id:{[Op.not]:driverId} } });
            if (checkDriver !== null) {
                responce = JSON.stringify({ code: '400', message: "mobile no is already register", data: '' });
                res.status(400).send(responce);
            } else {
                createUserObj = await User.update({
                    firstName: firstName,
                    lastName: lastName,
                    mobileNo: mobileNo,
                    email: email,
                    userPassword: mobileNo,
                    parentId: userId,
                    idProof: licenseUrl,
                    idNumber: licenseNo,
                    userType: 'driver',
                    status: 'pending'
                },{where:{id:driverId}})
                if (createUserObj == null) {
                    responce = JSON.stringify({ code: '400', message:"Something went wrong", data: '' });
                    res.status(400).send(responce);
                } else {
                    responce = JSON.stringify({ code: '200', message: "success", data: createUserObj });
                    res.status(200).send(responce);
                }
            }

        } catch (e) {
            console.log(e);
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    deleteDriver:async(req,res)=>{
        try{
            let userId = req.query.userId;
            let driverId = req.query.driverId;
            deleteObj=await User.update({isDeleted:'Y'},{where:{id:driverId}});
            responce = JSON.stringify({ code: '200', message: "Driver deleted successfully", data: deleteObj });
            res.status(200).send(responce);

        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    deleteCar:async(req,res)=>{
        try{
            let userId = req.query.userId;
            let carId = req.query.carId;
            deleteObj=await AgentCars.update({isDeleted:'Y'},{where:{id:carId}});
            responce = JSON.stringify({ code: '200', message: "Car deleted successfully", data: deleteObj });
            res.status(200).send(responce);

        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    
    agentPayment: async (req, res) => {
        try {
            let amount = req.body.amount;
            let receiptId = req.body.bookingId;
            let agentId = req.body.agentId;
            let bookingAmount = req.body.bookingAmount;
            let pendingAmount = req.body.userAmount;
            let tripAmount = req.body.tripAmount;
            let userPaid = req.body.userPaid;
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
            console.log("order=====******" + order)
            console.log("order====" + JSON.stringify(order));
            let orgAmount = amount / 100;
            insertAgentBooking = await AgentBooking.create({
                agentId: agentId,
                bookingId: bookingId,
                agentAmount: bookingAmount,
                advance: advance,
                tripAmount: tripAmount,
                userPaid: userPaid,
                userPending: pendingAmount,
                payToAgent: '0',
                payToAgentType: 'debit',
                paymentId: paymentid
            });
            if (insertAgentBooking === null) {
                responce = JSON.stringify({ code: '400', message: "Something went wrong while adding agent booking", data: '' });
                res.status(400).send(responce);
            } else {
                updateBooking = await Booking.update({ agentPaid: advance }, { orderId: bookingId });
                responce = JSON.stringify({ code: '200', message: "success", data: '' });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred.", data: '' });
            res.status(500).send(responce);
        }
    },
    agentPaymentSuccess: async (req, res) => {
        try {
            console.log("IN SUccess");
            let razorpayPaymentId = req.body.razorpayPaymentId;
            let razorpayOrderId = req.body.razorpayOrderId;
            let razorpaySignature = req.body.razorpaySignature;
            let rawResponce = req.body.rawResponce;
            let bookingAmount = 0;//req.body.bookingAmount;
            console.log("Body==" + JSON.stringify(req.body));
            agentBookingData = await AgentBooking.findOne({ where: { paymentId: razorpayOrderId } });
            if (agentBookingData == null) {
                responce = JSON.stringify({ code: '400', message: e.message || "Some error occurred.", data: '' });
                res.status(400).send(responce);
            } else {
                bookingAmount = agentBookingData['amount'];
                agentId = agentBookingData['agentId'];
                bookingId = agentBookingData['bookingId'];
                updateAgent = await AgentBooking.update({
                    status: "completed",
                    rawResponce: rawResponce
                }, { where: { paymentId: razorpayOrderId } });

                updateBooking = await Booking.update({ agentId: agentId, status: 'confirm' }, { where: { orderId: bookingId } });
                let sendSms = sentAgentTripConfirmation(bookingId, 'agent');
                responce = JSON.stringify({ code: '200', message: "payment completed successfully", data: '' });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred.", data: '' });
            res.status(500).send(responce);
        }
    },
    agentPrePayment: async (req, res) => {
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
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred.", data: '' });
            res.status(500).send(responce);
        }
    },
    updateImage:async(req,res)=>{
        try{
            let agentId = req.body.userId;
            let type = req.body.type;
            let imageUrl = req.body.imageUrl;
            let updateAgen="";
            if(type=='rcImage'){
                updateAgent=await AgentDetial.update({rcLink:imageUrl,rcVerified:'N'},{where:{agentId:agentId}});
            }
            if(type=='licenseImage'){
                updateAgent=await AgentDetial.update({licenseLink:imageUrl,licenseVerified:'N'},{where:{agentId:agentId}});
            }
            if(type=='adharImage'){
                updateAgent=await AgentDetial.update({adharLink:imageUrl,adharVerified:'N'},{where:{agentId:agentId}});
            }
            if(type=='comapnyUpdate'){
                companyName=req.body.companyName;
                officeAddress=req.body.officeAddress;
                updateAgent=await AgentDetial.update({companyName:companyName,officeAddress:officeAddress,registrationCopy:imageUrl,companyVerified:'N'},{where:{agentId:agentId}});
            }
            responce = JSON.stringify({ code: '200', message: "agent successfully", data: '' });
            res.status(200).send(responce);

        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    }
}