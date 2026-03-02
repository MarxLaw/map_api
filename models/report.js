const mongoose = require('../database/mongo');

const reportSchema = new mongoose.Schema({
    coor_lat: { type: Number, required: true },
    coor_lon: { type: Number, required: true },
    description: { type: String, required: true },
    brgy: { type: String, required: true },
    city: { type: String, required: true },
    user: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
