const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

/**
 * @route   GET /api/ingredients
 * @desc    Get all ingredients
 * @access  Public
 */
router.get('/', async (req, res) => {
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
    console.error('Error in get all ingredients route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /api/ingredients/:id
 * @desc    Get ingredient by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
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
    console.error('Error in get ingredient by ID route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /api/ingredients/search/:query
 * @desc    Search ingredients by name
 * @access  Public
 */
router.get('/search/:query', async (req, res) => {
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
    console.error('Error in search ingredients route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /api/ingredients/category/:category
 * @desc    Get ingredients by category
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
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
    console.error('Error in get ingredients by category route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/ingredients
 * @desc    Create a new ingredient
 * @access  Private (would require auth middleware)
 */
router.post('/', async (req, res) => {
  try {
    const { ingredient_id, name, category, description, is_hub, flavor_profile, image_url } = req.body;
    
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
      is_hub: is_hub || false,
      flavor_profile,
      image_url
    });
    
    return res.status(201).json({
      success: true,
      data: newIngredient
    });
  } catch (error) {
    console.error('Error in create ingredient route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/ingredients/:id
 * @desc    Update an ingredient
 * @access  Private (would require auth middleware)
 */
router.put('/:id', async (req, res) => {
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
      is_hub: req.body.is_hub !== undefined ? req.body.is_hub : ingredient.is_hub,
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
    console.error('Error in update ingredient route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/ingredients/:id
 * @desc    Delete an ingredient
 * @access  Private (would require auth middleware)
 */
router.delete('/:id', async (req, res) => {
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
    console.error('Error in delete ingredient route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
