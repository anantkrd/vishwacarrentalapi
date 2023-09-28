

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const callbackRequest = new mongoose.Schema(
  {
    id:ObjectId,
    callBackNumber:{type: String,default:''},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_callback_request', callbackRequest);
