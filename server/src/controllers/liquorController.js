const Liquor = require('../models/Liquor');

/**
 * @desc   Get all liquors
 * @route  GET /api/liquors
 * @access Public
 */
exports.getLiquors = async (req, res) => {
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
    console.error('Error in getLiquors:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Get liquor by ID
 * @route  GET /api/liquors/:id
 * @access Public
 */
exports.getLiquorById = async (req, res) => {
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
    console.error('Error in getLiquorById:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Search liquors by name
 * @route  GET /api/liquors/search/:query
 * @access Public
 */
exports.searchLiquors = async (req, res) => {
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
    console.error('Error in searchLiquors:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Create a new liquor
 * @route  POST /api/liquors
 * @access Private
 */
exports.createLiquor = async (req, res) => {
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
    console.error('Error in createLiquor:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Update a liquor
 * @route  PUT /api/liquors/:id
 * @access Private
 */
exports.updateLiquor = async (req, res) => {
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
    console.error('Error in updateLiquor:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc   Delete a liquor
 * @route  DELETE /api/liquors/:id
 * @access Private
 */
exports.deleteLiquor = async (req, res) => {
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
    console.error('Error in deleteLiquor:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
