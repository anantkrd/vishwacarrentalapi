
const{Sequelize,DataTypes,Model}=require('sequelize');
const sequelize=require('../config/database');

class Surge extends Model{

}

Surge.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    city:DataTypes.STRING,
    location:DataTypes.STRING,
    surge:DataTypes.STRING,    
    isDeleted:DataTypes.ENUM('Y','N'),
    updatedTime:DataTypes.DATE,
    createdTime:DataTypes.DATE
},
{
    sequelize,
    modelName:'Surge',
    tableName:'vcr_surge',    
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
module.exports=Surge;