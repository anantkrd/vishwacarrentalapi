const { json } = require('body-parser');

const moment = require('moment');
const User = require('../../models/user');
const Otp = require('../../models/Otp');
const Booking = require('../../models/booking');
const Cabs = require('../../models/cabs');
const SearchLog = require('../../models/searchLog');
const CanceledBooking = require('../../models/canceledBooking');
const AgentBooking = require('../../models/agentBooking');
const AgentCars=require('../../models/agentCars');
const AgentDetials=require('../../models/agentDetials');
const CabTypes=require('../../models/cabTypes');
const SpecailPrices=require('../../models/specialPrices');
const CabBookings=require('../../models/cabBookings');

const Surge = require('../../models/surge');
module.exports = {

    getBookings: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let dataObj = [];
            //const Op = Sequelize.Op;
            let BookingDataObj = await Booking.find({ isDeleted: 'N',status:'waiting' });
            
            //let BookingDataObj = await Booking.find({ where: { isDeleted: 'N',status: { [Op.or]: ['waiting'] } }, offset: start, limit: perPage, order: [['id', 'desc']] })
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    
                    let canCancel = 'N';
                    if (status == 'pending') {
                        bookingStatus = "Pending";
                    } else if (status == 'waiting') {
                        bookingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bookingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    } else if (status == 'canceled') {
                        bookingStatus = "Canceled";
                    } else if (status == 'completed') {
                        bookingStatus = "Completed";
                    } else if (status == 'returnInitiated') {
                        bookingStatus = "Request For Return";
                    } else if (status == 'returnCompleted') {
                        bookingStatus = "Return Completed";
                    } else if (status == 'returnRejected') {
                        bookingStatus = "Return Rejected";
                    } else {
                        bookingStatus = status;
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                    
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({_id: cabId });
                    let cabType = cabsData['cabType'];
                    let ac = cabsData['ac'];
                    let bags = cabsData['bags'];
                    let capacity = cabsData['capacity'];
                    let cars = cabsData['cars'];
                    let note = cabsData['note'];
                    data['id'] = bookingData['id'];
                    data['canCancel'] = canCancel;
                    data['userId'] = bookingData['userId'];
                    data['userName'] = bookingData['userName'];
                    data['orderId'] = bookingData['orderId'];
                    data['cabId'] = bookingData['cabId'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['isReturn'] = bookingData['isReturn'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    let extraDistance = 0;
                    if (bookingData['journyDistance'] > bookingData['distance']) {
                        extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                    }
                    data['extraDistance'] = extraDistance;
                    data['journyTime'] = bookingData['journyTime'];
                    data['rate'] = bookingData['rate'];
                    data['amount'] = bookingData['amount'];
                    data['discount'] = bookingData['discount'];
                    data['extraRate'] = bookingData['extraRate'];
                    data['extraAmount'] = bookingData['extraAmount'];
                    data['tax'] = bookingData['tax'];
                    data['charges'] = bookingData['charges'];
                    data['finalAmount'] = bookingData['finalAmount'];
                    data['paid'] = bookingData['paid'];
                    data['agentId'] = bookingData['agentId'];
                    
                    data['agentPrice'] = bookingData['agentPrice'];
                    let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                    if (status == 'completed') {
                        pending = 0;
                    }
                    data['pending'] = pending;
                    data['driverName'] = bookingData['driverName'];
                    data['driverContact'] = bookingData['driverContact'];
                    data['journyStatus'] = bookingData['journyStatus'];
                    data['journyStartTime'] = bookingData['journyStartTime'];
                    data['journyEndTime'] = bookingData['journyEndTime'];
                    data['startKm'] = bookingData['startKm'];
                    data['endKm'] = bookingData['endKm'];
                    data['gadiNo'] = bookingData['gadiNo'];
                    data['status'] = bookingStatus;
                    data['tripStatus'] = status;
                    data['createdTime'] = bookingData['createdAt'];
                    data['cabType'] = cabType;
                    data['ac'] = ac;
                    data['bags'] = bags;
                    data['capacity'] = capacity;
                    data['cars'] = cars + " Or Similar";
                    data['note'] = note;
                    data['mobileNo'] = bookingData['userMobileNo'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await Booking.count({isDeleted: 'N',status: 'waiting' });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getAllBookings: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let dataObj = [];
            let BookingDataObj = await Booking.find({ isDeleted: 'N'}).sort({createdAt:-1}).skip(start).limit(perPage);
            //let BookingDataObj = await Booking.findAll({ where: { isDeleted: 'N' }, offset: start, limit: perPage, order: [['id', 'desc']] })
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    
                    let canCancel = 'N';
                    if (status == 'pending') {
                        bookingStatus = "Pending";
                    } else if (status == 'waiting') {
                        bookingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bookingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    } else if (status == 'canceled') {
                        bookingStatus = "Canceled";
                    } else if (status == 'completed') {
                        bookingStatus = "Completed";
                    } else if (status == 'returnInitiated') {
                        bookingStatus = "Request For Return";
                    } else if (status == 'returnCompleted') {
                        bookingStatus = "Return Completed";
                    } else if (status == 'returnRejected') {
                        bookingStatus = "Return Rejected";
                    } else {
                        bookingStatus = status;
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                    
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({ _id: cabId });
                    let cabType = cabsData['cabType'];
                    let ac = cabsData['ac'];
                    let bags = cabsData['bags'];
                    let capacity = cabsData['capacity'];
                    let cars = cabsData['cars'];
                    let note = cabsData['note'];
                    data['id'] = bookingData['id'];
                    data['canCancel'] = canCancel;
                    data['userId'] = bookingData['userId'];
                    data['userName'] = bookingData['userName'];
                    data['orderId'] = bookingData['orderId'];
                    data['cabId'] = bookingData['cabId'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['isReturn'] = bookingData['isReturn'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    let extraDistance = 0;
                    if (bookingData['journyDistance'] > bookingData['distance']) {
                        extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                    }
                    data['extraDistance'] = extraDistance;
                    data['journyTime'] = bookingData['journyTime'];
                    data['rate'] = bookingData['rate'];
                    data['amount'] = bookingData['amount'];
                    data['discount'] = bookingData['discount'];
                    data['extraRate'] = bookingData['extraRate'];
                    data['extraAmount'] = bookingData['extraAmount'];
                    data['tax'] = bookingData['tax'];
                    data['charges'] = bookingData['charges'];
                    data['finalAmount'] = bookingData['finalAmount'];
                    data['paid'] = bookingData['paid'];
                    data['agentId'] = bookingData['agentId'];
                    
                    data['agentPrice'] = bookingData['agentPrice'];
                    let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                    if (status == 'completed') {
                        pending = 0;
                    }
                    data['pending'] = pending;
                    data['driverName'] = bookingData['driverName'];
                    data['driverContact'] = bookingData['driverContact'];
                    data['journyStatus'] = bookingData['journyStatus'];
                    data['journyStartTime'] = bookingData['journyStartTime'];
                    data['journyEndTime'] = bookingData['journyEndTime'];
                    data['startKm'] = bookingData['startKm'];
                    data['endKm'] = bookingData['endKm'];
                    data['gadiNo'] = bookingData['gadiNo'];
                    data['status'] = bookingStatus;
                    data['tripStatus'] = status;
                    data['createdTime'] = bookingData['createdAt'];
                    data['cabType'] = cabType;
                    data['ac'] = ac;
                    data['bags'] = bags;
                    data['capacity'] = capacity;
                    data['cars'] = cars + " Or Similar";
                    data['note'] = note;
                    data['mobileNo'] = bookingData['userMobileNo'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await Booking.count({isDeleted: 'N' });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getCompletedBookings: async (req, res) => {
        try {
            //const Op = Sequelize.Op;
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let dataObj = [];
            let BookingDataObj = await Booking.find({ isDeleted: 'N', status: 'completed', carId: { $gt: 0 },driverId: { $gt: 0 }}).sort({createdAt:-1}).skip(start).limit(perPage);
            //let BookingDataObj1 = await Booking.findAll({ where: { isDeleted: 'N', status: 'completed', driverId: { [Op.or]: 0 }, carId: { [Op.gt]: 0 } }, offset: start, limit: perPage, order: [['id', 'desc']] })
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    
                    let canCancel = 'N';
                    if (status == 'pending') {
                        bookingStatus = "Pending";
                    } else if (status == 'waiting') {
                        bookingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bookingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    } else if (status == 'canceled') {
                        bookingStatus = "Canceled";
                    } else if (status == 'completed') {
                        bookingStatus = "Completed";
                    } else if (status == 'returnInitiated') {
                        bookingStatus = "Request For Return";
                    } else if (status == 'returnCompleted') {
                        bookingStatus = "Return Completed";
                    } else if (status == 'returnRejected') {
                        bookingStatus = "Return Rejected";
                    } else {
                        bookingStatus = status;
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                    
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({_id: cabId });
                    let cabType = cabsData['cabType'];
                    let ac = cabsData['ac'];
                    let bags = cabsData['bags'];
                    let capacity = cabsData['capacity'];
                    let cars = cabsData['cars'];
                    let note = cabsData['note'];
                    data['id'] = bookingData['id'];
                    data['canCancel'] = canCancel;
                    data['userId'] = bookingData['userId'];
                    data['userName'] = bookingData['userName'];
                    data['orderId'] = bookingData['orderId'];
                    data['cabId'] = bookingData['cabId'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['isReturn'] = bookingData['isReturn'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    let extraDistance = 0;
                    if (bookingData['journyDistance'] > bookingData['distance']) {
                        extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                    }
                    data['extraDistance'] = extraDistance;
                    data['journyTime'] = bookingData['journyTime'];
                    data['rate'] = bookingData['rate'];
                    data['amount'] = bookingData['amount'];
                    data['discount'] = bookingData['discount'];
                    data['extraRate'] = bookingData['extraRate'];
                    data['extraAmount'] = bookingData['extraAmount'];
                    data['tax'] = bookingData['tax'];
                    data['charges'] = bookingData['charges'];
                    data['finalAmount'] = bookingData['finalAmount'];
                    data['paid'] = bookingData['paid'];
                    let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                    if (status == 'completed') {
                        pending = 0;
                    }
                    data['pending'] = pending;
                    data['driverName'] = bookingData['driverName'];
                    data['driverContact'] = bookingData['driverContact'];
                    data['journyStatus'] = bookingData['journyStatus'];
                    data['journyStartTime'] = bookingData['journyStartTime'];
                    data['journyEndTime'] = bookingData['journyEndTime'];
                    data['startKm'] = bookingData['startKm'];
                    data['endKm'] = bookingData['endKm'];
                    data['gadiNo'] = bookingData['gadiNo'];
                    data['status'] = bookingStatus;
                    data['tripStatus'] = status;
                    data['createdTime'] = bookingData['createdAt'];
                    data['cabType'] = cabType;
                    data['ac'] = ac;
                    data['bags'] = bags;
                    data['capacity'] = capacity;
                    data['cars'] = cars + " Or Similar";
                    data['note'] = note;
                    data['mobileNo'] = bookingData['userMobileNo'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await Booking.find({isDeleted: 'N', status: 'completed', driverId: { $gt: 0 }, carId: { $gt: 0 } }).count();
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getReadyBookings: async (req, res) => {
        try {
            //const Op = Sequelize.Op;
            //driverId>0  and carId>0
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let dataObj = [];
            let BookingDataObj = await Booking.find({ isDeleted: 'N', status: 'confirm', carId: { $gt: 0 },driverId: { $gt: 0 }}).sort({createdAt:-1}).skip(start).limit(perPage);
            //let BookingDataObj = await Booking.findAll({ where: { isDeleted: 'N', status: 'confirm', driverId: { [Op.gt]: 0 }, carId: { [Op.gt]: 0 } }, offset: start, limit: perPage, order: [['id', 'desc']] })
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    
                    let canCancel = 'N';
                    if (status == 'pending') {
                        bookingStatus = "Pending";
                    } else if (status == 'waiting') {
                        bookingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bookingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    } else if (status == 'canceled') {
                        bookingStatus = "Canceled";
                    } else if (status == 'completed') {
                        bookingStatus = "Completed";
                    } else if (status == 'returnInitiated') {
                        bookingStatus = "Request For Return";
                    } else if (status == 'returnCompleted') {
                        bookingStatus = "Return Completed";
                    } else if (status == 'returnRejected') {
                        bookingStatus = "Return Rejected";
                    } else {
                        bookingStatus = status;
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                    
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({_id: cabId });
                    let cabType = cabsData['cabType'];
                    let ac = cabsData['ac'];
                    let bags = cabsData['bags'];
                    let capacity = cabsData['capacity'];
                    let cars = cabsData['cars'];
                    let note = cabsData['note'];
                    data['id'] = bookingData['id'];
                    data['canCancel'] = canCancel;
                    data['userId'] = bookingData['userId'];
                    data['userName'] = bookingData['userName'];
                    data['orderId'] = bookingData['orderId'];
                    data['cabId'] = bookingData['cabId'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['isReturn'] = bookingData['isReturn'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    let extraDistance = 0;
                    if (bookingData['journyDistance'] > bookingData['distance']) {
                        extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                    }
                    data['extraDistance'] = extraDistance;
                    data['journyTime'] = bookingData['journyTime'];
                    data['rate'] = bookingData['rate'];
                    data['amount'] = bookingData['amount'];
                    data['discount'] = bookingData['discount'];
                    data['extraRate'] = bookingData['extraRate'];
                    data['extraAmount'] = bookingData['extraAmount'];
                    data['tax'] = bookingData['tax'];
                    data['charges'] = bookingData['charges'];
                    data['finalAmount'] = bookingData['finalAmount'];
                    data['paid'] = bookingData['paid'];
                    let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                    if (status == 'completed') {
                        pending = 0;
                    }
                    data['pending'] = pending;
                    data['driverName'] = bookingData['driverName'];
                    data['driverContact'] = bookingData['driverContact'];
                    data['journyStatus'] = bookingData['journyStatus'];
                    data['journyStartTime'] = bookingData['journyStartTime'];
                    data['journyEndTime'] = bookingData['journyEndTime'];
                    data['startKm'] = bookingData['startKm'];
                    data['endKm'] = bookingData['endKm'];
                    data['gadiNo'] = bookingData['gadiNo'];
                    data['status'] = bookingStatus;
                    data['tripStatus'] = status;
                    data['createdTime'] = bookingData['createdAt'];
                    data['cabType'] = cabType;
                    data['ac'] = ac;
                    data['bags'] = bags;
                    data['capacity'] = capacity;
                    data['cars'] = cars + " Or Similar";
                    data['note'] = note;
                    data['mobileNo'] = bookingData['userMobileNo'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await Booking.count({isDeleted: 'N', status: 'confirm', driverId: { $gt: 0 }, carId: { $gt: 0 }});
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getConfirmBookings: async (req, res) => {
        try {
            //const Op = Sequelize.Op;
            //driverId>0  and carId>0
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 5);
            let perPage = 5;
            let dataObj = [];
            let BookingDataObj = await Booking.find({ isDeleted: 'N', status: 'confirm',driverId:0,carId:0, agentId: { $gt: 0 }}).sort({createdAt:-1}).skip(start).limit(perPage);
            //let BookingDataObj = await Booking.findAll({ where: { isDeleted: 'N', status: 'confirm', agentId: { [Op.gt]: 0 }, driverId: 0, carId: 0 }, offset: start, limit: perPage, order: [['id', 'desc']] })
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    
                    let canCancel = 'N';
                    if (status == 'pending') {
                        bookingStatus = "Pending";
                    } else if (status == 'waiting') {
                        bookingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bookingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    } else if (status == 'canceled') {
                        bookingStatus = "Canceled";
                    } else if (status == 'completed') {
                        bookingStatus = "Completed";
                    } else if (status == 'returnInitiated') {
                        bookingStatus = "Request For Return";
                    } else if (status == 'returnCompleted') {
                        bookingStatus = "Return Completed";
                    } else if (status == 'returnRejected') {
                        bookingStatus = "Return Rejected";
                    } else {
                        bookingStatus = status;
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                   
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({_id: cabId });
                    let cabType = cabsData['cabType'];
                    let ac = cabsData['ac'];
                    let bags = cabsData['bags'];
                    let capacity = cabsData['capacity'];
                    let cars = cabsData['cars'];
                    let note = cabsData['note'];
                    data['id'] = bookingData['id'];
                    data['canCancel'] = canCancel;
                    data['userId'] = bookingData['userId'];
                    data['userName'] = bookingData['userName'];
                    data['orderId'] = bookingData['orderId'];
                    data['cabId'] = bookingData['cabId'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['isReturn'] = bookingData['isReturn'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    let extraDistance = 0;
                    if (bookingData['journyDistance'] > bookingData['distance']) {
                        extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                    }
                    data['extraDistance'] = extraDistance;
                    data['journyTime'] = bookingData['journyTime'];
                    data['rate'] = bookingData['rate'];
                    data['amount'] = bookingData['amount'];
                    data['discount'] = bookingData['discount'];
                    data['extraRate'] = bookingData['extraRate'];
                    data['extraAmount'] = bookingData['extraAmount'];
                    data['tax'] = bookingData['tax'];
                    data['charges'] = bookingData['charges'];
                    data['finalAmount'] = bookingData['finalAmount'];
                    data['paid'] = bookingData['paid'];
                    let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                    if (status == 'completed') {
                        pending = 0;
                    }
                    data['pending'] = pending;
                    data['driverName'] = bookingData['driverName'];
                    data['driverContact'] = bookingData['driverContact'];
                    data['journyStatus'] = bookingData['journyStatus'];
                    data['journyStartTime'] = bookingData['journyStartTime'];
                    data['journyEndTime'] = bookingData['journyEndTime'];
                    data['startKm'] = bookingData['startKm'];
                    data['endKm'] = bookingData['endKm'];
                    data['gadiNo'] = bookingData['gadiNo'];
                    data['status'] = bookingStatus;
                    data['tripStatus'] = status;
                    data['createdTime'] = bookingData['createdAt'];
                    data['cabType'] = cabType;
                    data['ac'] = ac;
                    data['bags'] = bags;
                    data['capacity'] = capacity;
                    data['cars'] = cars + " Or Similar";
                    data['note'] = note;
                    data['mobileNo'] = bookingData['userMobileNo'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await Booking.count({isDeleted: 'N', status: 'confirm',driverId:0,carId:0, agentId: { $gt: 0 } });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getWaitingForAgentBookings: async (req, res) => {
        try {
            //const Op = Sequelize.Op;
            //driverId>0  and carId>0
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let dataObj = [];
            let BookingDataObj = await Booking.find({ isDeleted: 'N', status: 'waiting',agentId:0, agentPrice: { $gt: 0 }}).sort({createdAt:-1}).skip(start).limit(perPage);
            //let BookingDataObj = await Booking.findAll({ where: { isDeleted: 'N', status: 'waiting', agentPrice: { [Op.gt]: 0 }, agentId: 0 }, offset: start, limit: perPage, order: [['id', 'desc']] })
            if (BookingDataObj === null) {
                responce = JSON.stringify({ code: '404', message: 'Booking details not found', data: '' });
                res.status(404).send(responce);
            } else {
                //BookingDataObj.forEach((bookingData) => {
                for (const bookingData of BookingDataObj) {
                    let data = {};
                    let status = bookingData['status'];
                    let bookingStatus = '';
                    
                    let canCancel = 'N';
                    if (status == 'pending') {
                        bookingStatus = "Pending";
                    } else if (status == 'waiting') {
                        bookingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bookingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    } else if (status == 'canceled') {
                        bookingStatus = "Canceled";
                    } else if (status == 'completed') {
                        bookingStatus = "Completed";
                    } else if (status == 'returnInitiated') {
                        bookingStatus = "Request For Return";
                    } else if (status == 'returnCompleted') {
                        bookingStatus = "Return Completed";
                    } else if (status == 'returnRejected') {
                        bookingStatus = "Return Rejected";
                    } else {
                        bookingStatus = status;
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");
                    
                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    if (tripBookingBEforHours < 2 && canCancel == 'Y') {
                        canCancel = 'N';
                    }
                    let cabId = bookingData['cabId'];
                    cabsData = await Cabs.findOne({ _id: cabId });
                    let cabType = cabsData['cabType'];
                    let ac = cabsData['ac'];
                    let bags = cabsData['bags'];
                    let capacity = cabsData['capacity'];
                    let cars = cabsData['cars'];
                    let note = cabsData['note'];
                    data['id'] = bookingData['id'];
                    data['canCancel'] = canCancel;
                    data['userId'] = bookingData['userId'];
                    data['userName'] = bookingData['userName'];
                    data['orderId'] = bookingData['orderId'];
                    data['cabId'] = bookingData['cabId'];
                    data['pickup'] = bookingData['pickup'];
                    data['destination'] = bookingData['destination'];
                    data['pickupDate'] = bookingData['pickupDate'];
                    data['returnDate'] = bookingData['returnDate'];
                    data['isReturn'] = bookingData['isReturn'];
                    data['pickupLat'] = bookingData['pickupLat'];
                    data['pickupLong'] = bookingData['pickupLong'];
                    data['destinationLat'] = bookingData['destinationLat'];
                    data['destinationLong'] = bookingData['destinationLong'];
                    data['distance'] = bookingData['distance'];
                    data['journyDistance'] = bookingData['journyDistance'];
                    let extraDistance = 0;
                    if (bookingData['journyDistance'] > bookingData['distance']) {
                        extraDistance = bookingData['journyDistance'] - bookingData['distance'];
                    }
                    data['extraDistance'] = extraDistance;
                    data['journyTime'] = bookingData['journyTime'];
                    data['rate'] = bookingData['rate'];
                    data['amount'] = bookingData['amount'];
                    data['discount'] = bookingData['discount'];
                    data['extraRate'] = bookingData['extraRate'];
                    data['extraAmount'] = bookingData['extraAmount'];
                    data['tax'] = bookingData['tax'];
                    data['charges'] = bookingData['charges'];
                    data['finalAmount'] = bookingData['finalAmount'];
                    data['paid'] = bookingData['paid'];
                    let pending = bookingData['finalAmount'] - bookingData['paid'] + bookingData['extraAmount'];
                    if (status == 'completed') {
                        pending = 0;
                    }
                    data['pending'] = pending;
                    data['driverName'] = bookingData['driverName'];
                    data['driverContact'] = bookingData['driverContact'];
                    data['journyStatus'] = bookingData['journyStatus'];
                    data['journyStartTime'] = bookingData['journyStartTime'];
                    data['journyEndTime'] = bookingData['journyEndTime'];
                    data['startKm'] = bookingData['startKm'];
                    data['endKm'] = bookingData['endKm'];
                    data['gadiNo'] = bookingData['gadiNo'];
                    data['status'] = bookingStatus;
                    data['tripStatus'] = status;
                    data['createdTime'] = bookingData['createdAt'];
                    data['cabType'] = cabType;
                    data['ac'] = ac;
                    data['bags'] = bags;
                    data['capacity'] = capacity;
                    data['cars'] = cars + " Or Similar";
                    data['note'] = note;
                    data['mobileNo'] = bookingData['userMobileNo'];
                    dataObj.push(data);
                }
                //});      
                let rowCount = await Booking.count({isDeleted: 'N', status: 'waiting',agentId:0, agentPrice: { $gt: 0 }, agentId: 0 });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: '', data: dataObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    updateAgentAmount: async (req, res) => {
        try {
            amount = req.query.amount;
            bookingId = req.query.bookingId;
            updateBooking = await Booking.updateOne( { orderId: bookingId },{ $set:{agentPrice: amount} });
            responce = JSON.stringify({ code: '200', message: 'Amount updated', data: updateBooking });
            res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getAgents: async (req, res) => {
        try {
            pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let rowCount = await User.count({isDeleted: 'N', userType: 'agent' });
            //let rowCount = await AgentDetials.count({ where: { isDeleted: 'N' }});
            totalPage = rowCount / perPage;
            totalPage = Math.ceil(totalPage);
            let agentData = await User.find({ isDeleted: 'N', userType: 'agent',$lookup:
            {
               from: "vcr_agent_detials",
               localField: "_id",
               foreignField: "agentId",
               as: "AgentDetials"
            }},{userPassword:0}).sort({createdAt:-1}).skip(start).limit(perPage);
            agentDataAll=[];
            for (const agent of agentData) {
                let data = {};
                id=agent['_id'];
                let agentDetials = await AgentDetials.findOne({agentId:id,isDeleted: 'N' });
                //console.log("agentDetials=="+JSON.stringify(agentDetials))
                let companyName='';
                let accountStatus='';
                if(agentDetials!=null){
                    companyName=agentDetials['companyName'];
                    accountStatus=agentDetials['accountStatus'];
                    
                }
                data['_id']=agent['_id'];
                data['firstName']=agent['firstName'];
                data['lastName']=agent['lastName'];
                data['mobileNo']=agent['mobileNo'];
                data['userType']=agent['userType'];
                data['idProof']=agent['idProof'];
                data['idNumber']=agent['idNumber'];
                data['profileImage']=agent['profileImage'];
                data['companyName']=companyName;
                data['accountStatus']=accountStatus;
                agentDataAll.push(data)
            }
            if (agentDataAll !== null && agentDataAll.length>0) {
                
                responce = JSON.stringify({ code: '200', message: 'agents new data', data: agentDataAll, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'No agent found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    getAgentById: async (req, res) => {
        try {
            agentId = req.query.agentId;
            
            let userData = await User.findOne({isDeleted: 'N', _id: agentId, userType: 'agent' } ,{userPassword:0});
            if (userData !== null) {
                agentId=userData._id;
                const agentData = await AgentDetials.findOne({ agentId: agentId });
                responce = JSON.stringify({ code: '200', message: 'agent details', data: userData,agentData:agentData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'No agent found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some Internal server error", data: '' });
            res.status(500).send(responce);
        }
    },
    getAgentByMobileNo: async (req, res) => {
        try {
            mobileNo = req.query.mobileNo;
            let agentData = await User.findOne({ isDeleted: 'N', mobileNo: mobileNo, userType: 'agent'  },{userPassword:0});
            if (agentData !== null) {
                responce = JSON.stringify({ code: '200', message: 'agent details', data: agentData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '404', message: 'No agent found', data: '' });
                res.status(404).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some Internal server error.", data: '' });
            res.status(500).send(responce);
        }
    },
    assignAggent: async (req, res) => {
        try {
            agentId = req.query.agentId;
            bookingId = req.query.bookingId;
            checckBooking = await Booking.findOne({ orderId: bookingId });
            if (checckBooking === null) {
                responce = JSON.stringify({ code: '404', message: 'Bookign not found', data: '' });
                res.status(404).send(responce);
            } else {
                bookingAmount = checckBooking['finalAmount'];
                pendingAmount = checckBooking['bookingId'];
                tripAmount = bookingAmount;
                userPaid = checckBooking['paid'];
                pendingAmount = tripAmount - userPaid;

                advance = 0;
                paymentid = '';
                addAgentBooking = await AgentBooking.create({
                    agentId: agentId,
                    bookingId: bookingId,
                    agentAmount: bookingAmount,
                    advance: advance,
                    tripAmount: tripAmount,
                    userPaid: userPaid,
                    userPending: pendingAmount,
                    payToAgent: '0',
                    payToAgentType: 'debit',
                    paymentId: paymentid,
                    status: 'completed'
                });
                updateBooking = await Booking.updateOne({orderId: bookingId },{ $set:{agentId: agentId, agentPaid: '0', status: 'confirm' }} );
                responce = JSON.stringify({ code: '200', message: 'Bookign added', data: '' });
                res.status(200).send(responce);
            }


        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some Internal server error", data: '' });
            res.status(500).send(responce);
        }
    },
    updateCab: async (req, res) => {
        try {
            
            
            updateCab= await Cabs.updateOne(
                {"_id": req.body.cabId}, 
                {$set: {
                    cabType:req.body.cabType,
                    image:req.body.cabImage,
                    ac: req.body.ac,
                    bags: req.body.bags,
                    capacity: req.body.capacity,
                    cars: req.body.cars,
                    note: '',
                    rate: req.body.rate,
                    returnTripRate: req.body.returTripRate,
                    discount: req.body.discount,
                    extraRate: req.body.extraRate,
                    PerDayKmReturn: req.body.perDayKmReturn,
                    PerDayKmSingle: req.body.perDayKmSingle
                    }})
            responce = JSON.stringify({ code: '200', message: "Cab updated successfully", data: updateCab });
            res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:"Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    addCab: async (req, res) => {
        try {
            //console.log("req.body.cabType:="+req.body.cabType);
            if(req.body.cabType=="" || req.body.cabType==null)
            {
                console.log("Invalid data: cab type not defined")
            }
            cabType=req.body.cabType;
            cabObj = await Cabs.create({
                cabType:cabType,
                image:req.body.cabImage,
                ac: req.body.ac,
                bags: req.body.bags,
                capacity: req.body.capacity,
                cars: req.body.cars,
                note: '',
                rate: req.body.rate,
                returnTripRate: req.body.returTripRate,
                discount: req.body.discount,
                extraRate: req.body.extraRate,
                PerDayKmReturn: req.body.perDayKmReturn,
                PerDayKmSingle: req.body.perDayKmSingle
            });
            
            if (cabObj === null) {
                responce = JSON.stringify({ code: '404', message: "something went wrong", data: '' });
                res.status(404).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: "Cab added successfully", data: cabObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    getCabs: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            console.log("==========================Cabs===============")
            let cabObj = await Cabs.find({ isDeleted: 'N'}).sort({createdAt:-1});
            //cabObj = await Cabs.findAll({ where: { isDeleted: 'N' }, order: [['id', 'desc']] });
            if (cabObj === null || cabObj.length<=0) {
                responce = JSON.stringify({ code: '404', message: "No record found", data: '' });
                res.status(404).send(responce);
            } else {
                let rowCount = 10;//await Surge.count({ where: { isDeleted: 'N' } });
               
                totalPage = 1;
                responce = JSON.stringify({ code: '200', message: "success cabs", data: cabObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    getCabTypes:async(req,res)=>{
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let cabObj = await CabTypes.find({ isDeleted: 'N'}).sort({createdAt:-1});
            //cabObj = await CabTypes.findAll({ where: { isDeleted: 'N' }, order: [['id', 'desc']] });
            if (cabObj === null || cabObj.length<=0) {
                responce = JSON.stringify({ code: '404', message: "something went wrong", data: '' });
                res.status(404).send(responce);
            } else {
                let rowCount = await Surge.count({ isDeleted: 'N' });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: "success type", data: cabObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    getCabById: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let cabId = req.query.cabId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            cabObj = await Cabs.findOne({isDeleted: 'N', _id: cabId});
            if (cabObj === null) {
                responce = JSON.stringify({ code: '404', message: "something went wrong", data: '' });
                res.status(404).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: "success", data: cabObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    deleteCab:async(req,res)=>{
        try{
            let userId = req.query.userId;
            let cabId = req.query.cabId;
            deleteObj=await Cabs.updateOne({_id:cabId},{$set:{isDeleted:'Y'}});
            responce = JSON.stringify({ code: '200', message: "Cab deleted successfully", data: deleteObj });
            res.status(200).send(responce);

        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    addSurge: async (req, res) => {
        try {
            
            //surgedata='{"Sedan":'+req.body.sedanSurge+',"SUVErtiga":'+req.body.ertigaSurga+',"Innova":'+req.body.innovaSurge+',"InnovaCrysta":'+req.body.innovaCrystaSurge+',"other":'+req.body.surge+'}';
            let surgedata=req.body.surgedata;
            surgedata=JSON.stringify(surgedata);
            //surgedata=surgedata.toString();
            //console.log(req.body.cityName+"==surgedata:"+surgedata);
            if (req.body.isCity == 'N') {
                surgeObj = await Surge.create({
                    location: req.body.cityName,
                    surge: surgedata
                });
            } else {
                surgeObj = await Surge.create({
                    city: req.body.cityName,
                    surge: surgedata
                });
            }
            if (surgeObj === null) {
                responce = JSON.stringify({ code: '404', message: "something went wrong", data: '' });
                res.status(404).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: "Surge added successfully", data: surgeObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Internal server Error", data: '' });
            res.status(500).send(responce);
        }
    },
    updateSurge: async (req, res) => {
        try {
            //surgedata='{"Sedan":'+req.body.sedanSurge+',"SUVErtiga":'+req.body.ertigaSurga+',"Innova":'+req.body.innovaSurge+',"InnovaCrysta":'+req.body.innovaCrystaSurge+',"other":'+req.body.surge+'}';
            let surgedata=req.body.surgedata;
            surgedata=JSON.stringify(surgedata);
            updateObj=await Surge.updateOne({_id: req.body.surgeId },{$set:{
                city: req.body.cityName,
                surge: surgedata
            }}
            );

            responce = JSON.stringify({ code: '200', message: "Cab updated successfully", data: updateObj});
            res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    getSurge: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            
            surgeObj = await Surge.find({isDeleted: 'N'}).sort({createdAt:-1}).skip(start).limit(perPage);

            if (surgeObj === null) {
                responce = JSON.stringify({ code: '404', message: "No record found", data: '' });
                res.status(404).send(responce);
            } else {
                let rowCount = await Surge.count({isDeleted: 'N' });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: "successfully", data: surgeObj, totalPage: totalPage, rowCount: rowCount });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Internal server Error", data: '' });
            res.status(500).send(responce);
        }
    },
    getSurgeById: async (req, res) => {
        try {
            let surgeId = req.query.surgeId;
            
            surgeObj = await Surge.findOne({isDeleted: 'N', _id: surgeId });

            if (surgeObj === null) {
                responce = JSON.stringify({ code: '404', message: "something went wrong", data: '' });
                res.status(404).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: "Surge added successfully", data: surgeObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Internal server Error", data: '' });
            res.status(500).send(responce);
        }
    },    
    deleteSurge:async(req,res)=>{
        try{
            let userId = req.query.userId;
            let surgeId = req.query.surgeId;
            deleteObj=await Surge.updateOne({_id:surgeId},{$set:{isDeleted:'Y'}});
            responce = JSON.stringify({ code: '200', message: "Cab deleted successfully", data: deleteObj });
            res.status(200).send(responce);

        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    getCars:async(req,res)=>{
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            
            let agentData = await AgentCars.find({isDeleted: 'N'}).sort({createdAt:-1}).skip(start).limit(perPage);
            //let agentData = await AgentCars.findAll({include: {model:User,attributes: {exclude: ['userPassword']}}, where: { isDeleted: 'N'},offset: start, limit: perPage, order: [['id', 'desc']] });
            if (agentData !== null) {
                let rowCount = await AgentCars.count({ isDeleted: 'N'});
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
    getDrivers: async (req, res) => {
        try {
            userId = req.query.userId;
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            let agentData = await User.find({ isDeleted: 'N', userType: 'driver' },{userPassword:0}).sort({createdAt:-1}).skip(start).limit(perPage);
            let rowCount = await User.find({isDeleted: 'N', userType: 'driver' }).count();
            totalPage = rowCount / perPage;
            totalPage = Math.ceil(totalPage);
            if (agentData !== null) {
                driverData=[];
                
                for( const agent of agentData){
                    let data = {};
                    parentId=agent.parentId;
                    parrentData=await User.findOne({_id:parentId},{userPassword:0});
                    vendoreName='';
                    if(parrentData!==null){
                        vendoreName=parrentData.firstName+" "+ parrentData.lastName;
                    }
                    data['_id']=agent._id;
                    data['firstName']=agent.firstName;
                    data['lastName']=agent.lastName;
                    data['mobileNo']=agent.mobileNo;
                    data['email']=agent.email;
                    data['idProof']=agent.idProof;
                    data['idNumber']=agent.idNumber;
                    data['vendoreName']=vendoreName;
                    data['status']=agent.status;
                    driverData.push(data);
                }
                responce = JSON.stringify({ code: '200', message: 'Drives', data: driverData,totalPage:totalPage,rowCount:rowCount });
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
    updatDriverStatus:async(req,res)=>{
        try{
            userId=req.body.userId;
            driverId=req.body.driverId;
            let status=req.body.status;
            if(status=='approved'){
                userObj=await User.updateOne({_id:driverId},{$set:{status:'active'}});
                if(userObj==null){
                    responce = JSON.stringify({ code: '404', message: 'Driver Not found', data: '' });
                    res.status(404).send(responce);
                }
                responce = JSON.stringify({ code: '200', message: 'Driver Approved', data: '' });
                res.status(200).send(responce);
            }else if(status=='block'){
                userObj=await User.updateOne({_id:driverId},{$set:{status:'blocked'}});
                if(userObj==null){
                    responce = JSON.stringify({ code: '404', message: 'Driver Not found', data: '' });
                    res.status(404).send(responce);
                }
                responce = JSON.stringify({ code: '200', message: 'Driver Blocked', data: '' });
                res.status(200).send(responce);
            }else if(status=='delete'){
                userObj=await User.updateOne({_id:driverId},{$set:{status:'inactive',isDeleted:'Y'}});
                if(userObj==null){
                    responce = JSON.stringify({ code: '404', message: 'Driver Not found', data: '' });
                    res.status(404).send(responce);
                }
                responce = JSON.stringify({ code: '200', message: 'Driver Deleted', data: '' });
                res.status(200).send(responce);
            }else{
                responce = JSON.stringify({ code: '404', message: 'Something went wrong', data: '' });
                res.status(404).send(responce);
            }
        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    updatCarStatus:async(req,res)=>{
        try{
            userId=req.body.userId;
            carId=req.body.carId;
            let status=req.body.status;
            if(status=='approved'){ 
                userObj=await AgentCars.updateOne({_id:carId},{$set:{status:'active'}});
                if(userObj==null){
                    responce = JSON.stringify({ code: '404', message: 'Car Not found', data: '' });
                    res.status(404).send(responce);
                }
                responce = JSON.stringify({ code: '200', message: 'Car Approved', data: '' });
                res.status(200).send(responce);
            }else if(status=='invalid'){
                userObj=await AgentCars.updateOne({_id:carId},{$set:{status:'pending'}});
                if(userObj==null){
                    responce = JSON.stringify({ code: '404', message: 'Car Not found', data: '' });
                    res.status(404).send(responce);
                }
                responce = JSON.stringify({ code: '200', message: 'Car Blocked', data: '' });
                res.status(200).send(responce);
            }else if(status=='delete'){
                userObj=await AgentCars.updateOne({_id:carId},{$set:{isDeleted:'Y'}});
                if(userObj==null){
                    responce = JSON.stringify({ code: '404', message: 'Car Not found', data: '' });
                    res.status(404).send(responce);
                }
                responce = JSON.stringify({ code: '200', message: 'Car Deleted', data: '' });
                res.status(200).send(responce);
            }else{
                responce = JSON.stringify({ code: '404', message: 'Something went wrong', data: '' });
                res.status(404).send(responce);
            }
        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    updatAgentStatus:async(req,res)=>{
        try{
            userId=req.body.userId;
            agentId=req.body.agentId;
            let status=req.body.status;
            let type=req.body.type;
            if(status=='approve'){
                if(type=='company'){
                    agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{companyVerified:'Y'}});
                    if(agentObj==null){
                        responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                        res.status(404).send(responce);
                    }
                }else if(type=='addhar'){
                    agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{adharVerified:'Y'}});
                    if(agentObj==null){
                        responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                        res.status(404).send(responce);
                    }
                }else if(type=='license'){
                    agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{licenseVerified:'Y'}});
                    if(agentObj==null){
                        responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                        res.status(404).send(responce);
                    }
                }else if(type=='rc'){
                    agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{rcVerified:'Y'}});
                    if(agentObj==null){
                        responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                        res.status(404).send(responce);
                    }
                }
                responce = JSON.stringify({ code: '200', message: 'Status updated', data: '' });
                res.status(200).send(responce);
            }else if(status=='invalid'){
                
                if(type=='company'){
                    agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{companyVerified:'N',accountStatus:'pending'}});
                    if(agentObj==null){
                        responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                        res.status(404).send(responce);
                    }
                }else if(type=='addhar'){
                    agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{adharVerified:'N',accountStatus:'pending'}});
                    if(agentObj==null){
                        responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                        res.status(404).send(responce);
                    }
                }else if(type=='license'){
                    agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{licenseVerified:'N',accountStatus:'pending'}});
                    if(agentObj==null){
                        responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                        res.status(404).send(responce);
                    }
                }else if(type=='rc'){
                    agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{rcVerified:'N',accountStatus:'pending'}});
                    if(agentObj==null){
                        responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                        res.status(404).send(responce);
                    }
                }
                responce = JSON.stringify({ code: '200', message: 'Status updated', data: '' });
                res.status(200).send(responce);
            }else if(status=='delete'){
                userObj=await AgentCars.updateOne({_id:carId},{$set:{isDeleted:'Y'}});
                if(userObj==null){
                    responce = JSON.stringify({ code: '404', message: 'Car Not found', data: '' });
                    res.status(404).send(responce);
                }
                responce = JSON.stringify({ code: '200', message: 'Car Deleted', data: '' });
                res.status(200).send(responce);
            }else{
                responce = JSON.stringify({ code: '404', message: 'Something went wrong', data: '' });
                res.status(404).send(responce);
            }
        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    activateAgent:async(req,res)=>{
        try{
            userId=req.body.userId;
            agentId=req.body.agentId;
            let status=req.body.status;
            if(status=='approve'){
                console.log("status:"+status);
                agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{accountStatus:'active'}});
                console.log("agentObj:"+JSON.stringify(agentObj));
                if(agentObj==null){
                    responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                    res.status(404).send(responce);
                }
            }else if(status=='deactivate'){
                agentObj=await AgentDetials.updateOne({agentId:agentId},{$set:{accountStatus:'pending'}});
                if(agentObj==null){
                    responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                    res.status(404).send(responce);
                }
            }else if(status=='delete'){
                agentObj=await User.updateOne({_id:agentId},{$set:{isDeleted:'Y'}});
                if(agentObj==null){
                    responce = JSON.stringify({ code: '404', message: 'something went wrong plese try after sometime', data: '' });
                    res.status(404).send(responce);
                }
            }else{
                responce = JSON.stringify({ code: '404', message: 'something went wrong', data: '' });
                res.status(404).send(responce);
            }
            responce = JSON.stringify({ code: '200', message: 'Status updated', data: '' });
            res.status(200).send(responce);
        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '500', message: e.message || "Some error occurred while retrieving data.", data: '' });
            res.status(500).send(responce);
        }
    },
    
    cancelBooking: async (req, res) => {
        try {
            let id = req.query.bookingId;
            let userId = req.query.userId;
            const bookingData = await Booking.findOne({_id: id, isDeleted: 'N' });
            if (bookingData === null) {
                responce = JSON.stringify({ code: '404', message: 'No Booking Found', data: '' });
                res.status(404).send(responce)
            } else {
                let status = bookingData['status'];
                id = bookingData['_id'];
                bookingUserId = bookingData['userId'];
                finalAmount = bookingData['finalAmount'];
                paid = bookingData['paid'];
                bookingId = bookingData['orderId'];
                
                let bokkingStatus = '';
                let canCancel = 'N';
                userData=await User.findOne({_id:userId,userType:'admin'},{userPassword:0});
                if (userData !=null ) {
                    if (status == 'waiting') {
                        bokkingStatus = "Waiting for Approval";
                        canCancel = 'Y';
                    } else if (status == 'confirm') {
                        bokkingStatus = "Driver Assigned";
                        canCancel = 'Y';
                    }
                    let timeNow = moment().format("YYYY-MM-DD H:mm:ss");
                    timeNow = moment().add(5, 'hours');
                    timeNow = moment(timeNow).add(30, 'minutes');
                    let pickdateTime = bookingData['pickupDate'];
                    let formattedDate = moment(pickdateTime);//.format("YYYY-MM-DD H:mm:ss");

                    let tripBookingBEforHours = moment(formattedDate).diff(moment(timeNow), 'hours');
                    let earlyBookingCharges = 0;
                    returnAmount = 0;
                    if (tripBookingBEforHours > 24 && canCancel == 'Y') {
                        returnAmount = paid;
                    } else if (tripBookingBEforHours > 2 && canCancel == 'Y') {
                        returnAmount = (finalAmount * 50) / 100;
                        if (paid < returnAmount) {
                            returnAmount = paid;
                        }
                    }
                    reason = 'Booking canceled by Admin';
                    await Booking.updateOne({ _id: id},{ $set:{status: "canceled" }});
                    const userCollection = await CanceledBooking.create({
                        bookingId: id,
                        orderId: bookingId,
                        canceledBy: 'Admin',
                        userId: userId,
                        returnAmount: returnAmount,
                        reason: reason,
                        returnStatus: 'pending'
                    });

                    responce = JSON.stringify({ code: '200', message: 'Booking cancelled successfully', data: '' });
                    res.status(200).send(responce)
                } else {
                    responce = JSON.stringify({ code: '404', message: "Sorry, you can not cancel this booking", data: '' });
                    res.status(404).send(responce)
                }
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrieving tutorials.", data: '' });
            res.status(500).send(responce);
        }
    },
    addSpecialPrice: async (req, res) => {
        try {
            priceObj = await SpecailPrices.create({
                cabType:req.body.cabType,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                weekDay: req.body.weekday,
                rate: req.body.rate,
                returnTripRate: req.body.returTripRate,
                extraRate: req.body.extraRate,
                type: req.body.type,
                isDeleted:'N'
            });
            if (priceObj === null) {
                responce = JSON.stringify({ code: '404', message: "something went wrong", data: '' });
                res.status(404).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: "pricing added successfully", data: priceObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Internal server Error", data: '' });
            res.status(500).send(responce);
        }
    },
    updateSpecialPrice: async (req, res) => {
        try {
            updateObj=await SpecailPrices.updateOne({_id: req.body.priceId},
            {$set:{
                cabType:req.body.cabType,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                weekDay: req.body.weekday,
                rate: req.body.rate,
                returnTripRate: req.body.returTripRate,
                extraRate: req.body.extraRate,
                type: req.body.type,
                isDeleted:'N'
            }});

            responce = JSON.stringify({ code: '200', message: "Cab updated successfully", data: updateObj});
            res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    getSpecialPrice: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;

            surgeObj = await SpecailPrices.find( { isDeleted: 'N' }).sort({createdAt:-1}).skip(start).limit(perPage);;

            if (surgeObj === null) {
                responce = JSON.stringify({ code: '404', message: "No record found", data: '' });
                res.status(404).send(responce);
            } else {
                let rowCount = await SpecailPrices.find({ isDeleted: 'N' }).count();
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: "successfully", data: surgeObj, totalPage: totalPage, rowCount: rowCount });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Internal server Error", data: '' });
            res.status(500).send(responce);
        }
    },
    getSpecialPriceById: async (req, res) => {
        try {
            let priceId = req.query.priceId;            
            surgeObj = await SpecailPrices.findOne({ isDeleted: 'N', _id: priceId });

            if (surgeObj === null) {
                responce = JSON.stringify({ code: '404', message: "something went wrong", data: '' });
                res.status(404).send(responce);
            } else {
                responce = JSON.stringify({ code: '200', message: "Surge added successfully", data: surgeObj });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Internal server Error", data: '' });
            res.status(500).send(responce);
        }
    },    
    deleteSpecialPrice:async(req,res)=>{
        try{
            let userId = req.query.userId;
            let priceId = req.query.priceId;
            deleteObj=await SpecailPrices.updateOne({_id:priceId},{$set:{isDeleted:'Y'}});
            responce = JSON.stringify({ code: '200', message: "special Price deleted successfully", data: deleteObj });
            res.status(200).send(responce);

        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: e.message || "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
        
    addManualBooking:async(req,res)=>{
        try{
            
            let userId = req.body.userId;
            let firstName = req.body.firstName;
            let lastName = req.body.lastName;
            let mobileNo = req.body.mobileNo;
            let email = req.body.email;
            let pickUp = req.body.pickUp;
            let destination = req.body.destination;
            let passengers = req.body.passengers;
            let language = req.body.language;
            let totalAmount = req.body.totalAmount;
            let advanceAmount = req.body.advanceAmount;
            let paidAmount = req.body.paidAmount;
            let bookingDate = req.body.bookingDate;
            let cabType=req.body.cabType;
            let status=req.body.status;
            console.log("status:"+status);
            bookingData = await CabBookings.create({
                userId: userId, firstName: firstName,lastName:lastName, mobileNo: mobileNo, email: email, pickUp: pickUp,  destination: destination, passengers: passengers, 
                language: language, status: status, totalAmount: totalAmount,advanceAmount: advanceAmount, paidAmount: paidAmount, bookingDate: bookingDate,Cab:cabType
            });
            if (bookingData !== null) {
                responce = JSON.stringify({ code: '200', message: "Booking Created successfully", data: bookingData });
                res.status(200).send(responce);
            } else {
                responce = JSON.stringify({ code: '400', message: "Sorry, something went wrong", data: '' });
                res.status(200).send(responce);
            }
        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
    
    getCabBookings: async (req, res) => {
        try {
            let pageId = req.query.pageId;
            let start = ((pageId - 1) * 10);
            let perPage = 10;
            console.log("==========================Bookings===============")
            let cabObj = await CabBookings.find({ isDeleted: 'N'}).sort({bookingDate:1}).skip(start).limit(perPage);
            //cabObj = await Cabs.findAll({ where: { isDeleted: 'N' }, order: [['id', 'desc']] });
            if (cabObj === null || cabObj.length<=0) {
                responce = JSON.stringify({ code: '404', message: "No record found", data: '' });
                res.status(404).send(responce);
            } else {
                let rowCount = await CabBookings.count({isDeleted: 'N' });
                totalPage = rowCount / perPage;
                totalPage = Math.ceil(totalPage);
                responce = JSON.stringify({ code: '200', message: "success cabs", data: cabObj, rowCount: rowCount, totalPage: totalPage });
                res.status(200).send(responce);
            }
        } catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message: "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },    
    deleteCabBooking:async(req,res)=>{
        try{
            let userId = req.query.userId;
            let bookingId = req.query.bookingId;
            deleteObj=await CabBookings.updateOne({_id:bookingId},{$set:{isDeleted:'Y'}});
            responce = JSON.stringify({ code: '200', message: "Deleted successfully", data: deleteObj });
            res.status(200).send(responce);

        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },
        
    updateManualBooking:async(req,res)=>{
        try{
            let userId = req.query.userId;
            let priceId = req.query.priceId;
            deleteObj=await SpecailPrices.updateOne({_id:priceId},{$set:{isDeleted:'N'}});
            responce = JSON.stringify({ code: '200', message: "special Price deleted successfully", data: deleteObj });
            res.status(200).send(responce);

        }catch (e) {
            console.log(e)
            responce = JSON.stringify({ code: '501', message:  "Some error occurred while retrive data", data: '' });
            res.status(500).send(responce);
        }
    },

}