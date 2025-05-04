const express = require('express');
const router = express.Router();
const { 
  getLiquors, 
  getLiquorById, 
  searchLiquors, 
  createLiquor, 
  updateLiquor, 
  deleteLiquor 
} = require('../controllers/liquorController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/liquors
 * @desc    Get all liquors
 * @access  Public
 */
router.get('/', getLiquors);

/**
 * @route   GET /api/liquors/search/:query
 * @desc    Search liquors by name
 * @access  Public
 */
router.get('/search/:query', searchLiquors);

/**
 * @route   GET /api/liquors/:id
 * @desc    Get liquor by ID
 * @access  Public
 */
router.get('/:id', getLiquorById);

/**
 * @route   POST /api/liquors
 * @desc    Create a new liquor
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, createLiquor);

/**
 * @route   PUT /api/liquors/:id
 * @desc    Update a liquor
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, updateLiquor);

/**
 * @route   DELETE /api/liquors/:id
 * @desc    Delete a liquor
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteLiquor);

module.exports = router;
