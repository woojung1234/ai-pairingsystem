/**
 * Recommendation routes
 */
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authMiddleware } = require('../middleware/auth');

// Liquor 기반 추천
router.get('/liquors/:liquorId', recommendationController.getIngredientRecommendations);

// Ingredient 기반 추천
router.get('/ingredients/:ingredientId', recommendationController.getLiquorRecommendations);

// 사용자 맞춤 추천
router.get('/personal', authMiddleware, recommendationController.getPersonalRecommendations);

// 인기 페어링 추천
router.get('/popular', recommendationController.getPopularPairings);

module.exports = router;
