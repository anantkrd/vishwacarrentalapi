

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const surgeSchema = new mongoose.Schema(
  {
    id:ObjectId,
    city:{type: String,unique:true,required: true},
    location:{type: String,default:''},
    surge:{type: String,default:''},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_surge', surgeSchema);
