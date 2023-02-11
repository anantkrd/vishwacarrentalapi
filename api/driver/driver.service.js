const pool=require('../../config/database');
const{getBookingByOrderId,sendSms}=require('../booking/booking.service');
var moment = require('moment')
module.exports={
    getMyBookings:async(driverId,pageId)=>{
        let start=((pageId-1)*10);
        let perPage=10;
        sqlcheck="SELECT prayag_booking.*,(select mobileNo from prayag_users where id=prayag_booking.userId ) as mobileNo FROM `prayag_booking` WHERE isDeleted='N' and (status='confirm' || status='started') and driverId=? order by id desc limit ?,?";
        
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[driverId,start,perPage],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },  
    getbookingReport:async(driverId,pageId)=>{
        let start=((pageId-1)*10);
        let perPage=10;
        sqlcheck="SELECT * FROM `prayag_booking` WHERE isDeleted='N' and driverId=? order by id desc limit ?,?";
        
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[driverId,start,perPage],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },  
    startTrip:async(userId,bookingId,startKm)=>{
        let dateNow=moment().format('YYYY-MM-DD hh:mm:ss');
        //console.log("startKm=========="+startKm+"***bookingId*"+bookingId);
        sqlcheck="update `prayag_booking` set startKm=?,journyStartTime=?,status='started',journyStatus='start' WHERE orderId=?";   
        //console.log("update `prayag_booking` set startKm='"+startKm+"',journyStartTime='"+dateNow+"',journyStatus='start' WHERE orderId="+bookingId)     
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[startKm,dateNow,bookingId],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },  
    endTrip:async(userId,bookingId,endKm)=>{
        let dateNow=moment().format('YYYY-MM-DD hh:mm:ss');
        sqlcheck="SELECT * FROM `prayag_booking` WHERE isDeleted='N' and orderId=?";        
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[bookingId],  (error, results)=>{
                if(error){
                    return reject(error);
                }else{
                    //console.log("********"+JSON.stringify(results));
                    let startKm=results[0]['startKm'];
                    let rate=results[0]['rate'];
                    let extraRate=results[0]['extraRate'];
                    let journyDistance=endKm-startKm;
                    let distance=results[0]['distance'];
                    let extraKm=0;
                    let extraAmount=0;
                    if(journyDistance>distance)
                    {
                        extraKm=journyDistance-distance;
                    }
                    extraAmount=extraRate*extraKm;
                    sqlcheck="update `prayag_booking` set endKm=?,journyEndTime=?,journyStatus='completed',extraAmount=?,extraRate=?,journyDistance=? WHERE orderId=?";   
                    //console.log("update `prayag_booking` set endKm='"+endKm+"',journyEndTime='"+dateNow+"',journyStatus='completed',extraAmount=?,extraRate=?,journyDistance=? WHERE orderId="+bookingId)     
                    new Promise(async(resolve, reject)=>{
                        pool.query(sqlcheck,[endKm,dateNow,extraAmount,extraRate,journyDistance,bookingId],  async(error, resultsup)=>{
                           if(error){

                           }else{
                            sms=await module.exports.tripCompletedsms(bookingId);
                           } 
                        });
                    });
                }
                return resolve(results);
            });
        });
    },    
    completeTrip:async(userId,bookingId)=>{
        let dateNow=moment().format('YYYY-MM-DD hh:mm:ss');
        sqlcheck="SELECT * FROM `prayag_booking` WHERE isDeleted='N' and journyStatus='completed' and status='started' and orderId=?";        
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[bookingId],  (error, results)=>{
                if(error){
                    return reject(error);
                }else{
                    //console.log(JSON.stringify(results));
                    let extraAmount=results[0]['extraAmount'];
                    let pending=results[0]['pending']+results[0]['extraAmount'];
                    let finalAmount=results[0]['finalAmount']+extraAmount;
                    let cashAmount=pending;
                    sqlcheck="update `prayag_booking` set status='completed',pending='0',finalAmount=?,paid=?,extraAmount=?,cashAmount=? WHERE orderId=?";   
                    //console.log("update `prayag_booking` set status='completed' WHERE orderId="+bookingId)     
                    new Promise((resolve, reject)=>{
                        pool.query(sqlcheck,[finalAmount,finalAmount,extraAmount,cashAmount,bookingId],  (error, resultsup)=>{
                            
                        });
                    });
                }                
                return resolve(results);
            });
        });
        sqlcheck="update `prayag_booking` set status='completed' WHERE orderId=?";   
        //console.log("update `prayag_booking` set status='completed' WHERE orderId="+bookingId)     
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[bookingId],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },  
    
    getPaymentReport:async(driverId,pageId)=>{
        let start=((pageId-1)*10);
        let perPage=10;
        sqlcheck="SELECT * FROM `prayag_booking` WHERE isDeleted='N' and driverId=? order by id desc limit ?,?";        
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[driverId,start,perPage],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },    
    
    tripCompletedsms:async(orderId,type='customer')=>{
        let bookingData=await getBookingByOrderId(orderId);
        
        sqlGetPay="select * from prayag_booking where orderId='"+orderId+"'";
        
        //let rawResponcedata=JSON.stringify(rawResponce);
        let resData= JSON.stringify({code:'200',msg:'success',data:''});
        result=bookingData;
        return new Promise(async(resolve, reject)=>{
            //pool.query(sqlGetPay,  async(error, result)=>{
                
                userMobileNo=result[0]['userMobileNo'];
                userName=result[0]['userName'];
                driverName=result[0]['driverName'];
                driverContact=result[0]['driverContact'];
                gadiNo=result[0]['gadiNo'];
                gadiModel=result[0]['gadiModel'];
                agentId=result[0]['agentId'];
                distance=result[0]['distance'];
                actualJourny=result[0]['journyDistance'];
                journyTime=result[0]['journyTime'];
                extraRate=result[0]['extraRate'];
                finalAmount=result[0]['finalAmount'];
                extraAmount=result[0]['extraAmount'];
                
                paid=result[0]['paid'];
                pending=finalAmount-paid;
                gadiNo=gadiNo+" "+gadiModel
                
                pickup=result[0]['pickup'];
                destination=result[0]['destination'];
                let pickupCityName=pickup.split(",")[0];
                let dropCityName=destination.split(",")[0];
                pickupDate='';
                if(result[0]['pickupDate']!=''){
                    pickupDate=result[0]['pickupDate'];
                    pickupDate=moment(pickupDate).format('llll');
                }
                
                returnDate='';
                if(result[0]['returnDate']!=''){
                    returnDate=result[0]['returnDate'];
                    returnDate=moment(returnDate).format('llll');
                }
                let extraKm=0;
                if(actualJourny>distance)
                {
                    extraKm=actualJourny-distance;
                }
                orderId=result[0]['orderId'];



                var msgDriver='TRVLPR: Dear '+driverName+', You have ended trip. Trip Booking ID:'+orderId+'. Customer Name: '+userName+' ('+userMobileNo+'),  Total journey:'+actualJourny+'KM, Extra Km:'+extraKm+' Extra charges:'+extraAmount+', Night driving charges(If Applicable):Rs 250, Total Amount: Rs '+finalAmount+', Advance Paid:Rs '+paid+', cash to collect Rs'+pending+' + Night charges, Toll, Parking, Other. For any queries call +919821224861. Team BookOurCar';
                    console.log("msgDriver:"+msgDriver);
                    await sendSms(driverContact,'Driver',msgDriver,'1507167044060915050');
                    var msgCusotmer='TOURPR:Dear '+userName+', Your trip has been ended.  Your trip details, Total journey:'+actualJourny+'KM, Extra Km:'+extraKm+' Extra charges:'+extraAmount+', Your final payment amount Rs '+finalAmount+', Advance Paid:Rs '+paid+', Please pay Rs'+pending+' + Night charges Rs.250,Toll,Parking (if Applicable) to '+driverName+' to completed trip Thank You Team BookOurCar';
                    console.log("msgCusotmer:"+msgCusotmer);                    
                    await sendSms(userMobileNo,'Customer',msgCusotmer,'1507167044075062761');
                
               // return resolve(resData);
            //});
            resData= JSON.stringify({code:'200',msg:'sms sent successfully',orderId:orderId});
            return resolve(resData);
        });
    }
    
}