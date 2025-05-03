/**
 * Preference Controller - 사용자 선호도 관련 비즈니스 로직
 */
const User = require('../models/mysql/User');
const logger = require('../utils/logger');

/**
 * @desc    주류를 즐겨찾기에 추가
 * @route   POST /api/preferences/favorites/liquors/:liquorId
 * @access  Private
 */
const addFavoriteLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const userId = req.user.id;

    const result = await User.addFavoriteLiquor(userId, liquorId);
    
    if (!result) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    res.json({ message: 'Liquor added to favorites' });
  } catch (error) {
    logger.error(`Error in addFavoriteLiquor: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    주류를 즐겨찾기에서 제거
 * @route   DELETE /api/preferences/favorites/liquors/:liquorId
 * @access  Private
 */
const removeFavoriteLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const userId = req.user.id;

    const result = await User.removeFavoriteLiquor(userId, liquorId);
    
    if (!result) {
      return res.status(404).json({ message: 'Not found in favorites' });
    }

    res.json({ message: 'Liquor removed from favorites' });
  } catch (error) {
    logger.error(`Error in removeFavoriteLiquor: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    사용자의 즐겨찾기 주류 목록 조회
 * @route   GET /api/preferences/favorites/liquors
 * @access  Private
 */
const getFavoriteLiquors = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const favoriteLiquors = await User.getFavoriteLiquors(userId);
    res.json(favoriteLiquors);
  } catch (error) {
    logger.error(`Error in getFavoriteLiquors: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    재료를 즐겨찾기에 추가
 * @route   POST /api/preferences/favorites/ingredients/:ingredientId
 * @access  Private
 */
const addFavoriteIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const userId = req.user.id;

    const result = await User.addFavoriteIngredient(userId, ingredientId);
    
    if (!result) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    res.json({ message: 'Ingredient added to favorites' });
  } catch (error) {
    logger.error(`Error in addFavoriteIngredient: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    재료를 즐겨찾기에서 제거
 * @route   DELETE /api/preferences/favorites/ingredients/:ingredientId
 * @access  Private
 */
const removeFavoriteIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const userId = req.user.id;

    const result = await User.removeFavoriteIngredient(userId, ingredientId);
    
    if (!result) {
      return res.status(404).json({ message: 'Not found in favorites' });
    }

    res.json({ message: 'Ingredient removed from favorites' });
  } catch (error) {
    logger.error(`Error in removeFavoriteIngredient: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    사용자의 즐겨찾기 재료 목록 조회
 * @route   GET /api/preferences/favorites/ingredients
 * @access  Private
 */
const getFavoriteIngredients = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const favoriteIngredients = await User.getFavoriteIngredients(userId);
    res.json(favoriteIngredients);
  } catch (error) {
    logger.error(`Error in getFavoriteIngredients: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    주류를 비선호에 추가
 * @route   POST /api/preferences/dislikes/liquors/:liquorId
 * @access  Private
 */
const addDislikedLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const userId = req.user.id;

    const result = await User.addDislikedLiquor(userId, liquorId);
    
    if (!result) {
      return res.status(400).json({ message: 'Already in dislikes' });
    }

    res.json({ message: 'Liquor added to dislikes' });
  } catch (error) {
    logger.error(`Error in addDislikedLiquor: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    주류를 비선호에서 제거
 * @route   DELETE /api/preferences/dislikes/liquors/:liquorId
 * @access  Private
 */
const removeDislikedLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const userId = req.user.id;

    const result = await User.removeDislikedLiquor(userId, liquorId);
    
    if (!result) {
      return res.status(404).json({ message: 'Not found in dislikes' });
    }

    res.json({ message: 'Liquor removed from dislikes' });
  } catch (error) {
    logger.error(`Error in removeDislikedLiquor: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    사용자의 비선호 주류 목록 조회
 * @route   GET /api/preferences/dislikes/liquors
 * @access  Private
 */
const getDislikedLiquors = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const dislikedLiquors = await User.getDislikedLiquors(userId);
    res.json(dislikedLiquors);
  } catch (error) {
    logger.error(`Error in getDislikedLiquors: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    재료를 비선호에 추가
 * @route   POST /api/preferences/dislikes/ingredients/:ingredientId
 * @access  Private
 */
const addDislikedIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const userId = req.user.id;

    const result = await User.addDislikedIngredient(userId, ingredientId);
    
    if (!result) {
      return res.status(400).json({ message: 'Already in dislikes' });
    }

    res.json({ message: 'Ingredient added to dislikes' });
  } catch (error) {
    logger.error(`Error in addDislikedIngredient: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    재료를 비선호에서 제거
 * @route   DELETE /api/preferences/dislikes/ingredients/:ingredientId
 * @access  Private
 */
const removeDislikedIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const userId = req.user.id;

    const result = await User.removeDislikedIngredient(userId, ingredientId);
    
    if (!result) {
      return res.status(404).json({ message: 'Not found in dislikes' });
    }

    res.json({ message: 'Ingredient removed from dislikes' });
  } catch (error) {
    logger.error(`Error in removeDislikedIngredient: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    사용자의 비선호 재료 목록 조회
 * @route   GET /api/preferences/dislikes/ingredients
 * @access  Private
 */
const getDislikedIngredients = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const dislikedIngredients = await User.getDislikedIngredients(userId);
    res.json(dislikedIngredients);
  } catch (error) {
    logger.error(`Error in getDislikedIngredients: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  addFavoriteLiquor,
  removeFavoriteLiquor,
  getFavoriteLiquors,
  addFavoriteIngredient,
  removeFavoriteIngredient,
  getFavoriteIngredients,
  addDislikedLiquor,
  removeDislikedLiquor,
  getDislikedLiquors,
  addDislikedIngredient,
  removeDislikedIngredient,
  getDislikedIngredients
};
