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
 * Predict pairing score for a liquor and ingredient
 */
exports.predictPairingScore = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.body;
    
    console.log('Predict pairing request body:', req.body);
    
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide both liquorId and ingredientId in the request body' 
      });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    console.log(`Processing pairing prediction for liquorId: ${liquorIdNum}, ingredientId: ${ingredientIdNum}`);
    
    const [liquor, ingredient] = await Promise.all([
      Liquor.getById(liquorIdNum),
      Ingredient.getById(ingredientIdNum)
    ]);
    
    console.log('Liquor found:', liquor ? 'Yes' : 'No');
    console.log('Ingredient found:', ingredient ? 'Yes' : 'No');
    
    if (!liquor || !ingredient) {
      return res.status(404).json({ 
        success: false, 
        error: `${!liquor ? 'Liquor' : 'Ingredient'} not found with the provided ID` 
      });
    }
    
    console.log('Calling AI model to get pairing score...');
    const score = await getPairingScore(liquorIdNum, ingredientIdNum);
    console.log('Pairing score result:', score);
    
    return res.json({
      success: true,
      data: {
        score,
        liquor: {
          id: liquor.id,
          name: liquor.name
        },
        ingredient: {
          id: ingredient.id,
          name: ingredient.name
        }
      }
    });
    
  } catch (error) {
    console.error('Error in predictPairingScore controller:', error);
    console.error(error.stack);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Predict pairing score with Korean input
 */
exports.predictPairingScoreKorean = async (req, res) => {
  try {
    const { liquor, ingredient } = req.body;
    
    console.log('Korean pairing request:', { liquor, ingredient });
    
    if (!liquor || !ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명과 재료명을 모두 입력해주세요' 
      });
    }
    
    // Convert Korean to node_ids
    const mappingResult = koreanMapper.getNodeIdByKorean(liquor, ingredient);
    
    if (!mappingResult.liquorNodeId || !mappingResult.ingredientNodeId) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        korean_input: { liquor, ingredient },
        suggestions: mappingResult.suggestions
      });
    }
    
    console.log('Mapped to node_ids:', {
      liquor: mappingResult.liquorNodeId,
      ingredient: mappingResult.ingredientNodeId
    });
    
    // Get score from AI model using node_ids - SINGLE CALL
    const aiResponse = await getPairingScore(mappingResult.liquorNodeId, mappingResult.ingredientNodeId);
    console.log('AI server response:', aiResponse);
    
    // AI 서버 응답 구조 확인 및 처리
    let rawScore, explanation, gptExplanation;
    
    if (typeof aiResponse === 'object' && aiResponse.score !== undefined) {
      // AI 서버가 완전한 객체로 응답하는 경우 (score, explanation, gpt_explanation)
      rawScore = aiResponse.score;
      explanation = aiResponse.explanation;
      gptExplanation = aiResponse.gpt_explanation;
      
      console.log(`Raw score from AI: ${rawScore}`);
      
    } else if (typeof aiResponse === 'number') {
      // AI 서버가 숫자만 응답하는 경우
      rawScore = aiResponse;
      explanation = null;
      gptExplanation = null;
      console.log(`Raw score from AI: ${rawScore}`);
      
    } else {
      console.error('Unexpected AI response format:', aiResponse);
      rawScore = 0;
      explanation = null;
      gptExplanation = null;
    }
    
    // 점수를 0-100 범위로 정규화
    const normalizedScore = normalizeScoreTo100(rawScore);
    console.log(`Raw score: ${rawScore}, Normalized to 100-scale: ${normalizedScore}`);
    
    // Get liquor and ingredient details using getByNodeId
    const [liquorDetails, ingredientDetails] = await Promise.all([
      Liquor.getByNodeId(mappingResult.liquorNodeId),
      Ingredient.getByNodeId(mappingResult.ingredientNodeId)
    ]);
    
    console.log('Liquor.getByNodeId: Looking for node_id =', mappingResult.liquorNodeId);
    console.log('Ingredient.getByNodeId: Looking for node_id =', mappingResult.ingredientNodeId);
    console.log('Ingredient.getByNodeId: Found', ingredientDetails ? ingredientDetails.length || 'object' : '0', 'rows');
    console.log('Liquor.getByNodeId: Found', liquorDetails ? liquorDetails.length || 'object' : '0', 'rows');
    
    // Check if we found the details
    if (!liquorDetails || !ingredientDetails) {
      console.warn('Could not find liquor or ingredient details in database');
    }
    
    // fallback 설명 생성 - GPT 설명이 있으면 우선 사용
    const finalExplanation = gptExplanation || explanation || 
      `${liquor}과 ${ingredient}의 조합은 ${normalizedScore}점입니다. ${
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
        english_names: {
          liquor: mappingResult.liquorName,
          ingredient: mappingResult.ingredientName
        },
        node_ids: {
          liquor: mappingResult.liquorNodeId,
          ingredient: mappingResult.ingredientNodeId
        },
        score: normalizedScore,
        raw_score: rawScore,
        score_range: SCORE_RANGE,
        explanation: finalExplanation,
        gpt_explanation: gptExplanation,
        compatibility_level: compatibilityLevel,
        ai_response: aiResponse // 디버깅용
      }
    });
    
  } catch (error) {
    console.error('Error in Korean pairing prediction:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

/**
 * Get score statistics for calibrating normalization range
 */
exports.getScoreStatistics = async (req, res) => {
  try {
    const sampleSize = 20; // 샘플 점수들
    const scores = [];
    
    console.log('Collecting score statistics for calibration...');
    
    // 몇 가지 샘플 페어링의 점수를 수집
    const samplePairs = [
      { liquor: 75, ingredient: 361 },   // ale + beef
      { liquor: 423, ingredient: 361 },  // beer + beef  
      { liquor: 75, ingredient: 100 },   // ale + random ingredient
      { liquor: 524, ingredient: 22 },   // 다른 조합들..
      { liquor: 75, ingredient: 200 },
      { liquor: 75, ingredient: 300 },
      { liquor: 423, ingredient: 100 },
      { liquor: 423, ingredient: 200 },
      { liquor: 524, ingredient: 100 },
      { liquor: 524, ingredient: 200 },
      { liquor: 100, ingredient: 361 },
      { liquor: 200, ingredient: 361 },
      { liquor: 300, ingredient: 361 },
      { liquor: 400, ingredient: 361 },
      { liquor: 500, ingredient: 361 },
      { liquor: 75, ingredient: 400 },
      { liquor: 75, ingredient: 500 },
      { liquor: 423, ingredient: 300 },
      { liquor: 423, ingredient: 400 },
      { liquor: 524, ingredient: 300 }
    ];
    
    for (const pair of samplePairs) {
      try {
        const response = await getPairingScore(pair.liquor, pair.ingredient);
        const score = typeof response === 'object' ? response.score : response;
        scores.push(score);
        console.log(`Score for ${pair.liquor}-${pair.ingredient}: ${score}`);
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
        statistics: {
          min: minScore,
          max: maxScore,
          average: avgScore,
          count: scores.length
        },
        current_range: SCORE_RANGE,
        recommended_range: {
          min: Math.floor(minScore - 0.5),
          max: Math.ceil(maxScore + 0.5)
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting score statistics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to collect score statistics'
    });
  }
};

// 나머지 함수들 계속...
exports.findBestPairingKorean = async (req, res) => {
  try {
    const { liquor, ingredient } = req.body;
    
    console.log('Best pairing request:', { liquor, ingredient });
    
    if (!liquor || !ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명과 재료명을 모두 입력해주세요' 
      });
    }
    
    const liquorResults = koreanMapper.searchByKorean(liquor, 'liquor');
    const ingredientResults = koreanMapper.searchByKorean(ingredient, 'ingredient');
    
    if (liquorResults.length === 0 || ingredientResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        korean_input: { liquor, ingredient },
        suggestions: {
          liquors: liquorResults,
          ingredients: ingredientResults
        }
      });
    }
    
    console.log(`Found ${liquorResults.length} liquor matches, ${ingredientResults.length} ingredient matches`);
    
    let bestCombination = null;
    let bestScore = -Infinity;
    const testedCombinations = [];
    
    const maxLiquors = Math.min(20, liquorResults.length);
    const maxIngredients = Math.min(20, ingredientResults.length);
    
    for (let i = 0; i < maxLiquors; i++) {
      for (let j = 0; j < maxIngredients; j++) {
        const liquorCandidate = liquorResults[i];
        const ingredientCandidate = ingredientResults[j];
        
        try {
          const aiResponse = await getPairingScore(liquorCandidate.nodeId, ingredientCandidate.nodeId);
          const rawScore = typeof aiResponse === 'object' ? aiResponse.score : aiResponse;
          const normalizedScore = normalizeScoreTo100(rawScore);
          
          const combination = {
            liquor: liquorCandidate,
            ingredient: ingredientCandidate,
            score: normalizedScore,
            raw_score: rawScore
          };
          
          testedCombinations.push(combination);
          
          if (normalizedScore > bestScore) {
            bestScore = normalizedScore;
            bestCombination = combination;
          }
          
        } catch (error) {
          console.error(`Error testing combination ${liquorCandidate.name} + ${ingredientCandidate.name}:`, error);
        }
      }
    }
    
    if (!bestCombination) {
      return res.status(500).json({
        success: false,
        error: '페어링 점수를 계산할 수 없습니다'
      });
    }
    
    let explanation;
    try {
      explanation = await getExplanation(bestCombination.liquor.nodeId, bestCombination.ingredient.nodeId, bestCombination.score / 100);
    } catch (explanationError) {
      explanation = {
        explanation: `${liquor}과 ${ingredient}의 최적 조합인 ${bestCombination.liquor.name}과 ${bestCombination.ingredient.name}은 ${bestScore}점을 받았습니다.`,
        compatibility_level: bestScore >= 80 ? "강력 추천 조합" : 
                            bestScore >= 60 ? "추천 조합" : 
                            bestScore >= 40 ? "무난한 조합" : "실험적인 조합"
      };
    }
    
    const sortedCombinations = testedCombinations
      .map(combo => ({
        liquor: combo.liquor.name,
        ingredient: combo.ingredient.name,
        score: combo.score,
        raw_score: combo.raw_score
      }))
      .sort((a, b) => b.score - a.score);
    
    return res.json({
      success: true,
      data: {
        korean_input: { liquor, ingredient },
        best_combination: {
          score: bestScore,
          raw_score: bestCombination.raw_score,
          explanation: explanation.explanation || explanation.reason,
          compatibility_level: explanation.compatibility_level
        },
        all_tested_combinations: sortedCombinations.slice(0, 20),
        score_range: SCORE_RANGE
      }
    });
    
  } catch (error) {
    console.error('Error in findBestPairingKorean:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

exports.getRecommendationsKorean = async (req, res) => {
  try {
    const { liquor } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 3), 3); // 최대 3개로 제한
    
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
    
    console.log(`Calling AI server for recommendations: liquorId=${liquorNodeId}, limit=${limit}`);
    const recommendations = await getRecommendations(liquorNodeId, limit);
    console.log('AI server recommendations:', recommendations);
    
    // AI 서버 응답 처리
    let finalRecommendations = [];
    let overallExplanation = null;
    
    if (recommendations && typeof recommendations === 'object') {
      // AI 서버가 객체로 응답하는 경우
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
        // 배열 형태로 오는 경우
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
    console.error('Error in Korean recommendations:', error);
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
      data: {
        query,
        type,
        results
      }
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
      data: {
        score: normalizedScore,
        raw_score: rawScore
      }
    });
    
  } catch (error) {
    console.error('Error in pairing score controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getRecommendationsForLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || 3), 3); // 최대 3개로 제한
    
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
      data: {
        recommendations: result
      }
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