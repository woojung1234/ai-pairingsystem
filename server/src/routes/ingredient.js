const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/ingredients
 * @desc    Get all ingredients
 * @access  Public
 */
router.get('/', ingredientController.getIngredients);

/**
 * @route   GET /api/ingredients/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', ingredientController.getCategories);

/**
 * @route   GET /api/ingredients/search/:query
 * @desc    Search ingredients by name
 * @access  Public
 */
router.get('/search/:query', ingredientController.searchIngredients);

/**
 * @route   GET /api/ingredients/category/:category
 * @desc    Get ingredients by category
 * @access  Public
 */
router.get('/category/:category', ingredientController.getIngredientsByCategory);

/**
 * @route   GET /api/ingredients/:id
 * @desc    Get ingredient by ID
 * @access  Public
 */
router.get('/:id', ingredientController.getIngredientById);

/**
 * @route   POST /api/ingredients
 * @desc    Create a new ingredient
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, ingredientController.createIngredient);

/**
 * @route   PUT /api/ingredients/:id
 * @desc    Update an ingredient
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, ingredientController.updateIngredient);

/**
 * @route   DELETE /api/ingredients/:id
 * @desc    Delete an ingredient
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, ingredientController.deleteIngredient);

module.exports = router;
