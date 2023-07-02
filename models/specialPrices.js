
//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const specialPriceSchema = new mongoose.Schema(
  {
    id:ObjectId,
    cabType:{type: String,default:''},
    startDate:{type: Date},
    endDate:{type: Date},
    weekDay:{type: Number,default:0},
    rate:{type: Number,default:0},
    returnTripRate:{type: Number,default:0},
    extraRate:{type: Number,default:0},    
    type:{type: String,default:'dateRange'},
    
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_special_prices', specialPriceSchema);
