


//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const smsLogSchema = new mongoose.Schema(
  {
    id:ObjectId,
    mobileNo:{type: String,default:''},
    msg:{type: String,default:''},
    isSent:{type: String,default:'Y'},
    type:{type: String,default:'OTP'},
    userType:{type: String,default:'Customer'},
    status:{type: String,default:''},
    reData:{type: String,default:''},
    
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_sms_log', smsLogSchema);

