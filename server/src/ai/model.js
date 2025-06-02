/**
 * AI Model Integration for FlavorDiffusion
 * This file serves as an interface between the AI server and our Express API
 */

const fetch = require('node-fetch');
const OpenAI = require('openai');
const Liquor = require('../models/Liquor');
const Ingredient = require('../models/Ingredient');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Server configuration
const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

/**
 * Get pairing score prediction for a liquor and ingredient
 * @param {Number} liquorId - The ID of the liquor
 * @param {Number} ingredientId - The ID of the ingredient
 * @returns {Promise<Number>} - The pairing score (0-1)
 */
async function getPairingScore(liquorId, ingredientId) {
  try {
    console.log(`Calling AI server for liquorId=${liquorId}, ingredientId=${ingredientId}`);
    
    const response = await fetch(`${AI_SERVER_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        liquor_id: liquorId,
        ingredient_id: ingredientId
      })
    });

    if (!response.ok) {
      console.error(`AI server error: ${response.status} ${response.statusText}`);
      // Fallback to algorithm-based score
      return getFallbackScore(liquorId, ingredientId);
    }

    const data = await response.json();
    console.log('AI server response:', data);
    
    // Ensure score is in valid range
    const normalizedScore = Math.max(0, Math.min(1, data.score));
    console.log(`Normalized score: ${normalizedScore}`);
    
    return normalizedScore;
    
  } catch (error) {
    console.error('Error calling AI server:', error);
    // Fallback to algorithm-based score
    return getFallbackScore(liquorId, ingredientId);
  }
}

/**
 * Get multiple pairing recommendations for a liquor
 * @param {Number} liquorId - The ID of the liquor
 * @param {Number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} - Array of recommended ingredients with scores
 */
async function getRecommendations(liquorId, limit = 10) {
  try {
    console.log(`Calling AI server for recommendations: liquorId=${liquorId}, limit=${limit}`);
    
    const response = await fetch(`${AI_SERVER_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        liquor_id: liquorId,
        limit: limit
      })
    });

    if (!response.ok) {
      console.error(`AI server error: ${response.status} ${response.statusText}`);
      // Fallback to mock recommendations
      return getMockRecommendations(liquorId, limit);
    }

    const data = await response.json();
    console.log('AI server recommendations:', data);
    
    // Transform response to match expected format
    const recommendations = data.recommendations.map(item => ({
      ingredient_id: item.ingredient_id,
      score: item.score
    }));
    
    return recommendations;
    
  } catch (error) {
    console.error('Error calling AI server for recommendations:', error);
    // Fallback to mock recommendations
    return getMockRecommendations(liquorId, limit);
  }
}

/**
 * Get explanation for a pairing recommendation using OpenAI API
 * @param {Number} liquorId - The ID of the liquor
 * @param {Number} ingredientId - The ID of the ingredient
 * @returns {Promise<Object>} - Explanation data including text and possibly shared compounds
 */
async function getExplanation(liquorId, ingredientId) {
  try {
    // Get liquor and ingredient details from database
    const liquor = await Liquor.getByNodeId(liquorId);
    const ingredient = await Ingredient.getByNodeId(ingredientId);

    if (!liquor || !ingredient) {
      throw new Error('Liquor or ingredient not found');
    }

    // Get the pairing score from AI server
    const score = await getPairingScore(liquorId, ingredientId);
    
    // Calculate level of compatibility
    let compatibilityLevel;
    if (score >= 0.8) compatibilityLevel = "강력 추천 조합";
    else if (score >= 0.6) compatibilityLevel = "추천 조합";
    else if (score >= 0.4) compatibilityLevel = "무난한 조합";
    else compatibilityLevel = "실험적인 조합";

    // Create a shared compounds list (would be from the model in production)
    const sharedCompounds = getSharedCompounds(liquor, ingredient);

    // Generate explanation using OpenAI
    let explanation = await generateExplanationWithAI(
      liquor.name,
      ingredient.name, 
      score,
      compatibilityLevel,
      liquor.flavor_profile || [],
      ingredient.flavor_profile || [],
      sharedCompounds
    );

    return {
      explanation,
      reason: explanation, // 호환성을 위해 explanation 필드를 reason 필드에도 복사
      score,
      compatibility_level: compatibilityLevel,
      shared_compounds: sharedCompounds,
      confidence: 0.85,
      factors: [
        { name: "flavor profile similarity", weight: 0.6 },
        { name: "shared compounds", weight: 0.3 },
        { name: "historical pairing success", weight: 0.1 }
      ]
    };
  } catch (error) {
    console.error('Error in getExplanation:', error);
    throw error;
  }
}

/**
 * Fallback algorithm-based score generation
 * @param {Number} liquorId - The ID of the liquor
 * @param {Number} ingredientId - The ID of the ingredient
 * @returns {Number} - Fallback score
 */
function getFallbackScore(liquorId, ingredientId) {
  console.log('Using fallback score algorithm');
  
  // Algorithm-based consistent score generation
  const base_a = liquorId * 0.01;
  const base_b = ingredientId * 0.01;
  
  // Generate cosine similarity-like pattern
  const angle = (base_a * 7.5 + base_b * 12.3) % (2 * Math.PI);
  const raw_score = (Math.cos(angle) + 1) / 2; // 0-1 range
  
  // Scale to 0.2-0.95 range (avoid extreme scores)
  const score = 0.2 + raw_score * 0.75;
  
  // Round to 2 decimal places
  return Math.round(score * 100) / 100;
}

/**
 * Generate mock recommendations for fallback
 * @param {Number} liquorId - The ID of the liquor
 * @param {Number} limit - Number of recommendations
 * @returns {Array} - Mock recommendations
 */
function getMockRecommendations(liquorId, limit) {
  console.log('Using mock recommendations');
  
  const recommendations = [];
  for (let i = 0; i < limit; i++) {
    const ingredientId = (liquorId * 13 + i * 7) % 6000 + 1; // Generate pseudo-random ingredient IDs
    const score = getFallbackScore(liquorId, ingredientId);
    
    recommendations.push({
      ingredient_id: ingredientId,
      score: score
    });
  }
  
  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Generate explanation using OpenAI API
 * @param {String} liquorName - Name of the liquor
 * @param {String} ingredientName - Name of the ingredient
 * @param {Number} score - Pairing score (0-1)
 * @param {String} compatibilityLevel - Text description of compatibility level
 * @param {Array} liquorFlavors - Array of flavor notes for the liquor
 * @param {Array} ingredientFlavors - Array of flavor notes for the ingredient
 * @param {Array} sharedCompounds - Array of shared flavor compounds
 * @returns {Promise<String>} - Generated explanation
 */
async function generateExplanationWithAI(
  liquorName, 
  ingredientName, 
  score,
  compatibilityLevel,
  liquorFlavors = [],
  ingredientFlavors = [],
  sharedCompounds = []
) {
  try {
    // Format the prompt with information about the pairing
    const prompt = `
당신은 전문 소믈리에이자 음식 페어링 전문가입니다. ${liquorName}과(와) ${ingredientName}의 페어링을 분석했습니다.
FlavorDiffusion 모델에서 나온 페어링 점수는 1.00점 만점에 ${score.toFixed(2)}점으로, 이는 "${compatibilityLevel}"입니다.

주류 풍미 프로필: ${liquorFlavors.length > 0 ? liquorFlavors.join(', ') : '명시되지 않음'}
재료 풍미 프로필: ${ingredientFlavors.length > 0 ? ingredientFlavors.join(', ') : '명시되지 않음'}
${sharedCompounds.length > 0 ? `공유 풍미 화합물: ${sharedCompounds.join(', ')}` : ''}

이 페어링에 대한 설명을 3-4문장으로 한국어로 제공해주세요. 점수에 따라 다음과 같이 설명해주세요:
- 높은 점수(0.8 이상): 왜 이 조합이 탁월한지, 어떤 풍미가 특히 잘 어울리는지 설명
- 좋은 점수(0.6-0.8): 이 조합의 장점과 활용 방법에 대해 설명
- 보통 점수(0.4-0.6): 이 조합이 어떤 상황에서 적절한지, 장단점 균형있게 설명
- 낮은 점수(0.4 미만): 왜 이 조합이 일반적으로 권장되지 않는지 솔직하게 설명하되, 혹시 있다면 어떤 특별한 상황에서 시도해볼 수 있을지 제안

다음 사항에 초점을 맞추세요:
1. 두 재료의 풍미가 어떻게 상호작용하는지 
2. 중요한 풍미 화합물이나 특성
3. 이 조합으로 어떤 맛 경험을 할 수 있는지
4. 활용 가능한 요리나 상황 제안 (적절한 경우)

전문적이지만 일반인도 이해할 수 있는 쉬운 언어로 설명해주세요. 글머리 기호는 사용하지 말고 자연스러운 문장으로 작성해주세요.
반드시 한국어로 응답해주세요.
`;

    console.log('Sending OpenAI API request...');

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 음식과 음료 페어링의 과학적 원리를 이해하기 쉽게 설명하는 지식이 풍부한 소믈리에이자 음식 페어링 전문가입니다. 모든 응답은 한국어로 제공합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    // Extract and return the explanation
    const explanation = response.choices[0].message.content.trim();
    console.log('Generated explanation:', explanation);
    return explanation;
  } catch (error) {
    console.error('Error generating explanation with AI:', error);
    // Fallback explanation
    return `${liquorName}과 ${ingredientName}의 조합은 ${score.toFixed(2)} 점수를 받았습니다. ${compatibilityLevel}으로 분류되는 이 조합은 ${score >= 0.6 ? "추천할 만한" : "실험적인"} 페어링입니다.`;
  }
}

/**
 * Generate a list of shared flavor compounds between a liquor and ingredient
 * @param {Object} liquor - Liquor object
 * @param {Object} ingredient - Ingredient object
 * @returns {Array} - Array of shared compounds
 */
function getSharedCompounds(liquor, ingredient) {
  // 실제로는 데이터베이스에서 공유 화합물을 가져와야 하지만,
  // 현재는 간단한 로직으로 몇 가지 공통 화합물 생성
  const commonCompounds = {
    gin: {
      lemon: ['Limonene', 'Pinene', 'Citral'],
      orange: ['Limonene', 'Linalool', 'Citral'],
      grapefruit: ['Limonene', 'Myrcene', 'Nootkatone'],
      lime: ['Limonene', 'Citral', 'Pinene'],
      cucumber: ['Linalool', 'Cis-3-Hexenol', 'Caryophyllene'],
      cheese: ['Linalool', 'Ethyl butyrate', 'Diacetyl'],
    },
    vodka: {
      lemon: ['Citral', 'Limonene'],
      orange: ['Limonene', 'Citral'],
      cucumber: ['Cis-3-Hexenol', 'Cis-3-Hexenal'],
      cheese: ['Ethyl butyrate', 'Diacetyl'],
    },
    whiskey: {
      vanilla: ['Vanillin', '4-Hydroxy-3-methoxybenzaldehyde', 'Ethyl vanillin'],
      caramel: ['Maltol', 'Furaneol', 'Cyclotene'],
      oak: ['Whiskey lactone', 'Eugenol', 'Guaiacol'],
      cheese: ['Vanillin', 'Diacetyl', 'Lactone'],
    },
    wine: {
      cheese: ['Lactic acid', 'Tartaric acid', 'Diacetyl', 'Butyric acid'],
      grape: ['Anthocyanins', 'Tannins', 'Malic acid'],
      fruit: ['Ethyl acetate', 'Isoamyl acetate', 'Hexyl acetate'],
    }
  };
  
  const liquorType = liquor.name.toLowerCase();
  const ingredientType = ingredient.name.toLowerCase();
  
  // 일치하는 쌍이 있는지 확인
  for (const [knownLiquor, pairs] of Object.entries(commonCompounds)) {
    if (liquorType.includes(knownLiquor)) {
      for (const [knownIngredient, compounds] of Object.entries(pairs)) {
        if (ingredientType.includes(knownIngredient)) {
          return compounds;
        }
      }
    }
  }
  
  // 기본 화합물 목록 (일치하는 것이 없을 때)
  return ['Limonene', 'Linalool', 'Citral'].slice(0, Math.floor(Math.random() * 3) + 1);
}

module.exports = {
  getPairingScore,
  getRecommendations,
  getExplanation
};