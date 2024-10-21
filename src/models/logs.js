const mongoose = require('mongoose');

const logs = mongoose.Schema({
    userId: { type: String, required: true },
    wallet: { type: String, required: true },
    tx: { type: String, required: true },
    status: { type: String,default:"pending", required: true },
    amount: { type: Number, default: 0,required:true },
    timestamp: { type: Number, default: Date.now },
    dateTime: { type: Date, default: Date.now }, 
});


module.exports = mongoose.model('logs', logs);