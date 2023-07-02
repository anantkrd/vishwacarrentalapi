

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const agentDetaiulsSchema = new mongoose.Schema(
  {
    id:ObjectId,
    agentId:{type: String, required: true,unique:true},    
    adharNo:{type: String,default:''},
    status:{type: String,default:'pending'},
    companyName:{type: String,default:''},
    registrationCopy:{type: String,default:''},
    registrationId:{type: String,default:''},
    adharLink:{type: String,default:''},
    licenseLink:{type: String,default:''},
    rcLink:{type: String,default:''},
    companyVerified:{type: String,default:'N'},
    adharVerified:{type: String,default:'N'},
    licenseVerified:{type: String,default:'N'},
    rcVerified:{type: String,default:'N'},
    isBankAdded:{type: String,default:'N'},
    isDriverAdded:{type: String,default:'N'},
    isCarAdded:{type: String,default:'N'},
    accountStatus:{type: String,default:'pending'},
    officeAddress:{type: String,default:''},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_agent_detials', agentDetaiulsSchema);
