/**
 * Recommendation Controller - 추천 관련 비즈니스 로직
 */
const Pairing = require('../models/mysql/Pairing');
const Liquor = require('../models/mysql/Liquor');
const Ingredient = require('../models/mysql/Ingredient');
const User = require('../models/mysql/User');
const logger = require('../utils/logger');

/**
 * @desc    특정 주류에 추천되는 재료 목록
 * @route   GET /api/recommendations/liquors/:liquorId
 * @access  Public
 */
const getIngredientRecommendations = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // 주류 존재 확인
    const liquor = await Liquor.findByNodeId(liquorId);
    if (!liquor) {
      return res.status(404).json({ message: 'Liquor not found' });
    }

    // 추천 재료 조회
    const recommendations = await Pairing.getTopPairingsForLiquor(liquor.id, limit);
    
    res.json({
      liquor: liquor.name,
      recommendations
    });
  } catch (error) {
    logger.error(`Error in getIngredientRecommendations: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    특정 재료에 추천되는 주류 목록
 * @route   GET /api/recommendations/ingredients/:ingredientId
 * @access  Public
 */
const getLiquorRecommendations = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // 재료 존재 확인
    const ingredient = await Ingredient.findByNodeId(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    // 추천 주류 조회
    const recommendations = await Pairing.getTopPairingsForIngredient(ingredient.id, limit);
    
    res.json({
      ingredient: ingredient.name,
      recommendations
    });
  } catch (error) {
    logger.error(`Error in getLiquorRecommendations: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    사용자 맞춠 추천
 * @route   GET /api/recommendations/personal
 * @access  Private
 */
const getPersonalRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    // 사용자 선호도 조회
    const favoriteLiquors = await User.getFavoriteLiquors(userId);
    const favoriteIngredients = await User.getFavoriteIngredients(userId);
    const dislikedLiquors = await User.getDislikedLiquors(userId);
    const dislikedIngredients = await User.getDislikedIngredients(userId);

    // 선호도 기반 추천 로직
    const recommendations = {
      basedOnFavoriteLiquors: [],
      basedOnFavoriteIngredients: [],
      newDiscoveries: []
    };

    // 즐겨찾은 주류 기반 추천
    for (const liquor of favoriteLiquors) {
      const ingredients = await Pairing.getTopPairingsForLiquor(liquor.id, 5);
      recommendations.basedOnFavoriteLiquors.push({
        liquor: liquor.name,
        suggestions: ingredients
      });
    }

    // 즐겨찾은 재료 기반 추천
    for (const ingredient of favoriteIngredients) {
      const liquors = await Pairing.getTopPairingsForIngredient(ingredient.id, 5);
      recommendations.basedOnFavoriteIngredients.push({
        ingredient: ingredient.name,
        suggestions: liquors
      });
    }

    // 새로운 발견을 위한 추천
    const popularPairings = await Pairing.getPopularPairings(10);
    recommendations.newDiscoveries = popularPairings.filter(pairing => 
      !dislikedLiquors.find(dl => dl.id === pairing.liquor_id) &&
      !dislikedIngredients.find(di => di.id === pairing.ingredient_id)
    );

    res.json(recommendations);
  } catch (error) {
    logger.error(`Error in getPersonalRecommendations: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    인기 페어링 추천
 * @route   GET /api/recommendations/popular
 * @access  Public
 */
const getPopularPairings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // 평균 사용자 평가가 높은 페어링 조회
    const popularByRating = await Pairing.getTopRatedPairings(limit);
    
    // 페어링 점수가 높은 페어링 조회
    const popularByScore = await Pairing.getHighScoringPairings(limit);
    
    res.json({
      topRated: popularByRating,
      topScoring: popularByScore
    });
  } catch (error) {
    logger.error(`Error in getPopularPairings: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getIngredientRecommendations,
  getLiquorRecommendations,
  getPersonalRecommendations,
  getPopularPairings
};
