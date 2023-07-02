

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const bookingCancelSchema = new mongoose.Schema(
  {
    id:ObjectId,
    bookingId:{type: Number,default:0},
    orderId:{type: String,default:''},
    canceledBy:{type: String,default:'customer'},
    userId:{type: String,default:0},
    returnAmount:{type: Number,default:0},
    reason:{type: String,default:''},
    returnStatus:{type: String,default:'pending'},
    
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_canceled_booking', bookingCancelSchema);

