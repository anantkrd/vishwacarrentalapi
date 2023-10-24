
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require("../config/database");
const AgentDetials=require('./agentDetials');
class User extends Model{
   
}
User.init({
    // Model attributes are defined here
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING
    },
    mobileNo: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userPassword: {
      type: DataTypes.STRING
    },
    userType: {
      type: DataTypes.ENUM('user','admin','driver','agent'),
      defaultValue:'user'
    },
    idProof: {
      type: DataTypes.STRING
    },
    idNumber: {
      type: DataTypes.STRING
    },
    parentId: {
      type: DataTypes.INTEGER
    },
    profileImage: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('active','inactive','blocked','pending'),
      defaultValue:'pending'
    },
    isDeleted: {
      type: DataTypes.ENUM('Y','N'),
      defaultValue:'N'
    },
    updateTime: {
      type: DataTypes.DATE
    },
    createdTime: {
      type: DataTypes.DATE
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'User', // We need to choose the model name
    tableName:'vcr_users',
    timestamps:true,
    createdAt:false,
    updatedAt:false
});


User.hasOne(AgentDetials,{
  foreignKey: {
    name: 'agentId'
  }
});
/*
AgentDetials.hasOne(User,{
  foreignKey: {
    name: 'agentId'
  }
});*/
module.exports=User;