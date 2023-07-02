

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const agentCarsSchema = new mongoose.Schema(
  {
    id:ObjectId,
    agentId:{type: String, required: true},    
    carNo:{type: String,default:''},
    status:{type: String,default:'pending'},
    carModelName:{type: String,default:''},
    carType:{type: String,default:''},
    rcBook:{type: String,default:''},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_agent_cars', agentCarsSchema);
