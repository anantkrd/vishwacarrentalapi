

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const agentSchema = new mongoose.Schema(
  {
    id:ObjectId,
    agentId:{type: String, required: true},
    bookingId: {
      type: String,
      trim: true,
      required: true,
    },
    agentAmount:{type: Number,default:0},
    advance:{type: Number,default:0},
    tripAmount:{type: Number,default:0},
    userPaid:{type: Number,default:0},
    userPending:{type: Number,default:0},
    payToAgent:{type: Number,default:0},
    paymentId:{type: String,default:''},
    payToAgentType:{type: String,default:'credit'},
    status:{type: String,default:'pending'},
    tripStatus:{type: String,default:'pending'},
    isDriverAdded:{type: String,default:'N'},
    isCarAdded:{type: String,default:'N'},
    rawResponce:{type: String,default:''},    
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_agent_booking', agentSchema);