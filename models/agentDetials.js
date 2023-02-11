
const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');
const User=require('./user');
class AgentDetials extends Model{

}
AgentDetials.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    agentId:DataTypes.INTEGER,
    adharNo:DataTypes.STRING,
    companyName:DataTypes.STRING,
    registrationCopy:DataTypes.TEXT,

    registrationId:DataTypes.STRING,
    adharLink:DataTypes.TEXT,
    licenseLink:DataTypes.TEXT,
    rcLink:DataTypes.TEXT,
    companyVerified:DataTypes.ENUM('N','Y'),
    adharVerified:DataTypes.ENUM('N','Y'),
    licenseVerified:DataTypes.ENUM('N','Y'),
    rcVerified:DataTypes.ENUM('N','Y'),
    isBankAdded:DataTypes.ENUM('N','Y'),
    isDriverAdded:DataTypes.ENUM('N','Y'),
    isCarAdded:DataTypes.ENUM('N','Y'),
    accountStatus:DataTypes.ENUM('pending','active','inactive'),
    officeAddress:DataTypes.STRING, 
    isDeleted: DataTypes.ENUM('N','Y'),
    updatedTime: DataTypes.DATE,
    createdTime:DataTypes.DATE
},{
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'AgentDetials', // We need to choose the model name
    tableName:'vcr_agent_detials',
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
  
  /*AgentDetials.belongsTo(User,{
    foreignKey: {
      name: 'agentId'
    }
  });*/
module.exports=AgentDetials;