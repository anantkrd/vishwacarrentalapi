

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const logSchema = new mongoose.Schema(
  {
    id:ObjectId,
    mobileNo:{type: String,default:''},
    pickup:{type: String,default:''},
    destination:{type: String,default:''},
    city:{type: String,default:''},
    district:{type: String,default:''},
    state:{type: String,default:''},
    pickupDate:{type: Date},
    returnDate:{type: Date},
    pickupLat:{type: String,default:''},
    pickupLong:{type: String,default:''},
    destinationLat:{type: String,default:''},
    destinationLong:{type: String,default:''},
    distance:{type: String,default:''},
    journyTime:{type: String,default:''},
    note:{type: String,default:''},    
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);
logSchema.index({createdAt: 1},{expireAfterSeconds: 2592000});
module.exports = mongoose.model('vcr_search_log', logSchema);
//2592000