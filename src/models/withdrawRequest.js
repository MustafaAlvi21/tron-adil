const mongoose = require('mongoose');

const withdrawRequest = mongoose.Schema({
    userId: { type: String, required: true },
    wallet: { type: String, required: true },
    status: { type: String,default:"pending", required: true },
    RequestedAmount: { type: Number, required:true },
    
    timestamp: { type: Number, default: Date.now },
    dateTime: { type: Date, default: Date.now }, 
});


module.exports = mongoose.model('withdrawRequest', withdrawRequest);