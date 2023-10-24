const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');

class CabTypes extends Model{

}
CabTypes.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    cabType:DataTypes.STRING,
    isDeleted: DataTypes.ENUM('N','Y')
},{
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'CabTypes', // We need to choose the model name
    tableName:'vcr_cab_types',
    timestamps:true,
    createdAt:true,
    updatedAt:true
})
//CabTypes.sequelize.sync();
module.exports=CabTypes;