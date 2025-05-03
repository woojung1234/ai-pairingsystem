/**
 * User Preference routes
 */
const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');
const { authMiddleware } = require('../middleware/auth');

// 주류 즐겨찾기 관리
router.post('/favorites/liquors/:liquorId', authMiddleware, preferenceController.addFavoriteLiquor);
router.delete('/favorites/liquors/:liquorId', authMiddleware, preferenceController.removeFavoriteLiquor);
router.get('/favorites/liquors', authMiddleware, preferenceController.getFavoriteLiquors);

// 재료 즐겨찾기 관리
router.post('/favorites/ingredients/:ingredientId', authMiddleware, preferenceController.addFavoriteIngredient);
router.delete('/favorites/ingredients/:ingredientId', authMiddleware, preferenceController.removeFavoriteIngredient);
router.get('/favorites/ingredients', authMiddleware, preferenceController.getFavoriteIngredients);

// 주류 비선호 관리
router.post('/dislikes/liquors/:liquorId', authMiddleware, preferenceController.addDislikedLiquor);
router.delete('/dislikes/liquors/:liquorId', authMiddleware, preferenceController.removeDislikedLiquor);
router.get('/dislikes/liquors', authMiddleware, preferenceController.getDislikedLiquors);

// 재료 비선호 관리
router.post('/dislikes/ingredients/:ingredientId', authMiddleware, preferenceController.addDislikedIngredient);
router.delete('/dislikes/ingredients/:ingredientId', authMiddleware, preferenceController.removeDislikedIngredient);
router.get('/dislikes/ingredients', authMiddleware, preferenceController.getDislikedIngredients);

module.exports = router;
