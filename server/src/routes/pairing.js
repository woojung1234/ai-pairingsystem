const express = require('express');
const router = express.Router();
const pairingController = require('../controllers/pairingController');

/**
 * @route   GET /api/pairing/score/:liquorId/:ingredientId
 * @desc    Get pairing score for a liquor and ingredient
 * @access  Public
 */
router.get('/score/:liquorId/:ingredientId', pairingController.getPairingScoreByIds);

/**
 * @route   GET /api/pairing/recommendations/:liquorId
 * @desc    Get recommended ingredients for a liquor
 * @access  Public
 */
router.get('/recommendations/:liquorId', pairingController.getRecommendationsForLiquor);

/**
 * @route   GET /api/pairing/explanation/:liquorId/:ingredientId
 * @desc    Get explanation for a pairing
 * @access  Public
 */
router.get('/explanation/:liquorId/:ingredientId', pairingController.getExplanationForPairing);

/**
 * @route   GET /api/pairing/top
 * @desc    Get top rated pairings
 * @access  Public
 */
router.get('/top', pairingController.getTopPairings);

/**
 * @route   POST /api/pairing/rate/:pairingId
 * @desc    Rate a pairing
 * @access  Public
 */
router.post('/rate/:pairingId', pairingController.ratePairing);

module.exports = router;
