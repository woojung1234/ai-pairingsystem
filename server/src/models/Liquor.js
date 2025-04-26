const mongoose = require('mongoose');

const LiquorSchema = new mongoose.Schema({
  liquor_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  origin: {
    type: String
  },
  alcohol_content: {
    type: Number
  },
  flavor_profile: {
    type: [String]
  },
  image_url: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
LiquorSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Liquor', LiquorSchema);
