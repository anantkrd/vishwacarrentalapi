

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const cabTypesSchema = new mongoose.Schema(
  {
    id:ObjectId,
    cabType:{type: String,unique:true,required: true},    
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_cab_types', cabTypesSchema);
