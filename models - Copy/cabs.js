const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');

class Cabs extends Model{

}
Cabs.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    cabType:DataTypes.STRING,
    
    image:DataTypes.STRING,
    images:DataTypes.TEXT,
    ac:DataTypes.CHAR,
    bags:DataTypes.INTEGER,
    capacity:DataTypes.INTEGER,
    cars:DataTypes.STRING,
    note:DataTypes.STRING,
    rate:DataTypes.INTEGER,
    returnTripRate:DataTypes.INTEGER,
    discount:DataTypes.INTEGER,
    extraRate:DataTypes.INTEGER,   
    PerDayKmReturn:DataTypes.INTEGER,
    PerDayKmSingle:DataTypes.INTEGER, 
    isDeleted: DataTypes.ENUM('N','Y'),
    updatedTime: {
        type: DataTypes.DATE
      },
    createdTime: {
        type: DataTypes.DATE
      }
},{
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Cabs', // We need to choose the model name
    tableName:'vcr_cabs',
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
module.exports=Cabs;