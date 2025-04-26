const Ingredient = require('../models/Ingredient');

/**
 * @desc   Get all ingredients
 * @route  GET /api/ingredients
 * @access Public
 */
exports.getIngredients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const ingredients = await Ingredient.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Ingredient.countDocuments();
    
    return res.json({
      success: true,
      count: ingredients.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: ingredients
    });
  } catch (error) {
    console.error('Error in getIngredients:', error);
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
    
    const ingredient = await Ingredient.findOne({ ingredient_id: ingredientId });
    
    if (!ingredient) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    
    return res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Error in getIngredientById:', error);
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
    
    const ingredients = await Ingredient.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ name: 1 });
    
    return res.json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    console.error('Error in searchIngredients:', error);
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
    
    const ingredients = await Ingredient.find({
      category: { $regex: category, $options: 'i' }
    }).sort({ name: 1 });
    
    return res.json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    console.error('Error in getIngredientsByCategory:', error);
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
    const categories = await Ingredient.distinct('category');
    
    return res.json({
      success: true,
      count: categories.length,
      data: categories.filter(category => category && category.trim() !== '')
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
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
    const { ingredient_id, name, category, description, flavor_profile, image_url } = req.body;
    
    // Validate required fields
    if (!ingredient_id || !name) {
      return res.status(400).json({ success: false, error: 'Please provide ingredient_id and name' });
    }
    
    // Check if ingredient already exists
    const existingIngredient = await Ingredient.findOne({ ingredient_id });
    
    if (existingIngredient) {
      return res.status(400).json({ success: false, error: 'Ingredient with this ID already exists' });
    }
    
    // Create new ingredient
    const newIngredient = await Ingredient.create({
      ingredient_id,
      name,
      category,
      description,
      flavor_profile,
      image_url
    });
    
    return res.status(201).json({
      success: true,
      data: newIngredient
    });
  } catch (error) {
    console.error('Error in createIngredient:', error);
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
    
    // Find ingredient
    let ingredient = await Ingredient.findOne({ ingredient_id: ingredientId });
    
    if (!ingredient) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    
    // Update fields
    const updatedData = {
      name: req.body.name || ingredient.name,
      category: req.body.category || ingredient.category,
      description: req.body.description || ingredient.description,
      flavor_profile: req.body.flavor_profile || ingredient.flavor_profile,
      image_url: req.body.image_url || ingredient.image_url,
      updated_at: Date.now()
    };
    
    // Update in database
    ingredient = await Ingredient.findOneAndUpdate(
      { ingredient_id: ingredientId },
      { $set: updatedData },
      { new: true }
    );
    
    return res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Error in updateIngredient:', error);
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
    
    // Find and delete ingredient
    const ingredient = await Ingredient.findOneAndDelete({ ingredient_id: ingredientId });
    
    if (!ingredient) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    
    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteIngredient:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
