

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const cabsSchema = new mongoose.Schema(
  {
    id:ObjectId,
    cabType:{type: String,unique:true},
    image:{type: String,default:''},
    bags:{type: Number,default:0},
    capacity:{type: Number,default:0},
    ac:{type: String,default:'N'},
    cars:{type: String,default:''},
    note:{type: String,default:''},
    rate:{type: Number,default:0},
    returnTripRate:{type: Number,default:0},
    discount:{type: Number,default:0},
    extraRate:{type: Number,default:0},
    PerDayKmReturn:{type: Number,default:0},
    PerDayKmSingle:{type: Number,default:0},    
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_cabs', cabsSchema);
