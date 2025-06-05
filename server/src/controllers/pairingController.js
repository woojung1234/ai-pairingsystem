const { getPairingScore, getPairingScoreOnly, getExplanationOnly, getRecommendations, getExplanation } = require('../ai/model');
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
 * 최고 페어링 찾기 - 점수만 계산하고 GPT 설명은 나중에 (토큰 최적화)
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
  
  // 모든 조합을 점수만 계산 (GPT 설명 없이)
  for (let i = 0; i < maxLiquors; i++) {
    for (let j = 0; j < maxIngredients; j++) {
      const liquor = liquorResults[i];
      const ingredient = ingredientResults[j];
      
      try {
        console.log(`🔬 Testing: ${liquor.name} (${liquor.nodeId}) + ${ingredient.name} (${ingredient.nodeId})`);
        
        // 점수만 가져오기 (GPT 호출 없음)
        const rawScore = await getPairingScoreOnly(liquor.nodeId, ingredient.nodeId);
        const normalizedScore = normalizeScoreTo100(rawScore);
        
        const combination = {
          liquor,
          ingredient,
          rawScore,
          normalizedScore
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

/**
 * 최종 선택된 조합에 대해서만 GPT 설명 추가 (토큰 절약)
 * @param {Object} bestCombination - 최고 점수 조합
 * @param {String} koreanLiquor - 한글 주류명
 * @param {String} koreanIngredient - 한글 재료명
 * @returns {Object} GPT 설명이 포함된 조합 정보
 */
const addGPTExplanationToBest = async (bestCombination, koreanLiquor, koreanIngredient) => {
  console.log(`🤖 Getting GPT explanation for best combination only...`);
  
  try {
    // 최종 선택된 조합에만 GPT 설명 요청
    const explanation = await getExplanationOnly(
      bestCombination.liquor.nodeId, 
      bestCombination.ingredient.nodeId, 
      bestCombination.rawScore
    );
    
    return {
      ...bestCombination,
      gptExplanation: explanation.gpt_explanation || explanation.explanation,
      compatibilityLevel: bestCombination.normalizedScore >= 80 ? "강력 추천 조합" : 
                         bestCombination.normalizedScore >= 60 ? "추천 조합" : 
                         bestCombination.normalizedScore >= 40 ? "무난한 조합" : "실험적인 조합"
    };
  } catch (error) {
    console.error('❌ Error getting GPT explanation:', error);
    
    // GPT 설명 실패시 fallback 설명 생성
    const fallbackExplanation = `${koreanLiquor}과 ${koreanIngredient}의 최적 조합은 ${bestCombination.liquor.name}과 ${bestCombination.ingredient.name}입니다. 이 조합은 ${bestCombination.normalizedScore}점을 받았습니다. ${
      bestCombination.normalizedScore >= 80 ? "매우 훌륭한 조합으로, 맛과 향이 완벽하게 조화를 이룹니다." :
      bestCombination.normalizedScore >= 60 ? "좋은 페어링으로, 여러 풍미 요소가 잘 어울립니다." :
      bestCombination.normalizedScore >= 40 ? "무난한 조합이지만 특별함은 부족합니다." :
      "이 조합은 그다지 잘 어울리지 않습니다."
    }`;
    
    return {
      ...bestCombination,
      gptExplanation: fallbackExplanation,
      compatibilityLevel: bestCombination.normalizedScore >= 80 ? "강력 추천 조합" : 
                         bestCombination.normalizedScore >= 60 ? "추천 조합" : 
                         bestCombination.normalizedScore >= 40 ? "무난한 조합" : "실험적인 조합"
    };
  }
};

// Export 함수들...
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
 * 한글 입력으로 최고 페어링 찾기 - 토큰 최적화 버전
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
    
    // 1단계: 최고 페어링 찾기 (점수만 계산, GPT 설명 없음)
    const pairingResult = await findBestPairing(liquor, ingredient);
    
    if (!pairingResult || !pairingResult.bestCombination) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        korean_input: { liquor, ingredient }
      });
    }
    
    const { bestCombination, testedCombinations } = pairingResult;
    
    // 2단계: 최종 선택된 조합에만 GPT 설명 추가
    const bestWithExplanation = await addGPTExplanationToBest(bestCombination, liquor, ingredient);
    
    console.log('✨ Best combination with explanation:', {
      liquor: bestWithExplanation.liquor.name,
      ingredient: bestWithExplanation.ingredient.name,
      score: bestWithExplanation.normalizedScore
    });
    
    return res.json({
      success: true,
      data: {
        korean_input: { liquor, ingredient },
        best_pairing: {
          liquor: bestWithExplanation.liquor.name,
          ingredient: bestWithExplanation.ingredient.name,
          liquor_korean: liquor,
          ingredient_korean: ingredient
        },
        english_names: {
          liquor: bestWithExplanation.liquor.name,
          ingredient: bestWithExplanation.ingredient.name
        },
        node_ids: {
          liquor: bestWithExplanation.liquor.nodeId,
          ingredient: bestWithExplanation.ingredient.nodeId
        },
        score: bestWithExplanation.normalizedScore,
        raw_score: bestWithExplanation.rawScore,
        score_range: SCORE_RANGE,
        explanation: bestWithExplanation.gptExplanation,
        compatibility_level: bestWithExplanation.compatibilityLevel,
        search_summary: {
          tested_combinations: testedCombinations.length,
          total_combinations: testedCombinations.length,
          best_score: bestWithExplanation.normalizedScore,
          gpt_calls_made: 1, // 오직 1번만 GPT 호출
          token_optimization: "Only best combination uses GPT explanation"
        },
        all_tested_combinations: testedCombinations.map(combo => ({
          liquor: combo.liquor.name,
          ingredient: combo.ingredient.name,
          score: combo.normalizedScore,
          raw_score: combo.rawScore
          // GPT 설명은 최고 조합에만 포함
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
        const score = await getPairingScoreOnly(pair.liquor, pair.ingredient);
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
    
    // 1단계: 최고 페어링 찾기 (점수만 계산)
    const pairingResult = await findBestPairing(liquor, ingredient);
    
    if (!pairingResult || !pairingResult.bestCombination) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        korean_input: { liquor, ingredient }
      });
    }
    
    const { bestCombination, testedCombinations } = pairingResult;
    
    // 2단계: 최종 선택된 조합에만 GPT 설명 추가
    const bestWithExplanation = await addGPTExplanationToBest(bestCombination, liquor, ingredient);
    
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
          liquor: bestWithExplanation.liquor.name,
          ingredient: bestWithExplanation.ingredient.name,
          score: bestWithExplanation.normalizedScore,
          raw_score: bestWithExplanation.rawScore,
          explanation: bestWithExplanation.gptExplanation,
          compatibility_level: bestWithExplanation.compatibilityLevel
        },
        all_tested_combinations: sortedCombinations,
        score_range: SCORE_RANGE,
        token_usage: {
          gpt_calls_made: 1,
          explanation: "GPT explanation requested only for best combination"
        }
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
          raw_score: rec.score
          // 개별 설명은 제거 (토큰 절약)
        }));
        overallExplanation = recommendations.overall_explanation;
      } else if (Array.isArray(recommendations)) {
        finalRecommendations = recommendations.map(rec => ({
          ingredient_id: rec.ingredient_id,
          ingredient_name: rec.ingredient_name,
          score: normalizeScoreTo100(rec.score),
          raw_score: rec.score
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
        overall_explanation: overallExplanation, // 전체 설명만 포함
        token_usage: {
          gpt_calls_made: overallExplanation ? 1 : 0,
          explanation: "GPT explanation only for overall recommendations"
        }
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
    
    const rawScore = await getPairingScoreOnly(liquorIdNum, ingredientIdNum);
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
