


//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const bookingPaymentSchema = new mongoose.Schema(
  {
    id:ObjectId,
    bookingId:{type: String, required: true},    
    mobileNo:{type: String,default:''},  
    amount:{type: Number,default:0},
    paymentType:{type: String,default:'credit'},
    status:{type: String,default:'pending'},
    rawResponce:{type: String,default:''},
    paymentId:{type: String,default:''},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_booking_payment', bookingPaymentSchema);
