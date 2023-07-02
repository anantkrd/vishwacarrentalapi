

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new mongoose.Schema(
  {
    id:ObjectId,
    userId:{type:Number,default:0,unique:true},
    firstName:{type: String,default:''},
    lastName:{type: String,default:''},
    mobileNo:{type: String,default:'',unique: true,},
    email:{type: String,default:'',unique: true,},
    userPassword:{type: String,default:''},
    userType:{type: String,default:'user'},
    idProof:{type: String,default:''},
    idNumber:{type: String,default:''},
    parentId:{type: String,default:0},
    profileImage:{type: String,default:''},
    status:{type: String,default:'pending'},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_users', userSchema);
