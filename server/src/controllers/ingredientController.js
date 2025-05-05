const Ingredient = require('../models/Ingredient');
const logger = require('../utils/logger');
const pool = require('../config/db').pool;

/**
 * @desc   Get all ingredients
 * @route  GET /api/ingredients
 * @access Public
 */
exports.getIngredients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // 수정된 부분: MySQL 모델 사용
    const ingredients = await Ingredient.getAll();
    
    // 클라이언트 측 페이지네이션 처리
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedIngredients = ingredients.slice(startIndex, endIndex);
    
    return res.json({
      success: true,
      count: paginatedIngredients.length,
      total: ingredients.length,
      page,
      pages: Math.ceil(ingredients.length / limit),
      data: paginatedIngredients
    });
  } catch (error) {
    logger.error('Error in getIngredients:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Get ingredient by ID
 * @route  GET /api/ingredients/:id
 * @access Public
 */
exports.getIngredientById = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredientId = parseInt(id);
    
    // 수정된 부분: MySQL 모델 사용
    const ingredient = await Ingredient.getById(ingredientId);
    
    if (!ingredient) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    
    return res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    logger.error('Error in getIngredientById:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Search ingredients by name
 * @route  GET /api/ingredients/search/:query
 * @access Public
 */
exports.searchIngredients = async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Please provide a search query' });
    }
    
    // 수정된 부분: MySQL 모델 사용
    const ingredients = await Ingredient.searchByName(query);
    
    return res.json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    logger.error('Error in searchIngredients:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Get ingredients by category
 * @route  GET /api/ingredients/category/:category
 * @access Public
 */
exports.getIngredientsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({ success: false, error: 'Please provide a category' });
    }
    
    // 수정된 부분: MySQL 모델 사용
    const ingredients = await Ingredient.getByCategory(category);
    
    return res.json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    logger.error('Error in getIngredientsByCategory:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Get all categories
 * @route  GET /api/ingredients/categories
 * @access Public
 */
exports.getCategories = async (req, res) => {
  try {
    // 수정된 부분: MySQL에서 카테고리 목록 조회
    const [rows] = await pool.execute('SELECT DISTINCT category FROM ingredients WHERE category IS NOT NULL AND category != ""');
    const categories = rows.map(row => row.category);
    
    return res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    logger.error('Error in getCategories:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Create a new ingredient
 * @route  POST /api/ingredients
 * @access Private
 */
exports.createIngredient = async (req, res) => {
  try {
    const { name, category, description, image_url } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide name' });
    }
    
    // 수정된 부분: MySQL 모델 사용
    const ingredientData = {
      name,
      category,
      description,
      imageUrl: image_url
    };
    
    const newIngredientId = await Ingredient.create(ingredientData);
    const newIngredient = await Ingredient.getById(newIngredientId);
    
    return res.status(201).json({
      success: true,
      data: newIngredient
    });
  } catch (error) {
    logger.error('Error in createIngredient:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Update an ingredient
 * @route  PUT /api/ingredients/:id
 * @access Private
 */
exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredientId = parseInt(id);
    
    // 수정된 부분: MySQL 모델 사용
    const ingredient = await Ingredient.getById(ingredientId);
    
    if (!ingredient) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    
    // Update fields
    const ingredientData = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      imageUrl: req.body.image_url
    };
    
    await Ingredient.update(ingredientId, ingredientData);
    const updatedIngredient = await Ingredient.getById(ingredientId);
    
    return res.json({
      success: true,
      data: updatedIngredient
    });
  } catch (error) {
    logger.error('Error in updateIngredient:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Delete an ingredient
 * @route  DELETE /api/ingredients/:id
 * @access Private
 */
exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredientId = parseInt(id);
    
    // 수정된 부분: MySQL 모델 사용
    const success = await Ingredient.delete(ingredientId);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    
    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Error in deleteIngredient:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
