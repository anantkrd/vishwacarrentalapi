
const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');

class BookingPayment extends Model{

}
BookingPayment.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    bookingId:DataTypes.STRING,
    paymentId:DataTypes.STRING,
    mobileNo:DataTypes.STRING,
    amount:DataTypes.INTEGER,
    rawResponce:DataTypes.TEXT,
    paymentType:DataTypes.ENUM('credit','debit'),
    status:DataTypes.ENUM('pending','completed'),
    isDeleted: DataTypes.ENUM('N','Y'),
    updateTime: DataTypes.DATE,
    createdTime:DataTypes.DATE
},{
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'BookingPayment', // We need to choose the model name
    tableName:'vcr_booking_payment',
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
module.exports=BookingPayment;