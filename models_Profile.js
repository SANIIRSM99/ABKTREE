const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fatherName: String,
    cnic: { type: String, required: true, unique: true },
    fatherCNIC: String,
    bloodGroup: String,
    phone: String,
    address: String,
    dob: String,
    gender: String,
    married: String,
    spouseCnic: String,
    spouseName: String,
    status: String,
    deathDate: String,
    photo: String,
    note: String
});

module.exports = mongoose.model('Profile', profileSchema);