
const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');

class SearchLog extends Model{

}
SearchLog.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    mobileNo:DataTypes.STRING,
    pickup:DataTypes.STRING,
    destination:DataTypes.STRING,
    city:DataTypes.STRING,
    district:DataTypes.STRING,
    state:DataTypes.STRING,
    pickupDate:DataTypes.DATE,
    returnDate:DataTypes.DATE,
    pickupLat:DataTypes.STRING,
    pickupLong:DataTypes.STRING,
    destinationLat:DataTypes.STRING,
    destinationLong:DataTypes.STRING,
    distance:DataTypes.STRING,
    journyTime:DataTypes.STRING,
    note:DataTypes.STRING,    
    isDeleted: DataTypes.ENUM('N','Y'),
    updatedTime: DataTypes.DATE,
    createdTime:DataTypes.DATE
},{
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'SearchLog', // We need to choose the model name
    tableName:'vcr_search_log',
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
module.exports=SearchLog;