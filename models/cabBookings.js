

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const cabBookings_Schema = new mongoose.Schema(
  {
    id:ObjectId,
    firstName:{type: String,default:''},
    lastName:{type: String,default:''},
    mobileNo:{type: String,default:''},
    email:{type: String,default:''},
    pickUp:{type: String,default:''},
    destination:{type: String,default:''},
    passengers:{type: String,default:''},
    language:{type: String,default:''},
    totalAmount:{type: Number,default:0},
    advanceAmount:{type: Number,default:0},
    paidAmount:{type: Number,default:0},
    bookingDate:{type: Date},
    status:{type: String,default:'pending'},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_cabBookings', cabBookings_Schema);
