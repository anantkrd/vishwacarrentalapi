
const{Sequelize,DataTypes,Model}=require('sequelize');
const sequelize=require('../config/database');

class SmsLog extends Model{

}

SmsLog.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    mobileNo:DataTypes.STRING,
    msg:DataTypes.TEXT,
    isSent:DataTypes.ENUM('Y','N'),
    type:DataTypes.ENUM('OTP','Booking','Payment'),
    userType:DataTypes.ENUM('Customer','Partner','Driver','Admin'),
    status:DataTypes.STRING,
    reData:DataTypes.TEXT,
    isDeleted:DataTypes.ENUM('Y','N'),
    updatedOn:DataTypes.DATE,
    createdOn:DataTypes.DATE
},
{
    sequelize,
    modelName:'SmsLog',
    tableName:'vcr_sms_log',    
    timestamps:true,
    createdAt:false,
    updatedAt:false
})

module.exports=SmsLog;