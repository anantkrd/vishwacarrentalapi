const{Sequelize,DataTypes,Model}=require('sequelize');
const sequelize=require('../config/database');
const User=require('./user');
class AgentCars extends Model{

}

AgentCars.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    agentId:DataTypes.INTEGER,
    carNo:DataTypes.STRING,
    carModelName:DataTypes.STRING,
    carType:DataTypes.STRING,
    rcBook:DataTypes.TEXT,
    status:DataTypes.ENUM('pending','approved','invalid'),
    isDeleted:DataTypes.ENUM('Y','N'),
    updatedTime:DataTypes.DATE,
    createdTime:DataTypes.DATE
},
{
    sequelize,
    modelName:'AgentCars',
    tableName:'vcr_agent_cars',    
    timestamps:true,
    createdAt:false,
    updatedAt:false
})
//User.hasOne(AgentCars);
AgentCars.belongsTo(User,{
    foreignKey: {
      name: 'agentId'
    }
  });
  
module.exports=AgentCars;