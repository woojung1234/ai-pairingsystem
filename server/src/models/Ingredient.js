const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  ingredient_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  is_hub: {
    type: Boolean,
    default: false
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
IngredientSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
