
const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');

class Otp extends Model{

}
Otp.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    mobileNo:DataTypes.STRING,
    otp:DataTypes.INTEGER,
    isExpired:DataTypes.ENUM('Y','N'),
    verified:DataTypes.ENUM('Y','N'),
    attempt:DataTypes.INTEGER,
    isDeleted: DataTypes.ENUM('N','Y'),
    updateTime: DataTypes.DATE,
    createdTime:DataTypes.DATE
},{
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Otp', // We need to choose the model name
    tableName:'vcr_otp',
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
module.exports=Otp;