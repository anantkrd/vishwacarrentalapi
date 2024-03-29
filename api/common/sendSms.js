const moment = require('moment');
const User = require('../../models/user');
const Otp = require('../../models/Otp');
const Booking = require('../../models/booking');
const Cabs = require('../../models/cabs');
const SearchLog = require('../../models/searchLog');
const CanceledBooking = require('../../models/canceledBooking');
const AgentBooking = require('../../models/agentBooking');


const Surge = require('../../models/surge');
const smsLog = require("../../models/smsLog");
var request = require('request');
module.exports = {
    sentAgentTripConfirmation: async (orderId, type = 'partner') => {
        try {
            bookingData = await Booking.findOne( { orderId: orderId, isDeleted: 'N'});
            if (bookingData == null) {
                console.log("agent not found");
                //responce=JSON.stringify({code:'400',message:"something went wrong",data:''});
                //res.status(400).send(responce);
            } else {
                userMobileNo = bookingData['userMobileNo'];
                userName = bookingData['userName'];
                driverName = bookingData['driverName'];
                driverContact = bookingData['driverContact'];
                gadiNo = bookingData['gadiNo'];
                gadiModel = bookingData['gadiModel'];
                agentId = bookingData['agentId'];
                distance = bookingData['distance'];
                actualJourny = bookingData['journyDistance'];
                journyTime = bookingData['journyTime'];
                extraRate = bookingData['extraRate'];
                finalAmount = bookingData['finalAmount'];
                paid = bookingData['paid'];
                pending = finalAmount - paid;
                gadiNo = gadiNo + " " + gadiModel

                pickup = bookingData['pickup'];
                destination = bookingData['destination'];
                let pickupCityName = pickup.split(",")[0];
                let dropCityName = destination.split(",")[0];
                pickupDate = '';
                if (bookingData['pickupDate'] != '') {
                    pickupDate = bookingData['pickupDate'];
                    pickupDate = moment(pickupDate).format('llll');
                }

                returnDate = '';
                if (bookingData['returnDate'] != '') {
                    returnDate = bookingData['returnDate'];
                    returnDate = moment(returnDate).format('llll');
                }
                orderId = bookingData['orderId'];
                if (type == 'agent') {

                    agentData = await User.findOne({ userId: agentId });
                    if (agentData == null) {
                        console.log("agent not fount");
                    }
                    agentName = agentData['firstName'];
                    agentMobileno = agentData['mobileNo'];
                    let msgAdmin = 'Hi Admin, Agent ' + agentName + ' confirmed booking. Booking ID:' + orderId + '. Customer Name: ' + userName + ' (' + userMobileNo + '), Pickup : ' + pickupCityName + ' Drop : ' + dropCityName + ' starting on ' + pickupDate
                        + ', Total Limit:' + distance + 'KM, Extra Km Charges:Rs ' + extraRate + ', Night driving charges(If Applicable):Rs 250, Total Amount: Rs ' + finalAmount + ', Advance Paid:Rs ' + paid + ', cash to collect Rs' + pending + ' + Extra,Toll,Parking,Other. For any queries call +917710054367. Vishwajeet Tours and Travels';
                    console.log("msgAdmin:" + msgAdmin);
                    let adminMobileVishwa=7710054367;
                    await module.exports.sendSms(adminMobileVishwa, 'Admin', msgAdmin, '1407169488798105377');

                    let msgAgent = 'Dear ' + agentName + ' You have confirmed trip, Booking ID:' + orderId + '. Customer Name: ' + userName + ' (' + userMobileNo + '), Pickup : ,' + pickupCityName + ' Drop : ' + dropCityName + ', starting on ' + pickupDate
                        + ' Total Limit:' + distance + 'KM, Extra Km Charges:Rs ' + extraRate + ' Night driving charges(If Applicable):Rs 250, Total Amount: Rs ' + finalAmount + ', Advance Paid:Rs ' + paid + ', cash to collect Rs' + pending + ' + Extra,Toll,Parking,Other,Please assign Vehical and driver. For any queries call +917710054367. Vishwajeet Tours and Travels';
                    console.log("msgAgent:" + msgAgent);
                    await module.exports.sendSms(agentMobileno, 'Partner', msgAgent, '1407169488756864839');
                } else {
                    var msgDriver = 'Dear ' + driverName + ', Your upcoming trip. Booking ID:' + orderId + '. Customer Name: ' + userName + ' (' + userMobileNo + '), Pickup : ' + pickupCityName + ', Drop : ' + dropCityName + ', starting on ' + pickupDate
                        + ', Total Limit:' + distance + 'KM, Extra Km Charges:Rs ' + extraRate + ', Night driving charges(If Applicable):Rs 250, Total Amount: Rs ' + finalAmount + ', Advance Paid:Rs ' + paid + ', cash to collect Rs' + pending + ' + Extra,Toll,Parking,Other. For any queries call +917710054367. Vishwajeet Tours and Travels';
                    console.log("msgDriver:" + msgDriver);
                    await module.exports.sendSms(driverContact, 'Driver', msgDriver, '1407169488778197493');
                    var msgCusotmer = 'TOURPR:: Hi ' + userName + ', Here is driver and car details Driver Name: ' + driverName + ', Contact No : ' + driverContact + ' GadiNo : ' + gadiNo + " Thank You Vishwajeet Tours and Travels";
                    console.log("msgCusotmer:" + msgCusotmer);
                    await module.exports.sendSms(userMobileNo, 'Customer', msgCusotmer, '1407169488784331574');
                }
                console.log("smsm sent successfully");
            }
        } catch (e) {
            console.log(e)

        }

    },
    tripCompletedsms: async (orderId, type = 'customer') => {
        
        bookingObj = await Booking.findOne({orderId: orderId});
        if (bookingObj == null) {
            console.log("Something went wrong while sending sms");
        } else {
            userMobileNo = bookingObj['userMobileNo'];
            userName = bookingObj['userName'];
            driverName = bookingObj['driverName'];
            driverContact = bookingObj['driverContact'];
            gadiNo = bookingObj['gadiNo'];
            gadiModel = bookingObj['gadiModel'];
            agentId = bookingObj['agentId'];
            distance = bookingObj['distance'];
            actualJourny = bookingObj['journyDistance'];
            journyTime = bookingObj['journyTime'];
            extraRate = bookingObj['extraRate'];
            finalAmount = bookingObj['finalAmount'];
            extraAmount = bookingObj['extraAmount'];

            paid = bookingObj['paid'];
            pending = finalAmount - paid;
            gadiNo = gadiNo + " " + gadiModel

            pickup = bookingObj['pickup'];
            destination = bookingObj['destination'];
            let pickupCityName = pickup.split(",")[0];
            let dropCityName = destination.split(",")[0];
            pickupDate = '';
            if (bookingObj['pickupDate'] != '') {
                pickupDate = bookingObj['pickupDate'];
                pickupDate = moment(pickupDate).format('llll');
            }
            returnDate = '';
            if (bookingObj['returnDate'] != '') {
                returnDate = bookingObj['returnDate'];
                returnDate = moment(returnDate).format('llll');
            }
            let extraKm = 0;
            if (actualJourny > distance) {
                extraKm = actualJourny - distance;
            }
            orderId = bookingObj['orderId'];
            var msgDriver = 'Dear ' + driverName + ', You have ended trip. Trip Booking ID:' + orderId + '. Customer Name: ' + userName + ' (' + userMobileNo + '),  Total journey:' + actualJourny + 'KM, Extra Km:' + extraKm + ' Extra charges:' + extraAmount + ', Night driving charges(If Applicable):Rs 250, Total Amount: Rs ' + finalAmount + ', Advance Paid:Rs ' + paid + ', cash to collect Rs' + pending + ' + Night charges, Toll, Parking, Other. For any queries call +917710054367. Vishwajeet Tours and Travels';
            console.log("msgDriver:" + msgDriver);
            await module.exports.sendSms(driverContact, 'Driver', msgDriver, '1407169488732567205');
            var msgCusotmer = 'Dear ' + userName + ', Your trip has been ended.  Your trip details, Total journey:' + actualJourny + 'KM, Extra Km:' + extraKm + ' Extra charges:' + extraAmount + ', Your final payment amount Rs ' + finalAmount + ', Advance Paid:Rs ' + paid + ', Please pay Rs' + pending + ' + Night charges Rs.250,Toll,Parking (if Applicable) to ' + driverName + ' to completed trip Thank You Vishwajeet Tours and Travels';
            console.log("msgCusotmer:" + msgCusotmer);
            await module.exports.sendSms(userMobileNo, 'Customer', msgCusotmer, '1407169471657968604');

        }
    },
    sentBookingSmsToCustomer:async(orderId,type='Customer')=>{
        try{
            bookingObj = await Booking.findOne({payment_orderId: orderId});
            if (bookingObj == null && (orderId!="" || orderId!==null)) {
                console.log("Something went wrong while sending sms");
            } else {
                userMobileNo=bookingObj['userMobileNo'];
                userName=bookingObj['userName'];
                driverName=bookingObj['driverName'];
                driverContact=bookingObj['driverContact'];
                gadiNo=bookingObj['gadiNo'];
                gadiModel=bookingObj['gadiModel'];
                agentId=bookingObj['agentId'];
                distance=bookingObj['distance'];
                actualJourny=bookingObj['journyDistance'];
                journyTime=bookingObj['journyTime'];
                extraRate=bookingObj['extraRate'];
                finalAmount=bookingObj['finalAmount'];
                paid=bookingObj['paid'];
                pending=finalAmount-paid;
                gadiNo=gadiNo+" "+gadiModel
                
                pickup=bookingObj['pickup'];
                destination=bookingObj['destination'];
                let pickupCityName=pickup.split(",")[0];
                let dropCityName=destination.split(",")[0];
                pickupDate='';
                if(bookingObj['pickupDate']!=''){
                    pickupDate=bookingObj['pickupDate'];
                    pickupDate=moment(pickupDate).format('llll');
                }
                
                returnDate='';
                if(bookingObj['returnDate']!=''){
                    returnDate=bookingObj['returnDate'];
                    returnDate=moment(returnDate).format('llll');
                }
                orderId=bookingObj['orderId'];
                let adminMobile=7722055354;
                let adminMobileVishwa=7710054367;
                var msgDriver='Hi Admin, We have new booking. Customer Name: '+userName+', Pickup : '+pickupCityName+' Drop : '+dropCityName+' On '+pickupDate+" PRN : "+orderId+" Vishwajeet Tours and Travels";
                await module.exports.sendSms(adminMobile,'Admin',msgDriver,'1407169488739796862');
                await module.exports.sendSms(adminMobileVishwa,'Admin',msgDriver,'1407169488739796862');
                //var msgCusotmer='TOURPR: Hi '+userName+' Thank you for booking with us, Your trip details Pickup : '+pickupCityName+', Drop : '+dropCityName+' On '+pickupDate+' PRN : '+orderId+' www.bookourcar.com';
                var msgCusotmer='Hi '+userName+' Thank you for booking with us, here is your trip details Pickup : '+pickupCityName+', Drop : '+dropCityName+' On '+pickupDate+' PRN : '+orderId+' Vishwajeet Tours and Travels'
                await module.exports.sendSms(userMobileNo,'Customer',msgCusotmer,'1407169488746757454');  
                console.log("Sms sent"); 
            }
        }catch(e){
            console.log("ERror:"+e);
        }
        
    },
    logSerchedSmsm:async(custMobile,pickupCityName,dropCityName,journeyDate)=>{
        
        try{
            let adminMobileVishwa=7710054367;
            msgAdmin="Dear Admin, Customer "+custMobile+" Searched for Trip From "+pickupCityName+" To "+dropCityName+" On Date "+journeyDate+" Vishwajeet Tours and Travels";
            await module.exports.sendSms(adminMobileVishwa, 'Admin', msgAdmin, '1407169457835885962');
            await module.exports.sendSms('7722055354', 'Admin', msgAdmin, '1407169457835885962');
             
        }catch(e){
            console.log("ERror:"+e);
        }
    },
    vishajeetRequestSmsm:async(custMobile,pickupCityName,dropCityName,journeyDate)=>{
        
        try{
            let adminMobileVishwa=7688811106;
            msgAdmin="Dear Admin, Customer "+custMobile+" Searched for Trip From "+pickupCityName+" To "+dropCityName+" On Date "+journeyDate+" Vishwajeet Tours and Travels";
            await module.exports.sendSms(adminMobileVishwa, 'Admin', msgAdmin, '1407169457835885962');
            //await module.exports.sendSms('7722055354', 'Admin', msgAdmin, '1407169457835885962');
             
        }catch(e){
            console.log("ERror:"+e);
        }
    },
    callBackRequest:async(callbackNumber)=>{        
        try{
            let adminMobileVishwa=7710054367;
            msgAdmin="Dear Admin you have callback request from customer on "+callbackNumber+" Vishwajeet Tours and Travels" ;
            await module.exports.sendSms(adminMobileVishwa, 'Admin', msgAdmin, '1407169488837445456');             
        }catch(e){
            console.log("ERror:"+e);
        }
    },    
    callBackRequestVishwajeet:async(callbackNumber)=>{        
        try{
            let adminMobileVishwa=7688811106;
            msgAdmin="Dear Admin you have callback request from customer on "+callbackNumber+" Vishwajeet Tours and Travels" ;
            await module.exports.sendSms(adminMobileVishwa, 'Admin', msgAdmin, '1407169488837445456');             
        }catch(e){
            console.log("ERror:"+e);
        }
    },
    sendSms: async (mobileNo, type, message, templateId = '001') => {
        try {
            var msg = message;
            let smsUserID = process.env.smsId;
            let smsPassword = process.env.smsPassword;
            //let url = "http://servermsg.com/api/SmsApi/SendSingleApi?UserID=" + smsUserID + "&Password=" + smsPassword + "&SenderID=TRVLPR&Phno=" + mobileNo + "&Msg=" + encodeURIComponent(msg) + "&EntityID=1501482300000054811&TemplateID=" + templateId;
            let url = "https://www.txtguru.in/imobile/api.php?username=vishwacarrental&password=31541032&source=VISCAB&dmobile="+mobileNo+"&dlttempid="+templateId+"&message="+ encodeURIComponent(msg)
            //let resOtp=await module.exports.expireOtp(mobileNo);
            console.log("url:"+url);
            await request.get({ url: url }, async function (error, response, body) {
                let status = response.statusCode;
                reData = error;
                if (!error && response.statusCode == 200) {
                    console.log("==otp sent==");
                    reData = JSON.stringify(response.body);
                }
                insterSmsLog = await smsLog.create({
                    mobileNo: mobileNo,
                    msg: message,
                    isSent: 'Y',
                    type: 'Booking',
                    userType: type,
                    status: status,
                    reData: reData
                });
            });
        } catch (e) {
            console.log(e)
            throw "something went wrong while sending sms";
        }
    }
}