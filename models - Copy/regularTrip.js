
const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');

class RegularTrip extends Model{

}
RegularTrip.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    cabId:DataTypes.INTEGER,
    pickup:DataTypes.STRING,
    destination:DataTypes.STRING,
    pickupLat:DataTypes.STRING,
    pickupLong:DataTypes.STRING,
    destinationLat:DataTypes.STRING,
    destinationLong:DataTypes.STRING,
    distance:DataTypes.STRING,
    journyTime:DataTypes.STRING,
    rate:DataTypes.INTEGER,
    amount:DataTypes.INTEGER,
    discount:DataTypes.INTEGER,
    finalAmount:DataTypes.INTEGER,
    isDeleted: DataTypes.ENUM('N','Y'),
    updateTime: DataTypes.DATE,
    createdTime:DataTypes.DATE
},{
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'RegularTrip', // We need to choose the model name
    tableName:'vcr_regular_trip',
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
module.exports=RegularTrip;