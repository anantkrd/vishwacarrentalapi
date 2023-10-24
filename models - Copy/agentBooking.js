const{Sequelize,DataTypes,Model}=require('sequelize');
const sequelize=require('../config/database');

class AgentBooking extends Model{

}

AgentBooking.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    agentId:DataTypes.INTEGER,
    bookingId:DataTypes.STRING,
    agentAmount:DataTypes.INTEGER,
    advance:DataTypes.INTEGER,
    tripAmount:DataTypes.INTEGER,
    userPaid:DataTypes.INTEGER,
    userPending:DataTypes.INTEGER,
    payToAgent:DataTypes.INTEGER,
    paymentId:DataTypes.TEXT,
    payToAgentType:DataTypes.ENUM('debit','credit'),
    status:DataTypes.ENUM('pending','canceled','completed'),
    tripStatus:DataTypes.ENUM('pending','canceled','completed'),
    isDriverAdded:DataTypes.ENUM('N','Y'),
    isCarAdded:DataTypes.ENUM('Y','N'),
    rawResponce:DataTypes.TEXT,
    isDeleted:DataTypes.ENUM('Y','N'),
    updatedTime:DataTypes.DATE,
    createdTime:DataTypes.DATE
},
{
    sequelize,
    modelName:'AgentBooking',
    tableName:'vcr_agent_booking',    
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
module.exports=AgentBooking;