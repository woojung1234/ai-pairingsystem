const mongoose = require('mongoose');

const PairingSchema = new mongoose.Schema({
  liquor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Liquor',
    required: true
  },
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  reason: {
    type: String
  },
  shared_compounds: {
    type: [String]
  },
  user_rating: {
    type: Number,
    min: 1,
    max: 5
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

// Compound index to ensure unique pairs
PairingSchema.index({ liquor: 1, ingredient: 1 }, { unique: true });

// Update the updated_at field before saving
PairingSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Pairing', PairingSchema);
