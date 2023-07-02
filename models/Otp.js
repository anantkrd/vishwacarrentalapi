

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const OTPSchema = new mongoose.Schema(
  {
    id:ObjectId,
    mobileNo:{type: String,default:''},
    otp:{type: String,default:''},
    isExpired:{type: String,default:'N'},
    attempt:{type: Number,default:0},
    verified:{type: String,default:'N'},
    
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_otp', OTPSchema);
