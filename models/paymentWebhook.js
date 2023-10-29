

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const webhookSchema = new mongoose.Schema(
  {
    id:ObjectId,    
    paymentId:{type: String,default:''},
    data:{type: String,default:''},
    status:{type: String,default:''},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);
webhookSchema.index({createdAt: 1},{expireAfterSeconds: 2592000});
module.exports = mongoose.model('vcr_webhook_log', webhookSchema);
//2592000