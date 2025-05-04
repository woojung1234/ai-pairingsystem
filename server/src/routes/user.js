const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   POST /api/users/register
 * @desc    Register user
 * @access  Public
 */
router.post('/register', userController.registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', userController.loginUser);

/**
 * @route   GET /api/users/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authMiddleware, userController.getCurrentUser);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware, userController.updateProfile);

/**
 * @route   PUT /api/users/password
 * @desc    Update password
 * @access  Private
 */
router.put('/password', authMiddleware, userController.updatePassword);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', authMiddleware, userController.updatePreferences);

/**
 * @route   DELETE /api/users
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/', authMiddleware, userController.deleteAccount);

module.exports = router;
