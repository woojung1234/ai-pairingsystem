const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const pool = db.pool;

/**
 * @desc   Register user
 * @route  POST /api/users/register
 * @access Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    // Check if user already exists with this email
    const existingUserByEmail = await User.getByEmail(email);
    
    if (existingUserByEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }
    
    // Check if username is taken
    const [usersWithUsername] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (usersWithUsername.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'This username is already taken'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = await User.create({
      username,
      email,
      password: hashedPassword
    });
    
    const user = await User.getById(userId);

    // Create token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Login user
 * @route  POST /api/users/login
 * @access Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.getByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Get current user
 * @route  GET /api/users/me
 * @access Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.getById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Get user preferences
    const favoriteLiquors = await User.getFavorites(req.user.id, 'liquors');
    const favoriteIngredients = await User.getFavorites(req.user.id, 'ingredients');
    const dislikedLiquors = await User.getDislikes(req.user.id, 'liquors');
    const dislikedIngredients = await User.getDislikes(req.user.id, 'ingredients');
    
    const preferences = {
      favorite_liquors: favoriteLiquors,
      favorite_ingredients: favoriteIngredients,
      disliked_liquors: dislikedLiquors,
      disliked_ingredients: dislikedIngredients
    };

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: preferences,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Update user profile
 * @route  PUT /api/users/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Find user
    const user = await User.getById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update fields
    const userData = {};
    if (username) userData.username = username;
    if (email) userData.email = email;
    
    // Save changes
    const success = await User.update(user.id, userData);
    
    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to update profile' });
    }
    
    // Get updated user
    const updatedUser = await User.getById(user.id);
    
    return res.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Update password
 * @route  PUT /api/users/password
 * @access Private
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide current and new password' 
      });
    }
    
    // Get user with password
    const user = await User.getByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    const success = await User.update(user.id, { password: hashedPassword });
    
    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to update password' });
    }
    
    return res.json({
      success: true,
      data: { message: 'Password updated successfully' }
    });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Update user preferences
 * @route  PUT /api/users/preferences
 * @access Private
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { 
      favorite_liquors,
      favorite_ingredients,
      disliked_liquors,
      disliked_ingredients
    } = req.body;
    
    // Find user
    const user = await User.getById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update preferences in respective tables using transactions
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Handle favorite liquors
      if (favorite_liquors && Array.isArray(favorite_liquors)) {
        // Clear existing favorites
        await connection.execute('DELETE FROM user_favorite_liquors WHERE user_id = ?', [user.id]);
        
        // Add new favorites
        for (const liquorId of favorite_liquors) {
          await connection.execute(
            'INSERT INTO user_favorite_liquors (user_id, liquor_id) VALUES (?, ?)',
            [user.id, liquorId]
          );
        }
      }
      
      // Handle favorite ingredients
      if (favorite_ingredients && Array.isArray(favorite_ingredients)) {
        // Clear existing favorites
        await connection.execute('DELETE FROM user_favorite_ingredients WHERE user_id = ?', [user.id]);
        
        // Add new favorites
        for (const ingredientId of favorite_ingredients) {
          await connection.execute(
            'INSERT INTO user_favorite_ingredients (user_id, ingredient_id) VALUES (?, ?)',
            [user.id, ingredientId]
          );
        }
      }
      
      // Handle disliked liquors
      if (disliked_liquors && Array.isArray(disliked_liquors)) {
        // Clear existing dislikes
        await connection.execute('DELETE FROM user_disliked_liquors WHERE user_id = ?', [user.id]);
        
        // Add new dislikes
        for (const liquorId of disliked_liquors) {
          await connection.execute(
            'INSERT INTO user_disliked_liquors (user_id, liquor_id) VALUES (?, ?)',
            [user.id, liquorId]
          );
        }
      }
      
      // Handle disliked ingredients
      if (disliked_ingredients && Array.isArray(disliked_ingredients)) {
        // Clear existing dislikes
        await connection.execute('DELETE FROM user_disliked_ingredients WHERE user_id = ?', [user.id]);
        
        // Add new dislikes
        for (const ingredientId of disliked_ingredients) {
          await connection.execute(
            'INSERT INTO user_disliked_ingredients (user_id, ingredient_id) VALUES (?, ?)',
            [user.id, ingredientId]
          );
        }
      }
      
      await connection.commit();
      
      // Get updated preferences
      const updatedFavoriteLiquors = await User.getFavorites(user.id, 'liquors');
      const updatedFavoriteIngredients = await User.getFavorites(user.id, 'ingredients');
      const updatedDislikedLiquors = await User.getDislikes(user.id, 'liquors');
      const updatedDislikedIngredients = await User.getDislikes(user.id, 'ingredients');
      
      const preferences = {
        favorite_liquors: updatedFavoriteLiquors,
        favorite_ingredients: updatedFavoriteIngredients,
        disliked_liquors: updatedDislikedLiquors,
        disliked_ingredients: updatedDislikedIngredients
      };
      
      return res.json({
        success: true,
        data: {
          preferences: preferences
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in updatePreferences:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Delete user account
 * @route  DELETE /api/users
 * @access Private
 */
exports.deleteAccount = async (req, res) => {
  try {
    // Delete user and related data
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Delete user preferences
      await connection.execute('DELETE FROM user_favorite_liquors WHERE user_id = ?', [req.user.id]);
      await connection.execute('DELETE FROM user_favorite_ingredients WHERE user_id = ?', [req.user.id]);
      await connection.execute('DELETE FROM user_disliked_liquors WHERE user_id = ?', [req.user.id]);
      await connection.execute('DELETE FROM user_disliked_ingredients WHERE user_id = ?', [req.user.id]);
      
      // Delete pairing ratings
      await connection.execute('DELETE FROM pairing_ratings WHERE user_id = ?', [req.user.id]);
      
      // Delete user account
      await connection.execute('DELETE FROM users WHERE id = ?', [req.user.id]);
      
      await connection.commit();
      
      return res.json({
        success: true,
        data: { message: 'Account deleted successfully' }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};



/**
 * @desc   Logout user
 * @route  POST /api/users/logout
 * @access Private
 */
exports.logoutUser = async (req, res) => {
  try {
    // JWT는 서버에 저장되지 않으므로 클라이언트 측에서 토큰을 삭제하도록 알림
    // 여기서는 성공 응답만 반환
    return res.json({
      success: true,
      data: { message: '로그아웃되었습니다.' }
    });
  } catch (error) {
    console.error('Error in logoutUser:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};