const { getPairingScore, getRecommendations, getExplanation } = require('../ai/model');
const Pairing = require('../models/Pairing');
const Liquor = require('../models/Liquor');
const Ingredient = require('../models/Ingredient');
const koreanMapper = require('../utils/koreanMapper');

// 점수 정규화를 위한 범위 설정 (실제 데이터에서 확인된 값)
const SCORE_RANGE = {
  min: -5.0,  // 실제 데이터에서 나오는 최소값
  max: 6.0    // 실제 데이터에서 나오는 최대값
};

/**
 * AI 서버 점수를 0-100 범위로 정규화
 * @param {Number} rawScore - AI 서버에서 받은 원본 점수
 * @returns {Number} 0-100 범위로 정규화된 점수
 */
function normalizeScoreTo100(rawScore) {
  if (typeof rawScore !== 'number') return 0;
  
  // 최소값을 0으로, 최대값을 100으로 선형 변환
  const normalized = ((rawScore - SCORE_RANGE.min) / (SCORE_RANGE.max - SCORE_RANGE.min)) * 100;
  
  // 0-100 범위로 제한
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

/**
 * 최고 페어링 찾기 - 모든 조합을 테스트해서 최고 점수 조합 반환
 * @param {String} koreanLiquor - 한글 주류명
 * @param {String} koreanIngredient - 한글 재료명
 * @returns {Object} 최고 점수 조합 정보
 */
const findBestPairing = async (koreanLiquor, koreanIngredient) => {
  console.log(`🔍 Finding best pairing for "${koreanLiquor}" + "${koreanIngredient}"`);
  
  // 한글 이름으로 매칭되는 주류와 재료 찾기
  const liquorResults = koreanMapper.searchByKorean(koreanLiquor, 'liquor');
  const ingredientResults = koreanMapper.searchByKorean(koreanIngredient, 'ingredient');
  
  console.log(`📋 Found ${liquorResults.length} liquor matches, ${ingredientResults.length} ingredient matches`);
  
  if (liquorResults.length === 0 || ingredientResults.length === 0) {
    return null;
  }
  
  let bestScore = -Infinity;
  let bestCombination = null;
  const testedCombinations = [];
  
  // 최대 5x5 = 25개 조합 테스트 (성능 최적화)
  const maxLiquors = Math.min(5, liquorResults.length);
  const maxIngredients = Math.min(5, ingredientResults.length);
  
  console.log(`🧪 Testing ${maxLiquors} x ${maxIngredients} = ${maxLiquors * maxIngredients} combinations`);
  
  // 모든 조합 테스트
  for (let i = 0; i < maxLiquors; i++) {
    for (let j = 0; j < maxIngredients; j++) {
      const liquor = liquorResults[i];
      const ingredient = ingredientResults[j];
      
      try {
        console.log(`🔬 Testing: ${liquor.name} (${liquor.nodeId}) + ${ingredient.name} (${ingredient.nodeId})`);
        
        // AI 서버에서 페어링 점수 가져오기
        const aiResponse = await getPairingScore(liquor.nodeId, ingredient.nodeId);
        const rawScore = typeof aiResponse === 'object' ? aiResponse.score : aiResponse;
        const normalizedScore = normalizeScoreTo100(rawScore);
        
        const combination = {
          liquor,
          ingredient,
          rawScore,
          normalizedScore,
          aiResponse
        };
        
        testedCombinations.push(combination);
        
        console.log(`📊 Score: ${rawScore} (normalized: ${normalizedScore})`);
        
        // 최고 점수 업데이트
        if (rawScore > bestScore) {
          bestScore = rawScore;
          bestCombination = combination;
          console.log(`🏆 New best combination: ${liquor.name} + ${ingredient.name} = ${normalizedScore} points`);
        }
        
      } catch (error) {
        console.error(`❌ Error testing combination ${liquor.name} + ${ingredient.name}:`, error);
      }
    }
  }
  
  if (bestCombination) {
    console.log(`✅ Best pairing found: ${bestCombination.liquor.name} + ${bestCombination.ingredient.name} = ${bestCombination.normalizedScore} points`);
  }
  
  return {
    bestCombination,
    testedCombinations: testedCombinations.sort((a, b) => b.rawScore - a.rawScore).slice(0, 10) // Top 10
  };
};

// 나머지 export 함수들...
exports.predictPairingScore = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.body;
    
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide both liquorId and ingredientId in the request body' 
      });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    const [liquor, ingredient] = await Promise.all([
      Liquor.getById(liquorIdNum),
      Ingredient.getById(ingredientIdNum)
    ]);
    
    if (!liquor || !ingredient) {
      return res.status(404).json({ 
        success: false, 
        error: `${!liquor ? 'Liquor' : 'Ingredient'} not found with the provided ID` 
      });
    }
    
    const score = await getPairingScore(liquorIdNum, ingredientIdNum);
    
    return res.json({
      success: true,
      data: {
        score,
        liquor: { id: liquor.id, name: liquor.name },
        ingredient: { id: ingredient.id, name: ingredient.name }
      }
    });
    
  } catch (error) {
    console.error('Error in predictPairingScore controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * 한글 입력으로 최고 페어링 찾기 - 메인 API
 */
exports.predictPairingScoreKorean = async (req, res) => {
  try {
    const { liquor, ingredient } = req.body;
    
    console.log('🚀 Korean pairing request:', { liquor, ingredient });
    
    if (!liquor || !ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명과 재료명을 모두 입력해주세요' 
      });
    }
    
    // 최고 페어링 찾기
    const pairingResult = await findBestPairing(liquor, ingredient);
    
    if (!pairingResult || !pairingResult.bestCombination) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        korean_input: { liquor, ingredient }
      });
    }
    
    const { bestCombination, testedCombinations } = pairingResult;
    const { liquor: bestLiquor, ingredient: bestIngredient, rawScore, normalizedScore, aiResponse } = bestCombination;
    
    // GPT 설명 추출
    let explanation, gptExplanation;
    
    if (typeof aiResponse === 'object' && aiResponse.gpt_explanation) {
      gptExplanation = aiResponse.gpt_explanation;
      explanation = aiResponse.explanation;
    }
    
    // fallback 설명 생성
    const finalExplanation = gptExplanation || explanation || 
      `${liquor}과 ${ingredient}의 최적 조합은 ${bestLiquor.name}과 ${bestIngredient.name}입니다. 이 조합은 ${normalizedScore}점을 받았습니다. ${
        normalizedScore >= 80 ? "매우 훌륭한 조합으로, 맛과 향이 완벽하게 조화를 이룹니다." :
        normalizedScore >= 60 ? "좋은 페어링으로, 여러 풍미 요소가 잘 어울립니다." :
        normalizedScore >= 40 ? "무난한 조합이지만 특별함은 부족합니다." :
        "이 조합은 그다지 잘 어울리지 않습니다."
      }`;
    
    // 호환성 레벨 결정
    const compatibilityLevel = normalizedScore >= 80 ? "강력 추천 조합" : 
                              normalizedScore >= 60 ? "추천 조합" : 
                              normalizedScore >= 40 ? "무난한 조합" : "실험적인 조합";
    
    return res.json({
      success: true,
      data: {
        korean_input: { liquor, ingredient },
        best_pairing: {
          liquor: bestLiquor.name,
          ingredient: bestIngredient.name,
          liquor_korean: liquor,
          ingredient_korean: ingredient
        },
        english_names: {
          liquor: bestLiquor.name,
          ingredient: bestIngredient.name
        },
        node_ids: {
          liquor: bestLiquor.nodeId,
          ingredient: bestIngredient.nodeId
        },
        score: normalizedScore,
        raw_score: rawScore,
        score_range: SCORE_RANGE,
        explanation: finalExplanation,
        gpt_explanation: gptExplanation,
        compatibility_level: compatibilityLevel,
        search_summary: {
          tested_combinations: testedCombinations.length,
          total_combinations: testedCombinations.length,
          best_score: normalizedScore
        },
        all_tested_combinations: testedCombinations.map(combo => ({
          liquor: combo.liquor.name,
          ingredient: combo.ingredient.name,
          score: combo.normalizedScore,
          raw_score: combo.rawScore
        })).slice(0, 10) // Top 10만 반환
      }
    });
    
  } catch (error) {
    console.error('❌ Error in Korean pairing prediction:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

exports.getScoreStatistics = async (req, res) => {
  try {
    const scores = [];
    const samplePairs = [
      { liquor: 75, ingredient: 361 },
      { liquor: 423, ingredient: 361 },
      { liquor: 75, ingredient: 100 },
      { liquor: 524, ingredient: 22 },
      { liquor: 75, ingredient: 200 },
      { liquor: 75, ingredient: 300 },
      { liquor: 423, ingredient: 100 },
      { liquor: 423, ingredient: 200 },
      { liquor: 524, ingredient: 100 },
      { liquor: 524, ingredient: 200 }
    ];
    
    for (const pair of samplePairs) {
      try {
        const response = await getPairingScore(pair.liquor, pair.ingredient);
        const score = typeof response === 'object' ? response.score : response;
        scores.push(score);
      } catch (error) {
        console.error(`Error getting score for ${pair.liquor}-${pair.ingredient}:`, error);
      }
    }
    
    if (scores.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No scores collected'
      });
    }
    
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return res.json({
      success: true,
      data: {
        sample_scores: scores,
        statistics: { min: minScore, max: maxScore, average: avgScore, count: scores.length },
        current_range: SCORE_RANGE,
        recommended_range: { min: Math.floor(minScore - 0.5), max: Math.ceil(maxScore + 0.5) }
      }
    });
    
  } catch (error) {
    console.error('Error getting score statistics:', error);
    return res.status(500).json({ success: false, error: 'Failed to collect score statistics' });
  }
};

exports.findBestPairingKorean = async (req, res) => {
  try {
    const { liquor, ingredient } = req.body;
    
    if (!liquor || !ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명과 재료명을 모두 입력해주세요' 
      });
    }
    
    const pairingResult = await findBestPairing(liquor, ingredient);
    
    if (!pairingResult || !pairingResult.bestCombination) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        korean_input: { liquor, ingredient }
      });
    }
    
    const { bestCombination, testedCombinations } = pairingResult;
    
    let explanation;
    try {
      explanation = await getExplanation(
        bestCombination.liquor.nodeId, 
        bestCombination.ingredient.nodeId, 
        bestCombination.normalizedScore / 100
      );
    } catch (explanationError) {
      explanation = {
        explanation: `${liquor}과 ${ingredient}의 최적 조합인 ${bestCombination.liquor.name}과 ${bestCombination.ingredient.name}은 ${bestCombination.normalizedScore}점을 받았습니다.`,
        compatibility_level: bestCombination.normalizedScore >= 80 ? "강력 추천 조합" : 
                            bestCombination.normalizedScore >= 60 ? "추천 조합" : 
                            bestCombination.normalizedScore >= 40 ? "무난한 조합" : "실험적인 조합"
      };
    }
    
    const sortedCombinations = testedCombinations
      .map(combo => ({
        liquor: combo.liquor.name,
        ingredient: combo.ingredient.name,
        score: combo.normalizedScore,
        raw_score: combo.rawScore
      }))
      .sort((a, b) => b.score - a.score);
    
    return res.json({
      success: true,
      data: {
        korean_input: { liquor, ingredient },
        best_combination: {
          liquor: bestCombination.liquor.name,
          ingredient: bestCombination.ingredient.name,
          score: bestCombination.normalizedScore,
          raw_score: bestCombination.rawScore,
          explanation: explanation.explanation || explanation.reason,
          compatibility_level: explanation.compatibility_level
        },
        all_tested_combinations: sortedCombinations,
        score_range: SCORE_RANGE
      }
    });
    
  } catch (error) {
    console.error('❌ Error in findBestPairingKorean:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

exports.getRecommendationsKorean = async (req, res) => {
  try {
    const { liquor } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 3), 3);
    
    if (!liquor) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명을 입력해주세요' 
      });
    }
    
    const liquorResults = koreanMapper.searchByKorean(liquor, 'liquor');
    
    if (liquorResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류를 찾을 수 없습니다',
        korean_input: liquor
      });
    }
    
    const liquorNodeId = liquorResults[0].nodeId;
    const recommendations = await getRecommendations(liquorNodeId, limit);
    
    let finalRecommendations = [];
    let overallExplanation = null;
    
    if (recommendations && typeof recommendations === 'object') {
      if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
        finalRecommendations = recommendations.recommendations.map(rec => ({
          ingredient_id: rec.ingredient_id,
          ingredient_name: rec.ingredient_name,
          score: normalizeScoreTo100(rec.score),
          raw_score: rec.score,
          explanation: rec.explanation
        }));
        overallExplanation = recommendations.overall_explanation;
      } else if (Array.isArray(recommendations)) {
        finalRecommendations = recommendations.map(rec => ({
          ingredient_id: rec.ingredient_id,
          ingredient_name: rec.ingredient_name,
          score: normalizeScoreTo100(rec.score),
          raw_score: rec.score,
          explanation: rec.explanation
        }));
      }
    }
    
    return res.json({
      success: true,
      data: {
        korean_input: liquor,
        liquor_name: recommendations.liquor_name || liquorResults[0].name,
        english_name: liquorResults[0].name,
        liquor_node_id: liquorNodeId,
        recommendations: finalRecommendations,
        overall_explanation: overallExplanation
      }
    });
    
  } catch (error) {
    console.error('❌ Error in Korean recommendations:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

exports.searchByKorean = async (req, res) => {
  try {
    const { query, type = 'both' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '검색어를 입력해주세요'
      });
    }
    
    const results = koreanMapper.searchByKorean(query, type);
    
    return res.json({
      success: true,
      data: { query, type, results }
    });
    
  } catch (error) {
    console.error('Error in Korean search:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

exports.getPairingScoreByIds = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.params;
    
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ success: false, error: 'Please provide liquor and ingredient IDs' });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    const aiResponse = await getPairingScore(liquorIdNum, ingredientIdNum);
    const rawScore = typeof aiResponse === 'object' ? aiResponse.score : aiResponse;
    const normalizedScore = normalizeScoreTo100(rawScore);
    
    return res.json({
      success: true,
      data: { score: normalizedScore, raw_score: rawScore }
    });
    
  } catch (error) {
    console.error('Error in pairing score controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getRecommendationsForLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || 3), 3);
    
    if (!liquorId) {
      return res.status(400).json({ success: false, error: 'Please provide a liquor ID' });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const recommendations = await getRecommendations(liquorIdNum, limit);
    
    let result = [];
    
    if (recommendations && typeof recommendations === 'object') {
      if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
        result = recommendations.recommendations.map(rec => ({
          score: normalizeScoreTo100(rec.score),
          raw_score: rec.score,
          ingredient_id: rec.ingredient_id
        }));
      } else if (Array.isArray(recommendations)) {
        result = recommendations.map(rec => ({
          score: normalizeScoreTo100(rec.score),
          raw_score: rec.score,
          ingredient_id: rec.ingredient_id
        }));
      }
    }
    
    return res.json({
      success: true,
      data: { recommendations: result }
    });
    
  } catch (error) {
    console.error('Error in pairing recommendations controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getExplanationForPairing = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.params;
    
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ success: false, error: 'Please provide liquor and ingredient IDs' });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
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

exports.getTopPairings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 10);
    const topPairings = await Pairing.getTopPairings(limit);
    
    return res.json({
      success: true,
      data: topPairings
    });
    
  } catch (error) {
    console.error('Error in top pairings controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.ratePairing = async (req, res) => {
  try {
    const { pairingId } = req.params;
    const { rating } = req.body;
    
    if (!pairingId) {
      return res.status(400).json({ success: false, error: 'Please provide a pairing ID' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid rating between 1 and 5' 
      });
    }
    
    const updated = await Pairing.updateRating(pairingId, rating);
    
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Pairing not found' });
    }
    
    return res.json({
      success: true,
      message: 'Rating saved successfully'
    });
    
  } catch (error) {
    console.error('Error in rate pairing controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
