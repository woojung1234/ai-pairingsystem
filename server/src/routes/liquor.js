const express = require('express');
const router = express.Router();
const Liquor = require('../models/Liquor');

/**
 * @route   GET /api/liquors
 * @desc    Get all liquors
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const liquors = await Liquor.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Liquor.countDocuments();
    
    return res.json({
      success: true,
      count: liquors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: liquors
    });
  } catch (error) {
    console.error('Error in get all liquors route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /api/liquors/:id
 * @desc    Get liquor by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const liquorId = parseInt(id);
    
    const liquor = await Liquor.findOne({ liquor_id: liquorId });
    
    if (!liquor) {
      return res.status(404).json({ success: false, error: 'Liquor not found' });
    }
    
    return res.json({
      success: true,
      data: liquor
    });
  } catch (error) {
    console.error('Error in get liquor by ID route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   GET /api/liquors/search/:query
 * @desc    Search liquors by name
 * @access  Public
 */
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Please provide a search query' });
    }
    
    const liquors = await Liquor.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ name: 1 });
    
    return res.json({
      success: true,
      count: liquors.length,
      data: liquors
    });
  } catch (error) {
    console.error('Error in search liquors route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/liquors
 * @desc    Create a new liquor
 * @access  Private (would require auth middleware)
 */
router.post('/', async (req, res) => {
  try {
    const { liquor_id, name, type, description, origin, alcohol_content, flavor_profile, image_url } = req.body;
    
    // Validate required fields
    if (!liquor_id || !name) {
      return res.status(400).json({ success: false, error: 'Please provide liquor_id and name' });
    }
    
    // Check if liquor already exists
    const existingLiquor = await Liquor.findOne({ liquor_id });
    
    if (existingLiquor) {
      return res.status(400).json({ success: false, error: 'Liquor with this ID already exists' });
    }
    
    // Create new liquor
    const newLiquor = await Liquor.create({
      liquor_id,
      name,
      type,
      description,
      origin,
      alcohol_content,
      flavor_profile,
      image_url
    });
    
    return res.status(201).json({
      success: true,
      data: newLiquor
    });
  } catch (error) {
    console.error('Error in create liquor route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/liquors/:id
 * @desc    Update a liquor
 * @access  Private (would require auth middleware)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const liquorId = parseInt(id);
    
    // Find liquor
    let liquor = await Liquor.findOne({ liquor_id: liquorId });
    
    if (!liquor) {
      return res.status(404).json({ success: false, error: 'Liquor not found' });
    }
    
    // Update fields
    const updatedData = {
      name: req.body.name || liquor.name,
      type: req.body.type || liquor.type,
      description: req.body.description || liquor.description,
      origin: req.body.origin || liquor.origin,
      alcohol_content: req.body.alcohol_content || liquor.alcohol_content,
      flavor_profile: req.body.flavor_profile || liquor.flavor_profile,
      image_url: req.body.image_url || liquor.image_url,
      updated_at: Date.now()
    };
    
    // Update in database
    liquor = await Liquor.findOneAndUpdate(
      { liquor_id: liquorId },
      { $set: updatedData },
      { new: true }
    );
    
    return res.json({
      success: true,
      data: liquor
    });
  } catch (error) {
    console.error('Error in update liquor route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/liquors/:id
 * @desc    Delete a liquor
 * @access  Private (would require auth middleware)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const liquorId = parseInt(id);
    
    // Find and delete liquor
    const liquor = await Liquor.findOneAndDelete({ liquor_id: liquorId });
    
    if (!liquor) {
      return res.status(404).json({ success: false, error: 'Liquor not found' });
    }
    
    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in delete liquor route:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
