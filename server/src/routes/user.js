const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private (would require auth middleware)
 */
router.get('/profile', async (req, res) => {
  try {
    // In a real application, user ID would come from JWT token
    // For now, we'll simulate with a user ID
    const userId = req.query.userId || '607f1f77bcf86cd799439011'; // Example user ID
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('preferences.favorite_liquors')
      .populate('preferences.favorite_ingredients')
      .populate('preferences.disliked_liquors')
      .populate('preferences.disliked_ingredients');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in get user profile route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email or username already exists' });
    }
    
    // Create new user
    // In a real application, password would be hashed
    const newUser = await User.create({
      username,
      email,
      password, // This should be hashed in a real application
      preferences: {
        favorite_liquors: [],
        favorite_ingredients: [],
        disliked_liquors: [],
        disliked_ingredients: []
      }
    });
    
    // Return user without password
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      preferences: newUser.preferences,
      role: newUser.role,
      created_at: newUser.created_at
    };
    
    return res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error in register user route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // In a real application, password would be compared with bcrypt
    const isMatch = user.password === password;
    
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Return user without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      preferences: user.preferences,
      role: user.role
    };
    
    return res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error in login route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private (would require auth middleware)
 */
router.put('/preferences', async (req, res) => {
  try {
    // In a real application, user ID would come from JWT token
    const userId = req.query.userId || '607f1f77bcf86cd799439011'; // Example user ID
    
    const { favorite_liquors, favorite_ingredients, disliked_liquors, disliked_ingredients } = req.body;
    
    // Find user
    let user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update preferences
    const updatedPreferences = {
      favorite_liquors: favorite_liquors || user.preferences.favorite_liquors,
      favorite_ingredients: favorite_ingredients || user.preferences.favorite_ingredients,
      disliked_liquors: disliked_liquors || user.preferences.disliked_liquors,
      disliked_ingredients: disliked_ingredients || user.preferences.disliked_ingredients
    };
    
    // Update in database
    user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          preferences: updatedPreferences,
          updated_at: Date.now()
        } 
      },
      { new: true }
    )
    .select('-password')
    .populate('preferences.favorite_liquors')
    .populate('preferences.favorite_ingredients')
    .populate('preferences.disliked_liquors')
    .populate('preferences.disliked_ingredients');
    
    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in update preferences route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
