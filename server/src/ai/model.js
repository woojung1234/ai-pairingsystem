const fetch = require('node-fetch');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

/**
 * 점수만 가져오기 (GPT 호출 없이)
 * @param {number} liquorId 
 * @param {number} ingredientId 
 * @returns {Promise<number>} 점수만 반환
 */
async function getPairingScoreOnly(liquorId, ingredientId) {
  console.log(`🎯 Getting score only for liquorId=${liquorId}, ingredientId=${ingredientId}`);
  
  try {
    const response = await fetch(`${AI_SERVER_URL}/score-only`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        liquor_id: parseInt(liquorId),
        ingredient_id: parseInt(ingredientId)
      }),
    });

    if (!response.ok) {
      throw new Error(`AI server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📊 Score received: ${data.score}`);
    return data.score;
  } catch (error) {
    console.error('❌ Error calling AI server for score:', error);
    throw error;
  }
}

/**
 * 설명만 가져오기 (최종 선택된 조합에만 사용)
 * @param {number} liquorId 
 * @param {number} ingredientId 
 * @param {number} score - 이미 계산된 점수 (선택적)
 * @returns {Promise<object>} 설명 객체
 */
async function getExplanationOnly(liquorId, ingredientId, score = null) {
  console.log(`🤖 Getting explanation only for liquorId=${liquorId}, ingredientId=${ingredientId}`);
  
  try {
    const response = await fetch(`${AI_SERVER_URL}/explanation-only`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        liquor_id: parseInt(liquorId),
        ingredient_id: parseInt(ingredientId),
        score: score
      }),
    });

    if (!response.ok) {
      throw new Error(`AI server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`💬 Explanation received`);
    return {
      explanation: data.explanation,
      gpt_explanation: data.gpt_explanation,
      reason: data.gpt_explanation || data.explanation
    };
  } catch (error) {
    console.error('❌ Error calling AI server for explanation:', error);
    throw error;
  }
}

/**
 * 기존 방식 (점수 + 설명 한번에) - 호환성을 위해 유지
 * @param {number} liquorId 
 * @param {number} ingredientId 
 * @returns {Promise<object>}
 */
async function getPairingScore(liquorId, ingredientId) {
  console.log(`Calling AI server for liquorId=${liquorId}, ingredientId=${ingredientId}`);
  
  try {
    const response = await fetch(`${AI_SERVER_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        liquor_id: parseInt(liquorId),
        ingredient_id: parseInt(ingredientId),
        use_gpt: false  // 기존 API에서는 GPT 비활성화
      }),
    });

    if (!response.ok) {
      throw new Error(`AI server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`AI server response:`, data);
    return data.score;  // 점수만 반환하도록 변경
  } catch (error) {
    console.error('Error calling AI server:', error);
    throw error;
  }
}

/**
 * Get pairing recommendations for a liquor
 * @param {number} liquorId 
 * @param {number} limit 
 * @returns {Promise<object>}
 */
async function getRecommendations(liquorId, limit = 3) {
  console.log(`📞 Getting recommendations for liquorId=${liquorId}, limit=${limit}`);
  
  try {
    const response = await fetch(`${AI_SERVER_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        liquor_id: parseInt(liquorId),
        limit: Math.min(parseInt(limit), 3),  // 최대 3개로 제한
        use_gpt: true  // 전체 설명만 사용
      }),
    });

    if (!response.ok) {
      throw new Error(`AI server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🤖 Recommendations received:`, data);
    return data;
  } catch (error) {
    console.error('❌ Error getting recommendations:', error);
    throw error;
  }
}

/**
 * Get explanation for a pairing (기존 호환성)
 * @param {number} liquorId 
 * @param {number} ingredientId 
 * @param {number} score 
 * @returns {Promise<object>}
 */
async function getExplanation(liquorId, ingredientId, score = null) {
  // 새로운 explanation-only 엔드포인트 사용
  return await getExplanationOnly(liquorId, ingredientId, score);
}

/**
 * Simple test function to check AI server connection
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const response = await fetch(`${AI_SERVER_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Error testing AI server connection:', error);
    return false;
  }
}

/**
 * Get list of available liquors
 * @returns {Promise<Array>}
 */
async function getLiquors() {
  try {
    const response = await fetch(`${AI_SERVER_URL}/liquors`);
    if (!response.ok) {
      throw new Error(`AI server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting liquors:', error);
    throw error;
  }
}

/**
 * Get list of available ingredients
 * @returns {Promise<Array>}
 */
async function getIngredients() {
  try {
    const response = await fetch(`${AI_SERVER_URL}/ingredients`);
    if (!response.ok) {
      throw new Error(`AI server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting ingredients:', error);
    throw error;
  }
}

/**
 * Batch score calculation for multiple combinations (토큰 최적화)
 * @param {Array} combinations - [{ liquorId, ingredientId }, ...]
 * @returns {Promise<Array>} - [{ liquorId, ingredientId, score }, ...]
 */
async function getBatchScores(combinations) {
  console.log(`🔢 Getting batch scores for ${combinations.length} combinations`);
  
  const results = [];
  
  // 병렬 처리로 성능 향상
  const promises = combinations.map(async (combo) => {
    try {
      const score = await getPairingScoreOnly(combo.liquorId, combo.ingredientId);
      return {
        liquorId: combo.liquorId,
        ingredientId: combo.ingredientId,
        score: score,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error getting score for ${combo.liquorId}-${combo.ingredientId}:`, error);
      return {
        liquorId: combo.liquorId,
        ingredientId: combo.ingredientId,
        score: null,
        success: false,
        error: error.message
      };
    }
  });

  const batchResults = await Promise.allSettled(promises);
  
  batchResults.forEach(result => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    }
  });

  console.log(`✅ Batch scoring complete: ${results.filter(r => r.success).length}/${combinations.length} successful`);
  return results;
}

module.exports = {
  getPairingScore,           // 기존 호환성 (점수만 반환하도록 수정)
  getPairingScoreOnly,       // 새로운 점수 전용 함수
  getExplanationOnly,        // 새로운 설명 전용 함수
  getRecommendations,
  getExplanation,           // 기존 호환성
  testConnection,
  getLiquors,
  getIngredients,
  getBatchScores            // 배치 점수 계산
};
