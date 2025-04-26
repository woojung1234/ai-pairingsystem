const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    maxlength: [50, 'Username cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  preferences: {
    favorite_liquors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Liquor'
    }],
    favorite_ingredients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient'
    }],
    disliked_liquors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Liquor'
    }],
    disliked_ingredients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient'
    }]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
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
UserSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);
