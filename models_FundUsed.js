const mongoose = require('mongoose');

const fundUsedSchema = new mongoose.Schema({
    purpose: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true }
});

module.exports = mongoose.model('FundUsed', fundUsedSchema);