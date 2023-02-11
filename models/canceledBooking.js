const{Sequelize,DataTypes,Model}=require('sequelize');
const sequelize=require('../config/database');

class CanceledBooking extends Model{

}

CanceledBooking.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    bookingId:DataTypes.INTEGER,
    orderId:DataTypes.STRING,
    canceledBy:DataTypes.ENUM('customer','admin'),
    userId:DataTypes.INTEGER,
    returnAmount:DataTypes.INTEGER,
    reason:DataTypes.STRING,
    returnStatus:DataTypes.ENUM('pending','approved','inprocess','completed','rejected'),
    updatedTime:DataTypes.DATE,
    createdTime:DataTypes.DATE
},
{
    sequelize,
    modelName:'CanceledBooking',
    tableName:'vcr_canceled_booking',    
    timestamps:true,
    createdAt:false,
    updatedAt:false
})

module.exports=CanceledBooking;