const pool=require('../../config/database');
module.exports={
       
    getBookingsAdminHome:async(pageId,callBack)=>{
        let start=((pageId-1)*5);
        let perPage=5;
        sqlcheck="SELECT booking.*,cabs.cabType,cabs.ac,cabs.bags,cabs.capacity,cabs.cars,cabs.note,(select mobileNo from prayag_users where id=booking.userId ) as mobileNo FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and booking.status='waiting' order by booking.id desc limit ?,?";
        sqlcheckCount="SELECT count(booking.id) as rowCount FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and booking.status='waiting' order by booking.id desc";
        let resCount=await module.exports.getPageCount(sqlcheckCount,perPage);

        console.log("resCount=="+JSON.stringify(resCount));
        let rowCount=resCount[0]['rowCount'];        
        totalPage=rowCount/perPage;
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[start,perPage],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                //results['rowCount']=rowCount;
                results=JSON.stringify({results:results,rowCount:rowCount,totalPage:totalPage});
                return resolve(results);
            });
        })
    },
    getBookingsForAgent:async(pageId)=>{
        let start=((pageId-1)*10);
        let perPage=10;
        sqlcheck="SELECT booking.*,cabs.cabType,cabs.ac,cabs.bags,cabs.capacity,cabs.cars,cabs.note,(select mobileNo from prayag_users where id=booking.userId ) as mobileNo FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and agentPrice>0 and agentId=0 and booking.status='waiting' order by booking.id desc limit ?,?";
        sqlcheckCount="SELECT count(booking.id) rowCount FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and agentPrice>0 and agentId=0 and booking.status='waiting' order by booking.id desc";
        let resCount=await module.exports.getPageCount(sqlcheckCount,perPage);

        console.log("resCount=="+JSON.stringify(resCount));
        let rowCount=resCount[0]['rowCount'];        
        totalPage=rowCount/perPage;
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[start,perPage],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                results=JSON.stringify({results:results,rowCount:rowCount,totalPage:totalPage});
                return resolve(results);
            });
        });
    },   
    updateAgentAmount:async(amount,bookingId)=>{
        
        sqlcheck="update prayag_booking set agentPrice=? where orderId=?";
        console.log("update prayag_booking set agentPrice="+amount+" where orderId="+bookingId)
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[amount,bookingId],  (error, results)=>{
                if(error){
                    return reject({code:500,msg:"error while adding agent amount"});
                }
                return resolve({code:200,msg:"Record updated"});
            });
        })
    }, 
    getCompletedBookings:async(pageId)=>{
        let start=((pageId-1)*10);
        let perPage=10;
        sqlcheck="SELECT booking.*,cabs.cabType,cabs.ac,cabs.bags,cabs.capacity,cabs.cars,cabs.note,(select mobileNo from prayag_users where id=booking.userId ) as mobileNo FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and driverId>0  and agentId>0 and booking.status='completed' order by booking.id desc limit ?,?";
        sqlcheckCount="SELECT count(*) as rowCount FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and driverId>0  and agentId>0 and booking.status='completed' order by booking.id desc";
        let resCount=await module.exports.getPageCount(sqlcheckCount,perPage);

        console.log("resCount=="+resCount);
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[start,perPage],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    }, 
    getReadyBooking:async(pageId)=>{
        let start=((pageId-1)*10);
        let perPage=10;
        sqlcheck="SELECT booking.*,cabs.cabType,cabs.ac,cabs.bags,cabs.capacity,cabs.cars,cabs.note,(select mobileNo from prayag_users where id=booking.userId ) as mobileNo FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and driverId>0  and carId>0 and booking.status='confirm' order by booking.id desc limit ?,?";
        
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[start,perPage],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },  
    
    getConfirmBooking:async(pageId)=>{
        let start=((pageId-1)*10);
        let perPage=10;
        sqlcheck="SELECT booking.*,cabs.cabType,cabs.ac,cabs.bags,cabs.capacity,cabs.cars,cabs.note,(select mobileNo from prayag_users where id=booking.userId ) as mobileNo FROM `prayag_booking` booking inner JOIN prayag_cabs cabs ON booking.cabId=cabs.id WHERE booking.isDeleted='N' and (driverId=0 or carId=0)  and agentId>0 and booking.status='confirm' order by booking.id desc limit ?,?";
        
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,[start,perPage],  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },   
    getPageCount:async(sqlcheck,pageCount)=>{
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,  (error, results)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    getAgents:async(userId,callBack)=>{
       
        sqlcheck="SELECT * FROM prayag_users where userType='agent' and isDeleted='N' order by id desc";
        
        return new Promise((resolve, reject)=>{
            pool.query(sqlcheck,  (error, results)=>{
                if(error){
                    return reject(error);
                }
                //results['rowCount']=rowCount;
               // results=JSON.stringify({results:results});
                return resolve(results);
            });
        })
    },
    assignAggent:async(agentId,bookingId)=>{
        sqlGetPay="select * from prayag_booking where orderId='"+bookingId+"'";
        let resData= JSON.stringify({code:'200',msg:'success',data:''});
        return new Promise((resolve, reject)=>{
            pool.query(sqlGetPay,  (error, result)=>{
                
                if(error){
                    return reject(error);
                }
                bookingAmount=result[0]['finalAmount'];
                //agentId=result[0]['agentId'];
                pendingAmount=result[0]['bookingId'];
                //finalAmount=result[0]['finalAmount'];
                tripAmount=bookingAmount;
                userPaid=result[0]['paid'];
                pendingAmount=tripAmount-userPaid;
                
                advance=0;
                paymentid='';
                sql="INSERT INTO `prayag_agent_booking`(`agentId`, `bookingId`, `agentAmount`, `advance`,`tripAmount`,`userPaid`, `userPending`, `payToAgent`, `payToAgentType`, `paymentId`,`status`) VALUES ('"+agentId+"','"+bookingId+"','"+bookingAmount+"','"+advance+"','"+tripAmount+"','"+userPaid+"','"+pendingAmount+"','0','debit','"+paymentid+"','completed')";
                pool.query(sql,  (error, elements)=>{     
                    if(error){
                        return reject(error);
                    }           
                });
                console.log("Sql==="+sql);
                sqlUpdateBooking="UPDATE `prayag_booking` SET `agentId`='"+agentId+"',agentPaid='0',`status`='confirm' WHERE orderId='"+bookingId+"'";
                console.log("sqlUpdateBooking==="+sqlUpdateBooking);
                pool.query(sqlUpdateBooking,  (error, elements)=>{
                    if(error){
                        return reject(error);
                    }
                });
                
                return resolve(result);
            });
        });
    },
    addSurge:async(userId,city,surgeData)=>{
        try{
            sqlInsert="INSERT INTO `prayag_surge`(`city`, `surge`, `isDeleted`) VALUES(?,?,'N')";
            return new Promise((resolve, reject)=>{
                pool.query(sqlInsert,[city,surgeData],  (error, results)=>{
                    if(error){
                        return reject(error);
                    }
                    //results['rowCount']=rowCount;
                    results=JSON.stringify({results:results});
                    return resolve(results);
                });
            })
        }catch(e){
            throw "Error while adding surge";
        }
    },    
    getSurge:async(userId)=>{
        try{
            sqlGet="select * from `prayag_surge` where isDeleted='N' order by id desc";
            return new Promise((resolve, reject)=>{
                pool.query(sqlGet,  (error, results)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                });
            })
        }catch(e){
            throw "Error while adding surge";
        }
    },
    addCab:async(userId,data)=>{
        try{
            console.log("data:"+JSON.stringify(data));
            /*sqlInsert="INSERT INTO `prayag_surge`(`city`, `surge`, `isDeleted`) VALUES(?,?,'N')";
            return new Promise((resolve, reject)=>{
                pool.query(sqlInsert,[city,surgeData],  (error, results)=>{
                    if(error){
                        return reject(error);
                    }
                    //results['rowCount']=rowCount;
                    results=JSON.stringify({results:results});
                    return resolve(results);
                });
            })*/
        }catch(e){
            throw "Error while adding cab";
        }
    },   
    getCab:async(userId)=>{
        try{
            sqlGet="select * from `prayag_cabs` where isDeleted='N' order by id desc";
            return new Promise((resolve, reject)=>{
                pool.query(sqlGet,  (error, results)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                });
            })
        }catch(e){
            throw "Error while adding surge";
        }
    },


}