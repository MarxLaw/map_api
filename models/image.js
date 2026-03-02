const mongoose = require('../database/mongo');

const imageSchema = new mongoose.Schema({
  filename: String,
  mimetype: String,
  data: Buffer,          // if storing as BLOB
  reportId: {            // foreign key to Report
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
