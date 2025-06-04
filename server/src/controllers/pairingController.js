const { getPairingScore, getRecommendations, getExplanation } = require('../ai/model');
const Pairing = require('../models/Pairing');
const Liquor = require('../models/Liquor');
const Ingredient = require('../models/Ingredient');
const koreanMapper = require('../utils/koreanMapper');

/**
 * Predict pairing score for a liquor and ingredient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with pairing score and details
 */
exports.predictPairingScore = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.body;
    
    // 요청 내용 로깅
    console.log('Predict pairing request body:', req.body);
    
    // Validate input
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide both liquorId and ingredientId in the request body' 
      });
    }
    
    // Convert to numbers
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    // 변환된 ID 로깅
    console.log(`Processing pairing prediction for liquorId: ${liquorIdNum}, ingredientId: ${ingredientIdNum}`);
    
    // Get liquor and ingredient details - getById 메소드 사용
    const [liquor, ingredient] = await Promise.all([
      Liquor.getById(liquorIdNum),
      Ingredient.getById(ingredientIdNum)
    ]);
    
    // 조회 결과 로깅
    console.log('Liquor found:', liquor ? 'Yes' : 'No');
    console.log('Ingredient found:', ingredient ? 'Yes' : 'No');
    
    if (!liquor || !ingredient) {
      return res.status(404).json({ 
        success: false, 
        error: `${!liquor ? 'Liquor' : 'Ingredient'} not found with the provided ID` 
      });
    }
    
    // Get score from AI model
    console.log('Calling AI model to get pairing score...');
    const score = await getPairingScore(liquorIdNum, ingredientIdNum);
    console.log('Pairing score result:', score);
    
    // 간단한 응답 구조로 변경
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
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.predictPairingScoreKorean = async (req, res) => {
  try {
    const { liquor, ingredient } = req.body;
    
    console.log('Korean pairing request:', { liquor, ingredient });
    
    // Validate input
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
    
    console.log(`Calling AI server for liquorId=${mappingResult.liquorNodeId}, ingredientId=${mappingResult.ingredientNodeId}`);
    
    // Get score from AI model using node_ids
    const aiResponse = await getPairingScore(mappingResult.liquorNodeId, mappingResult.ingredientNodeId);
    console.log('AI server response:', aiResponse);
    
    // AI 서버 응답 구조 확인 및 처리
    let score, explanation, gptExplanation;
    
    if (typeof aiResponse === 'object' && aiResponse.score !== undefined) {
      // AI 서버가 객체로 응답하는 경우
      score = aiResponse.score;
      explanation = aiResponse.explanation;
      gptExplanation = aiResponse.gpt_explanation;
    } else if (typeof aiResponse === 'number') {
      // AI 서버가 숫자만 응답하는 경우
      score = aiResponse;
      explanation = null;
      gptExplanation = null;
    } else {
      console.error('Unexpected AI response format:', aiResponse);
      score = 0;
      explanation = null;
      gptExplanation = null;
    }
    
    // 점수 정규화 (0-1 범위를 0-100% 범위로)
    const normalizedScore = Math.max(0, Math.min(1, score / 5.0)); // 5점 만점을 1로 정규화
    console.log(`Raw score: ${score}, Normalized score: ${normalizedScore.toFixed(4)}`);
    
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
    
    // fallback 설명 생성
    const fallbackExplanation = gptExplanation || explanation || 
      `${liquor}과 ${ingredient}의 조합은 ${(normalizedScore * 100).toFixed(0)}% 호환성을 보입니다. ${
        normalizedScore >= 0.8 ? "매우 훌륭한 조합으로, 맛과 향이 완벽하게 조화를 이룹니다." :
        normalizedScore >= 0.6 ? "좋은 페어링으로, 여러 풍미 요소가 잘 어울립니다." :
        normalizedScore >= 0.4 ? "무난한 조합이지만 특별함은 부족합니다." :
        "이 조합은 그다지 잘 어울리지 않습니다."
      }`;
    
    // 호환성 레벨 결정
    const compatibilityLevel = normalizedScore >= 0.8 ? "강력 추천 조합" : 
                              normalizedScore >= 0.6 ? "추천 조합" : 
                              normalizedScore >= 0.4 ? "무난한 조합" : "실험적인 조합";
    
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
        raw_score: score,
        percentage: Math.round(normalizedScore * 100),
        explanation: fallbackExplanation,
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
 * Find the best pairing combination for Korean liquor and ingredient input
 */
exports.findBestPairingKorean = async (req, res) => {
  try {
    const { liquor, ingredient } = req.body;
    
    console.log('Best pairing request:', { liquor, ingredient });
    
    // Validate input
    if (!liquor || !ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명과 재료명을 모두 입력해주세요' 
      });
    }
    
    // *** 새로운 방식: 전체 매칭 결과 가져오기 ***
    const liquorResults = koreanMapper.searchByKorean(liquor, 'liquor'); // 모든 결과
    const ingredientResults = koreanMapper.searchByKorean(ingredient, 'ingredient'); // 모든 결과
    
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
    console.log('Will test ALL combinations for optimal pairing...');
    
    // *** 모든 조합 테스트 ***
    let bestCombination = null;
    let bestScore = -1;
    const testedCombinations = [];
    
    // 성능을 위해 최대 조합 수 제한 (너무 많으면 시간이 오래 걸림)
    const maxLiquors = Math.min(20, liquorResults.length); // 최대 20개 주류
    const maxIngredients = Math.min(20, ingredientResults.length); // 최대 20개 재료
    
    console.log(`Testing ${maxLiquors} liquors × ${maxIngredients} ingredients = ${maxLiquors * maxIngredients} combinations`);
    
    // 모든 조합 테스트
    for (let i = 0; i < maxLiquors; i++) {
      for (let j = 0; j < maxIngredients; j++) {
        const liquorCandidate = liquorResults[i];
        const ingredientCandidate = ingredientResults[j];
        
        try {
          console.log(`Testing combination ${i * maxIngredients + j + 1}/${maxLiquors * maxIngredients}: ${liquorCandidate.name} + ${ingredientCandidate.name}`);
          
          const score = await getPairingScore(liquorCandidate.nodeId, ingredientCandidate.nodeId);
          
          const combination = {
            liquor: liquorCandidate,
            ingredient: ingredientCandidate,
            score: score
          };
          
          testedCombinations.push(combination);
          
          if (score > bestScore) {
            bestScore = score;
            bestCombination = combination;
            console.log(`🎯 New best combination found! Score: ${score.toFixed(3)} - ${liquorCandidate.name} + ${ingredientCandidate.name}`);
          } else {
            console.log(`Score: ${score.toFixed(3)} (current best: ${bestScore.toFixed(3)})`);
          }
          
        } catch (error) {
          console.error(`❌ Error testing combination ${liquorCandidate.name} + ${ingredientCandidate.name}:`, error);
          // Continue with other combinations
        }
      }
    }
    
    if (!bestCombination) {
      return res.status(500).json({
        success: false,
        error: '페어링 점수를 계산할 수 없습니다'
      });
    }
    
    console.log(`🏆 Final best combination: ${bestCombination.liquor.name} + ${bestCombination.ingredient.name} (score: ${bestScore.toFixed(3)})`);
    
    // Get detailed explanation for the best combination
    let explanation;
    try {
      explanation = await getExplanation(bestCombination.liquor.nodeId, bestCombination.ingredient.nodeId);
    } catch (explanationError) {
      console.error('Error getting explanation:', explanationError);
      explanation = {
        explanation: `${liquor}과 ${ingredient}의 최적 조합인 ${bestCombination.liquor.name}과 ${bestCombination.ingredient.name}은 ${bestScore.toFixed(2)} 점수를 받았습니다.`,
        compatibility_level: bestScore >= 0.8 ? "강력 추천 조합" : 
                            bestScore >= 0.6 ? "추천 조합" : 
                            bestScore >= 0.4 ? "무난한 조합" : "실험적인 조합"
      };
    }
    
    // Get liquor and ingredient details
    const [liquorDetails, ingredientDetails] = await Promise.all([
      Liquor.getByNodeId(bestCombination.liquor.nodeId),
      Ingredient.getByNodeId(bestCombination.ingredient.nodeId)
    ]);
    
    // Sort all tested combinations by score (highest first)
    const sortedCombinations = testedCombinations
      .map(combo => ({
        liquor: combo.liquor.name,
        ingredient: combo.ingredient.name,
        score: combo.score,
        liquor_priority: combo.liquor.priority,
        ingredient_priority: combo.ingredient.priority
      }))
      .sort((a, b) => b.score - a.score);
    
    return res.json({
      success: true,
      data: {
        korean_input: { liquor, ingredient },
        best_combination: {
          liquor: {
            korean: bestCombination.liquor.korean,
            english: bestCombination.liquor.name,
            node_id: bestCombination.liquor.nodeId,
            match_type: bestCombination.liquor.matchType,
            priority: bestCombination.liquor.priority,
            details: liquorDetails
          },
          ingredient: {
            korean: bestCombination.ingredient.korean,
            english: bestCombination.ingredient.name,
            node_id: bestCombination.ingredient.nodeId,
            match_type: bestCombination.ingredient.matchType,
            priority: bestCombination.ingredient.priority,
            details: ingredientDetails
          },
          score: bestScore,
          explanation: explanation.explanation || explanation.reason,
          compatibility_level: explanation.compatibility_level
        },
        all_tested_combinations: sortedCombinations.slice(0, 20), // 상위 20개만 표시
        search_info: {
          liquor_candidates: liquorResults.length,
          ingredient_candidates: ingredientResults.length,
          combinations_tested: testedCombinations.length,
          total_possible_combinations: liquorResults.length * ingredientResults.length,
          search_strategy: "comprehensive_ai_scoring"
        },
        performance_stats: {
          best_score: bestScore,
          worst_score: Math.min(...testedCombinations.map(c => c.score)),
          average_score: testedCombinations.reduce((sum, c) => sum + c.score, 0) / testedCombinations.length,
          score_distribution: {
            excellent: testedCombinations.filter(c => c.score >= 0.8).length,
            good: testedCombinations.filter(c => c.score >= 0.6 && c.score < 0.8).length,
            fair: testedCombinations.filter(c => c.score >= 0.4 && c.score < 0.6).length,
            poor: testedCombinations.filter(c => c.score < 0.4).length
          }
        }
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

/**
 * Get recommendations with Korean input
 */
exports.getRecommendationsKorean = async (req, res) => {
  try {
    const { liquor } = req.body;
    const limit = parseInt(req.body.limit || 10);
    
    if (!liquor) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명을 입력해주세요' 
      });
    }
    
    // Convert Korean to node_id
    const liquorResults = koreanMapper.searchByKorean(liquor, 'liquor');
    
    if (liquorResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류를 찾을 수 없습니다',
        korean_input: liquor
      });
    }
    
    const liquorNodeId = liquorResults[0].nodeId;
    
    // Get recommendations from AI model
    const recommendations = await getRecommendations(liquorNodeId, limit);
    
    return res.json({
      success: true,
      data: {
        korean_input: liquor,
        english_name: liquorResults[0].name,
        liquor_node_id: liquorNodeId,
        recommendations
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

/**
 * Search liquors and ingredients by Korean text
 */
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

/**
 * Get pairing score for a liquor and ingredient
 */
exports.getPairingScoreByIds = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.params;
    
    console.log(`GET /api/pairing/score/${liquorId}/${ingredientId}`);
    
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ success: false, error: 'Please provide liquor and ingredient IDs' });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    console.log(`Looking for pairing with liquorId: ${liquorIdNum}, ingredientId: ${ingredientIdNum}`);
    
    try {
      let existingPairing = await Pairing.getByLiquorAndIngredient(liquorIdNum, ingredientIdNum);
      
      console.log('Existing pairing:', existingPairing ? 'Found' : 'Not found');
      
      if (existingPairing) {
        const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(existingPairing.reason);
        
        if (isKorean) {
          return res.json({
            success: true,
            data: {
              score: existingPairing.score,
              reason: existingPairing.reason,
              liquor_id: existingPairing.liquor_id,
              ingredient_id: existingPairing.ingredient_id
            }
          });
        }
        
        console.log('기존 설명이 영어로 되어 있어 한국어로 새로 생성합니다.');
      }
    } catch (error) {
      console.error('Error finding existing pairing:', error);
    }
    
    console.log('Requesting score from AI model...');
    const score = await getPairingScore(liquorIdNum, ingredientIdNum);
    console.log(`AI model score: ${score}`);
    
    try {
      console.log('Fetching liquor details...');
      const liquor = await Liquor.getById(liquorIdNum);
      console.log('Liquor found:', liquor ? 'Yes' : 'No');
      
      console.log('Fetching ingredient details...');
      const ingredient = await Ingredient.getById(ingredientIdNum);
      console.log('Ingredient found:', ingredient ? 'Yes' : 'No');
      
      if (!liquor || !ingredient) {
        return res.status(404).json({ 
          success: false, 
          error: `${!liquor ? 'Liquor' : 'Ingredient'} not found` 
        });
      }
      
      console.log('Generating explanation...');
      const explanation = await getExplanation(liquorIdNum, ingredientIdNum);
      console.log('Explanation generated');
      
      try {
        console.log('Creating new pairing record...');
        const newPairing = await Pairing.create({
          liquorId: liquor.id,           
          ingredientId: ingredient.id,   
          score,
          reason: explanation.reason || explanation.explanation
        });
        console.log('New pairing created with ID:', newPairing);
      } catch (error) {
        console.error('Error creating new pairing:', error);
      }
      
      return res.json({
        success: true,
        data: {
          score,
          reason: explanation.explanation,
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
      console.error('Error fetching liquor/ingredient details:', error);
      
      return res.json({
        success: true,
        data: {
          score,
          message: "Pairing score calculated, but details couldn't be fetched"
        }
      });
    }
    
  } catch (error) {
    console.error('Error in pairing score controller:', error);
    console.error(error.stack);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Get recommended ingredients for a liquor
 */
exports.getRecommendationsForLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const limit = parseInt(req.query.limit || 10);
    
    if (!liquorId) {
      return res.status(400).json({ success: false, error: 'Please provide a liquor ID' });
    }
    
    const liquorIdNum = parseInt(liquorId);
    
    const liquor = await Liquor.getById(liquorIdNum);
    
    if (!liquor) {
      return res.status(404).json({ success: false, error: 'Liquor not found' });
    }
    
    const recommendations = await getRecommendations(liquorIdNum, limit);
    
    const ingredientIds = recommendations.map(r => r.ingredient_id);
    
    const ingredients = [];
    for (const id of ingredientIds) {
      const ingredient = await Ingredient.getById(id);
      if (ingredient) {
        ingredients.push(ingredient);
      }
    }
    
    const result = recommendations.map(rec => {
      const ingredient = ingredients.find(i => i.node_id === rec.ingredient_id);
      return {
        score: rec.score,
        ingredient: ingredient || { node_id: rec.ingredient_id, name: 'Unknown' }
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
    console.error(error.stack);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Get explanation for a pairing
 */
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
    console.error(error.stack);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Get top pairings by user ratings
 */
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
    console.error(error.stack);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Rate a pairing
 */
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
    console.error(error.stack);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};