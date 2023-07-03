

//import mongoose from "mongoose";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const bookingSchema = new mongoose.Schema(
  {
    id:ObjectId,
    userId:{type: String, required: true,default:'',unique:false},    
    userName:{type: String,default:''},
    status:{type: String,default:'pending'},
    userMobileNo:{type: String,default:''},
    orderId:{type: String,default:''},
    cabId:{type: String,default:''},
    pickup:{type: String,default:''},
    destination:{type: String,default:''},
    pickupCityName:{type: String,default:''},
    pickupDistrict:{type: String,default:''},
    pickupState:{type: String,default:''},
    dropCityName:{type: String,default:''},
    dropDistrict:{type: String,default:''},
    dropState:{type: String,default:''},
    pickupDate:{type: Date},
    returnDate:{type: Date},
    destinationLat:{type: String,default:''},
    isReturn:{type: String,default:''},
    pickupLat:{type: String,default:''},
    pickupLong:{type: String,default:''},
    destinationLong:{type: String,default:''},
    distance:{type: String,default:''},
    journyDistance:{type: String,default:''},
    journyTime:{type: String,default:''},
    rate:{type: Number,default:0},
    amount:{type: Number,default:0},
    discount:{type: Number,default:0},
    extraRate:{type: Number,default:0},
    extraAmount:{type: Number,default:0},
    tax:{type: Number,default:0},
    rate:{type: Number,default:0},
    charges:{type: Number,default:0},
    finalAmount:{type: Number,default:0},
    paid:{type: Number,default:0},
    pending:{type: Number,default:0},
    pendpayment_orderIding:{type: String,default:''},
    agentId:{type: String,default:''},
    agentPrice:{type: Number,default:0},
    driverName:{type: String,default:''},
    driverContact:{type: String,default:''},
    gadiNo:{type: String,default:''},
    gadiModel:{type: String,default:''},
    status:{type: String,default:'pending'},
    journyStatus:{type: String,default:'pending'},
    journyStartTime:{type: Date},
    journyEndTime:{type: Date},
    driverId:{type: String,default:''},
    carId:{type: String,default:''},
    startKm:{type: Number,default:0},
    endKm:{type: Number,default:0},
    agentPaid:{type: Number,default:0},
    cashAmount:{type: Number,default:0},
    isDeleted: {
      type: String,
      default: "N",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('vcr_booking', bookingSchema);
