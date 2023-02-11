const pool = require('../../config/database');
const moment = require('moment');
var request = require('request');
const { getBookingByOrderId, sendSms } = require('../booking/booking.service');
module.exports = {
    getMyBookings: async (agentId, pageId) => {
        let start = ((pageId - 1) * 10);
        let perPage = 10;
        sqlcheck = "SELECT booking.*,cabs.cabType,cabs.ac,cabs.bags,cabs.capacity,cabs.cars,cabs.note,(select mobileNo from prayag_users where id=booking.userId ) as mobileNo FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and agentPrice>0 and agentId=? and booking.status='confirm' order by booking.id desc limit ?,?";

        return new Promise((resolve, reject) => {
            pool.query(sqlcheck, [agentId, start, perPage], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    getAgent: async (agentId) => {

        sqlcheck = "SELECT * FROM `prayag_users` where id=?";

        return new Promise((resolve, reject) => {
            pool.query(sqlcheck, [agentId], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    getMyCompletedBookings: async (agentId, pageId) => {
        let start = ((pageId - 1) * 10);
        let perPage = 10;
        sqlcheck = "SELECT booking.*,cabs.cabType,cabs.ac,cabs.bags,cabs.capacity,cabs.cars,cabs.note,(select mobileNo from prayag_users where id=booking.userId ) as mobileNo FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and agentPrice>0 and agentId=? and booking.status='completed' order by booking.id desc limit ?,?";

        return new Promise((resolve, reject) => {
            pool.query(sqlcheck, [agentId, start, perPage], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    getBookingsForAgent: async (agentId, pageId) => {
        let start = ((pageId - 1) * 10);
        let perPage = 10;
        sqlcheck = "SELECT booking.*,cabs.cabType,cabs.ac,cabs.bags,cabs.capacity,cabs.cars,cabs.note,(select mobileNo from prayag_users where id=booking.userId ) as mobileNo FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and agentPrice>0 and agentId=? and booking.status='waiting' order by booking.id desc limit ?,?";

        return new Promise((resolve, reject) => {
            pool.query(sqlcheck, [agentId, start, perPage], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    getSurge: async (cityName, callBack) => {
        sql = "SELECT city,compact,sedan,luxury,other FROM `prayag_surge` WHERE `city` LIKE '" + cityName + "' and isDeleted='N'";

        return new Promise((resolve, reject) => {
            pool.query(sql, (error, elements) => {

                if (elements == '' || elements.length <= 0) {

                    let json = [{ "city": "Pune", "compact": 1, "sedan": 1, "luxury": 1, "other": 1 }]
                    return resolve(json);
                }

                return resolve(elements);
            });
        });
    },
    addPaymentAgent: async (advance, bookingId, agentId, paymentid, bookingAmount, pendingAmount, tripAmount, userPaid) => {
        sql = "INSERT INTO `prayag_agent_booking`(`agentId`, `bookingId`, `agentAmount`, `advance`,`tripAmount`,`userPaid`, `userPending`, `payToAgent`, `payToAgentType`, `paymentId`) VALUES ('" + agentId + "','" + bookingId + "','" + bookingAmount + "','" + advance + "','" + tripAmount + "','" + userPaid + "','" + pendingAmount + "','0','debit','" + paymentid + "')";

        return new Promise((resolve, reject) => {
            pool.query(sql, (error, elements) => {
                if (error) {
                    return reject(error);
                }
                sqlcheck = "update `prayag_booking` set agentPaid=? WHERE orderId=?";
                new Promise((resolve, reject) => {
                    pool.query(sqlcheck, [advance, bookingId], (error, resultsup) => {

                    });
                });
                return resolve(elements);
            });
        });
    },
    updateBookingDetails: async (razorpayOrderId, rawResponce) => {
        sqlGetPay = "select * from prayag_agent_booking where paymentId='" + razorpayOrderId + "'";
        let resData = JSON.stringify({ code: '200', msg: 'success', data: '' });
        return new Promise((resolve, reject) => {
            pool.query(sqlGetPay, async (error, result) => {

                if (error) {
                    return reject(error);
                }
                bookingAmount = result[0]['amount'];
                agentId = result[0]['agentId'];
                bookingId = result[0]['bookingId'];
                sqlUpdatePayment = "UPDATE `prayag_agent_booking` SET `status`='completed',rawResponce='" + rawResponce + "' WHERE paymentId='" + razorpayOrderId + "'";
                pool.query(sqlUpdatePayment, (error, elements) => {
                    if (error) {
                        //return reject(error);
                    }
                });
                sqlUpdateBooking = "UPDATE `prayag_booking` SET `agentId`='" + agentId + "',`status`='confirm' WHERE orderId='" + bookingId + "'";
                pool.query(sqlUpdateBooking, (error, elements) => {
                    if (error) {
                        //return reject(error);
                    }
                });
                let sendSms = await module.exports.sentBookingSmsDriverAssined(bookingId, 'agent');
                return resolve(resData);
            });
            return resolve(resData);

        });
    },
    addCar: async (userId, carModelName, carNo, carType, rcBook) => {
        sqlCars = "select * from prayag_agent_cars where carNo='" + carNo + "' and isDeleted='N'";

        return new Promise((resolve, reject) => {
            pool.query(sqlCars, (error, result) => {

                if (result.length > 0) {
                    return resolve({ code: 500, msg: "Car already added" });
                } else {
                    insertCar = "INSERT INTO `prayag_agent_cars`(`agentId`, `carNo`, `carModelName`, `carType`, `rcBook`, `isDeleted`) VALUES ('" + userId + "','" + carNo + "','" + carModelName + "','" + carType + "','" + rcBook + "','N')";

                    pool.query(insertCar, (error, elements) => {
                        if (error) {
                            return reject(error);
                        }
                    });
                    return resolve({ code: 200, msg: "Car added" });
                }


            });
            //return reject({code:500,msg:"some thing went wrong"});
        });

    },
    getCars: async (agentId, pageId) => {
        let start = ((pageId - 1) * 10);
        let perPage = 10;
        sqlcheck = "SELECT id,carNo,carModelName,carType,rcBook from prayag_agent_cars where agentId=? order by Id desc limit ?,? ";

        return new Promise((resolve, reject) => {
            pool.query(sqlcheck, [agentId, start, perPage], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    addDriver: async (userId, firstName, lastName, mobileNo, email, licenseNo, licenseUrl) => {
        sqlCars = "select * from prayag_users where mobileNo='" + mobileNo + "'";

        return new Promise((resolve, reject) => {
            pool.query(sqlCars, (error, result) => {

                if (result.length > 0) {
                    return resolve({ code: 500, msg: "Driver is already added" });
                } else {
                    var insertDiver = "INSERT INTO prayag_users (firstName, lastName,mobileNo,email,userPassword,parentId,idProof,idNumber,userType,status) VALUES (?,?,?,?,?,?,?,?,?,?)";
                    data = [firstName, lastName, mobileNo, email, mobileNo, userId, licenseUrl, licenseNo, 'driver', 'Active'];
                    pool.query(insertDiver, data, (error, resultData) => {
                        if (error) {
                            return reject(error);
                        }
                    });
                }

            });
            //return reject({code:500,msg:"some thing went wrong"});
        });

    },
    getDrivers: async (userId, pageId) => {
        let start = ((pageId - 1) * 10);
        let perPage = 10;
        sqlcheck = "SELECT * from prayag_users where parentId=? and isDeleted='N' order by Id desc limit ?,? ";

        return new Promise((resolve, reject) => {
            pool.query(sqlcheck, [userId, start, perPage], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    searchDriver: async (mobile) => {
        sqlcheck = "SELECT * from prayag_users where mobileNo=? and isDeleted='N' and userType='driver' order by Id desc ";
        return new Promise((resolve, reject) => {
            pool.query(sqlcheck, [mobile], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    searchCar: async (carNo) => {
        sqlcheck = "SELECT * from prayag_agent_cars where carNo=? and isDeleted='N' order by Id desc ";

        return new Promise((resolve, reject) => {
            pool.query(sqlcheck, [carNo], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    assignBookingCar: async (agentId, carId, modelName, carNo, carType, bookingId) => {
        modelName = carType + " " + modelName;
        updateSql = "update prayag_booking set carId='" + carId + "',gadiNo='" + carNo + "',gadiModel='" + modelName + "'  where orderId='" + bookingId + "'";

        return new Promise((resolve, reject) => {
            pool.query(updateSql, [], (error, results) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    assignBookingDriver: async (agentId, driverId, driverName, mobileNo, bookingId, contactNo) => {
        updateSql = "update prayag_booking set driverName='" + driverName + "',driverContact='" + mobileNo + "',driverId='" + driverId + "' where orderId='" + bookingId + "'";

        return new Promise((resolve, reject) => {
            pool.query(updateSql, [], async (error, results) => {
                if (error) {
                    return reject(error);
                }
                let sendSms = await module.exports.sentBookingSmsDriverAssined(bookingId, 'driver');
                return resolve(results);
            });
        });
    },
    isCarAssign: async (bookingId) => {
        sqlGetPay = "select * from prayag_booking where orderId='" + bookingId + "'";

        //let rawResponcedata=JSON.stringify(rawResponce);
        let resData = JSON.stringify({ code: '200', msg: 'success', carId: 0 });
        return new Promise((resolve, reject) => {
            pool.query(sqlGetPay, async (error, result) => {
                if (error) {
                    resData = JSON.stringify({ code: '200', msg: 'success', carId: 0 });
                    return reject(resData);
                } else {

                    carId = result[0]['carId'];
                    resData = JSON.stringify({ code: '200', msg: 'success', carId: carId });
                    return resolve(resData);
                }
            });
        });
    },
    sentBookingSmsDriverAssined: async (orderId, type = 'partner') => {
        let bookingData = await getBookingByOrderId(orderId);

        sqlGetPay = "select * from prayag_booking where orderId='" + orderId + "'";

        //let rawResponcedata=JSON.stringify(rawResponce);
        let resData = JSON.stringify({ code: '200', msg: 'success', data: '' });
        result = bookingData;
        return new Promise(async (resolve, reject) => {
            //pool.query(sqlGetPay,  async(error, result)=>{

            userMobileNo = result[0]['userMobileNo'];
            userName = result[0]['userName'];
            driverName = result[0]['driverName'];
            driverContact = result[0]['driverContact'];
            gadiNo = result[0]['gadiNo'];
            gadiModel = result[0]['gadiModel'];
            agentId = result[0]['agentId'];
            distance = result[0]['distance'];
            actualJourny = result[0]['journyDistance'];
            journyTime = result[0]['journyTime'];
            extraRate = result[0]['extraRate'];
            finalAmount = result[0]['finalAmount'];
            paid = result[0]['paid'];
            pending = finalAmount - paid;
            gadiNo = gadiNo + " " + gadiModel

            pickup = result[0]['pickup'];
            destination = result[0]['destination'];
            let pickupCityName = pickup.split(",")[0];
            let dropCityName = destination.split(",")[0];
            pickupDate = '';
            if (result[0]['pickupDate'] != '') {
                pickupDate = result[0]['pickupDate'];
                pickupDate = moment(pickupDate).format('llll');
            }

            returnDate = '';
            if (result[0]['returnDate'] != '') {
                returnDate = result[0]['returnDate'];
                returnDate = moment(returnDate).format('llll');
            }
            orderId = result[0]['orderId'];
            if (type == 'agent') {
                let agentData = await module.exports.getAgent(agentId);
                agentName = agentData[0]['firstName'];
                agentMobileno = agentData[0]['mobileNo'];
                let msgAdmin = 'TOURPR:: Hi Admin, Agent ' + agentName + ' confirmed booking. Booking ID:' + orderId + '. Customer Name: ' + userName + ' (' + userMobileNo + '), Pickup : ' + pickupCityName + ' Drop : ' + dropCityName + ' starting on ' + pickupDate
                    + ', Total Limit:' + distance + 'KM, Extra Km Charges:Rs ' + extraRate + ', Night driving charges(If Applicable):Rs 250, Total Amount: Rs ' + finalAmount + ', Advance Paid:Rs ' + paid + ', cash to collect Rs' + pending + ' + Extra,Toll,Parking,Other. For any queries call +919821224861. Team BookOurCar';
                console.log("msgAdmin:" + msgAdmin);
                await sendSms('9821224861', 'Admin', msgAdmin, '1507167043883852283');
                await sendSms('7722055354', 'Admin', msgAdmin, '1507167043883852283');

                let msgAgent = 'TOURPR: Dear ' + agentName + ' You have confirmed trip, Booking ID:' + orderId + '. Customer Name: ' + userName + ' (' + userMobileNo + '), Pickup : ,' + pickupCityName + ' Drop : ' + dropCityName + ', starting on ' + pickupDate
                    + ' Total Limit:' + distance + 'KM, Extra Km Charges:Rs ' + extraRate + ' Night driving charges(If Applicable):Rs 250, Total Amount: Rs ' + finalAmount + ', Advance Paid:Rs ' + paid + ', cash to collect Rs' + pending + ' + Extra,Toll,Parking,Other,Please assign Vehical and driver. For any queries call +919821224861. Team BookOurCar';
                console.log("msgAgent:" + msgAgent);
                await sendSms(agentMobileno, 'Partner', msgAgent, '1507167043927269761');
            } else {
                var msgDriver = 'TOURPR: Dear ' + driverName + ', Your upcoming trip. Booking ID:' + orderId + '. Customer Name: ' + userName + ' (' + userMobileNo + '), Pickup : ' + pickupCityName + ', Drop : ' + dropCityName + ', starting on ' + pickupDate
                    + ', Total Limit:' + distance + 'KM, Extra Km Charges:Rs ' + extraRate + ', Night driving charges(If Applicable):Rs 250, Total Amount: Rs ' + finalAmount + ', Advance Paid:Rs ' + paid + ', cash to collect Rs' + pending + ' + Extra,Toll,Parking,Other. For any queries call +919821224861. Team BookOurCar';
                console.log("msgDriver:" + msgDriver);
                await sendSms(driverContact, 'Driver', msgDriver, '1507167043815196732');
                var msgCusotmer = 'TOURPR:: Hi ' + userName + ', Here is driver and car details Driver Name: ' + driverName + ', Contact No : ' + driverContact + ' GadiNo : ' + gadiNo + " Thank You";
                console.log("msgCusotmer:" + msgCusotmer);
                await sendSms(userMobileNo, 'Customer', msgCusotmer, '1507167043796613416');
            }

            // return resolve(resData);
            //});
            resData = JSON.stringify({ code: '200', msg: 'sms sent successfully', orderId: orderId });
            return resolve(resData);
        });
    },


}