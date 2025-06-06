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
 */
const findBestPairing = async (koreanLiquor, koreanIngredient) => {
  console.log(`🔍 Finding best pairing for "${koreanLiquor}" + "${koreanIngredient}"`);
  
  const liquorResults = koreanMapper.searchByKorean(koreanLiquor, 'liquor');
  const ingredientResults = koreanMapper.searchByKorean(koreanIngredient, 'ingredient');
  
  if (liquorResults.length === 0 || ingredientResults.length === 0) {
    return null;
  }
  
  let bestScore = -Infinity;
  let bestCombination = null;
  const testedCombinations = [];
  
  const maxLiquors = Math.min(5, liquorResults.length);
  const maxIngredients = Math.min(5, ingredientResults.length);
  
  for (let i = 0; i < maxLiquors; i++) {
    for (let j = 0; j < maxIngredients; j++) {
      const liquor = liquorResults[i];
      const ingredient = ingredientResults[j];
      
      try {
        const rawScore = await getPairingScoreOnly(liquor.nodeId, ingredient.nodeId);
        const normalizedScore = normalizeScoreTo100(rawScore);
        
        const combination = {
          liquor,
          ingredient,
          rawScore,
          normalizedScore
        };
        
        testedCombinations.push(combination);
        
        if (rawScore > bestScore) {
          bestScore = rawScore;
          bestCombination = combination;
        }
        
      } catch (error) {
        console.error(`❌ Error testing combination ${liquor.name} + ${ingredient.name}:`, error);
      }
    }
  }
  
  return {
    bestCombination,
    testedCombinations: testedCombinations.sort((a, b) => b.rawScore - a.rawScore).slice(0, 10)
  };
};

/**
 * 최종 선택된 조합에 대해서만 GPT 설명 추가 (토큰 절약)
 */
const addGPTExplanationToBest = async (bestCombination, koreanLiquor, koreanIngredient) => {
  try {
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
    const fallbackExplanation = `${koreanLiquor}과 ${koreanIngredient}의 최적 조합은 ${bestCombination.liquor.name}과 ${bestCombination.ingredient.name}입니다.`;
    
    return {
      ...bestCombination,
      gptExplanation: fallbackExplanation,
      compatibilityLevel: bestCombination.normalizedScore >= 80 ? "강력 추천 조합" : 
                         bestCombination.normalizedScore >= 60 ? "추천 조합" : 
                         bestCombination.normalizedScore >= 40 ? "무난한 조합" : "실험적인 조합"
    };
  }
};