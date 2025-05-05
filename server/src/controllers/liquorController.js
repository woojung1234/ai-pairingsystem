const Liquor = require('../models/Liquor');
const logger = require('../utils/logger');

/**
 * @desc   Get all liquors
 * @route  GET /api/liquors
 * @access Public
 */
exports.getLiquors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // 수정된 부분: MySQL 모델 사용
    const liquors = await Liquor.getAll();
    
    // 클라이언트 측 페이지네이션 처리
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLiquors = liquors.slice(startIndex, endIndex);
    
    return res.json({
      success: true,
      count: paginatedLiquors.length,
      total: liquors.length,
      page,
      pages: Math.ceil(liquors.length / limit),
      data: paginatedLiquors
    });
  } catch (error) {
    logger.error('Error in getLiquors:', error);
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
    
    // 수정된 부분: MySQL 모델 사용
    const liquor = await Liquor.getById(liquorId);
    
    if (!liquor) {
      return res.status(404).json({ success: false, error: 'Liquor not found' });
    }
    
    return res.json({
      success: true,
      data: liquor
    });
  } catch (error) {
    logger.error('Error in getLiquorById:', error);
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
    
    // 수정된 부분: MySQL 모델 사용
    const liquors = await Liquor.searchByName(query);
    
    return res.json({
      success: true,
      count: liquors.length,
      data: liquors
    });
  } catch (error) {
    logger.error('Error in searchLiquors:', error);
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
    const { name, type, description, origin, alcohol_content, image_url } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide name' });
    }
    
    // 수정된 부분: MySQL 모델 사용
    const liquorData = {
      name,
      type,
      description,
      origin,
      alcoholContent: alcohol_content,
      imageUrl: image_url
    };
    
    const newLiquorId = await Liquor.create(liquorData);
    const newLiquor = await Liquor.getById(newLiquorId);
    
    return res.status(201).json({
      success: true,
      data: newLiquor
    });
  } catch (error) {
    logger.error('Error in createLiquor:', error);
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
    
    // 수정된 부분: MySQL 모델 사용
    const liquor = await Liquor.getById(liquorId);
    
    if (!liquor) {
      return res.status(404).json({ success: false, error: 'Liquor not found' });
    }
    
    // Update fields
    const liquorData = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      origin: req.body.origin,
      alcoholContent: req.body.alcohol_content,
      imageUrl: req.body.image_url
    };
    
    await Liquor.update(liquorId, liquorData);
    const updatedLiquor = await Liquor.getById(liquorId);
    
    return res.json({
      success: true,
      data: updatedLiquor
    });
  } catch (error) {
    logger.error('Error in updateLiquor:', error);
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
    
    // 수정된 부분: MySQL 모델 사용
    const success = await Liquor.delete(liquorId);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Liquor not found' });
    }
    
    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Error in deleteLiquor:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
