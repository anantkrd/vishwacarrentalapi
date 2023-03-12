const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');

class SpecialPrices extends Model{
    
}
SpecialPrices.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    cabType:DataTypes.STRING,
    startDate:DataTypes.DATE,
    endDate:DataTypes.DATE,
    weekDay:DataTypes.INTEGER,
    rate:DataTypes.INTEGER,
    returnTripRate:DataTypes.INTEGER,
    extraRate:DataTypes.INTEGER,
    type:DataTypes.ENUM('dateRange','weekday'),
    isDeleted: DataTypes.ENUM('N','Y')
},{
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'SpecialPrices', // We need to choose the model name
    tableName:'vcr_special_prices',
    timestamps:true,
    createdAt:true,
    updatedAt:true
})

//CabTypes.sequelize.sync();
module.exports=SpecialPrices;