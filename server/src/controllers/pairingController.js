const { getPairingScore, getRecommendations, getExplanation } = require('../ai/model');
const Pairing = require('../models/Pairing');
const Liquor = require('../models/Liquor');
const Ingredient = require('../models/Ingredient');

/**
 * Get pairing score for a liquor and ingredient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with pairing score and details
 */
exports.getPairingScoreByIds = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.params;
    
    // Validate IDs
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ success: false, error: 'Please provide liquor and ingredient IDs' });
    }
    
    // Convert to numbers
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    // Check if we already have this pairing in database
    let existingPairing = await Pairing.findOne({
      liquor: liquorIdNum,
      ingredient: ingredientIdNum
    }).populate('liquor ingredient');
    
    if (existingPairing) {
      return res.json({
        success: true,
        data: {
          score: existingPairing.score,
          reason: existingPairing.reason,
          liquor: existingPairing.liquor,
          ingredient: existingPairing.ingredient
        }
      });
    }
    
    // Get score from AI model
    const score = await getPairingScore(liquorIdNum, ingredientIdNum);
    
    // Get liquor and ingredient details
    const [liquor, ingredient] = await Promise.all([
      Liquor.findOne({ liquor_id: liquorIdNum }),
      Ingredient.findOne({ ingredient_id: ingredientIdNum })
    ]);
    
    if (!liquor || !ingredient) {
      return res.status(404).json({ 
        success: false, 
        error: `${!liquor ? 'Liquor' : 'Ingredient'} not found` 
      });
    }
    
    // Get explanation
    const explanation = await getExplanation(liquorIdNum, ingredientIdNum);
    
    // Create new pairing record
    const newPairing = await Pairing.create({
      liquor: liquor._id,
      ingredient: ingredient._id,
      score,
      reason: explanation.explanation
    });
    
    return res.json({
      success: true,
      data: {
        score,
        reason: explanation.explanation,
        liquor,
        ingredient
      }
    });
    
  } catch (error) {
    console.error('Error in pairing score controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Get recommended ingredients for a liquor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with recommendations
 */
exports.getRecommendationsForLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const limit = parseInt(req.query.limit || 10);
    
    // Validate ID
    if (!liquorId) {
      return res.status(400).json({ success: false, error: 'Please provide a liquor ID' });
    }
    
    // Convert to number
    const liquorIdNum = parseInt(liquorId);
    
    // Get liquor details
    const liquor = await Liquor.findOne({ liquor_id: liquorIdNum });
    
    if (!liquor) {
      return res.status(404).json({ success: false, error: 'Liquor not found' });
    }
    
    // Get recommendations from AI model
    const recommendations = await getRecommendations(liquorIdNum, limit);
    
    // Get ingredient details for all recommendations
    const ingredientIds = recommendations.map(r => r.ingredient_id);
    const ingredients = await Ingredient.find({ ingredient_id: { $in: ingredientIds } });
    
    // Match ingredients with scores
    const result = recommendations.map(rec => {
      const ingredient = ingredients.find(i => i.ingredient_id === rec.ingredient_id);
      return {
        score: rec.score,
        ingredient: ingredient || { ingredient_id: rec.ingredient_id, name: 'Unknown' }
      };
    });
    
    return res.json({
      success: true,
      data: {
        liquor,
        recommendations: result
      }
    });
    
  } catch (error) {
    console.error('Error in pairing recommendations controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Get explanation for a pairing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with explanation
 */
exports.getExplanationForPairing = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.params;
    
    // Validate IDs
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ success: false, error: 'Please provide liquor and ingredient IDs' });
    }
    
    // Convert to numbers
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    // Get explanation from AI model
    const explanation = await getExplanation(liquorIdNum, ingredientIdNum);
    
    return res.json({
      success: true,
      data: explanation
    });
    
  } catch (error) {
    console.error('Error in pairing explanation controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Get top pairings by user ratings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with top rated pairings
 */
exports.getTopPairings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 10);
    
    // Find top rated pairings
    const topPairings = await Pairing.find({ user_rating: { $exists: true } })
      .sort({ user_rating: -1, score: -1 })
      .limit(limit)
      .populate('liquor ingredient');
    
    return res.json({
      success: true,
      data: topPairings
    });
    
  } catch (error) {
    console.error('Error in top pairings controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Rate a pairing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with updated pairing
 */
exports.ratePairing = async (req, res) => {
  try {
    const { pairingId } = req.params;
    const { rating } = req.body;
    
    // Validate input
    if (!pairingId) {
      return res.status(400).json({ success: false, error: 'Please provide a pairing ID' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid rating between 1 and 5' 
      });
    }
    
    // Find and update the pairing
    const pairing = await Pairing.findById(pairingId);
    
    if (!pairing) {
      return res.status(404).json({ success: false, error: 'Pairing not found' });
    }
    
    pairing.user_rating = rating;
    await pairing.save();
    
    return res.json({
      success: true,
      data: pairing
    });
    
  } catch (error) {
    console.error('Error in rate pairing controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
