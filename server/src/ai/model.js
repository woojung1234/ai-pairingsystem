/**
 * AI Model Integration for FlavorDiffusion
 * This file serves as an interface between the FlavorDiffusion model and our Express API
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const OpenAI = require('openai');
const Liquor = require('../models/Liquor');
const Ingredient = require('../models/Ingredient');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Path to the AI model directory
const MODEL_PATH = path.resolve(__dirname, '../../../ai-server/model');

/**
 * Get pairing score prediction for a liquor and ingredient
 * @param {Number} liquorId - The ID of the liquor
 * @param {Number} ingredientId - The ID of the ingredient
 * @returns {Promise<Number>} - The pairing score (0-1)
 */
async function getPairingScore(liquorId, ingredientId) {
  try {
    // This function would call the Python model via child process or use a pre-trained model in Node.js
    // For now, we'll implement a simple approach that spawns a Python process
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(MODEL_PATH, 'predict.py'),
        `--liquor_id=${liquorId}`,
        `--ingredient_id=${ingredientId}`
      ]);

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          // For development, return a mock score if Python process fails
          console.warn('Python process failed, returning mock score');
          return resolve(getRandomScore());
        }
        
        try {
          // Parse the output as a float
          const score = parseFloat(output.trim());
          if (isNaN(score)) {
            console.warn('Invalid score output, returning mock score');
            return resolve(getRandomScore());
          }
          resolve(score);
        } catch (error) {
          console.warn('Error parsing score, returning mock score:', error);
          resolve(getRandomScore());
        }
      });
    });
  } catch (error) {
    console.error('Error in getPairingScore:', error);
    // For development, return a mock score
    return getRandomScore();
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
    // This function would call the Python model for batch recommendations
    // Implementation depends on how the model is set up
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(MODEL_PATH, 'recommend.py'),
        `--liquor_id=${liquorId}`,
        `--limit=${limit}`
      ]);

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          // For development, return mock recommendations if Python process fails
          console.warn('Python process failed, returning mock recommendations');
          return resolve(getMockRecommendations(limit));
        }
        
        try {
          // Parse the output as JSON
          const recommendations = JSON.parse(output);
          resolve(recommendations);
        } catch (error) {
          console.warn('Error parsing recommendations, returning mock data:', error);
          resolve(getMockRecommendations(limit));
        }
      });
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    // For development, return mock recommendations
    return getMockRecommendations(limit);
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
    // Get liquor and ingredient details from database using the correct method call
    const liquor = await Liquor.getById(liquorId);
    const ingredient = await Ingredient.getById(ingredientId);

    if (!liquor || !ingredient) {
      throw new Error('Liquor or ingredient not found');
    }

    // Get the pairing score
    const score = await getPairingScore(liquorId, ingredientId);
    
    // Calculate level of compatibility
    let compatibilityLevel;
    if (score >= 0.8) compatibilityLevel = "탁월한";
    else if (score >= 0.6) compatibilityLevel = "좋은";
    else if (score >= 0.4) compatibilityLevel = "적당한";
    else compatibilityLevel = "도전적인";

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
    
    // Return a fallback explanation
    return {
      explanation: `This pairing of ${liquorId} and ${ingredientId} works well together based on their complementary flavor profiles.`,
      confidence: 0.7,
      factors: [
        { name: "flavor profile similarity", weight: 0.6 },
        { name: "shared compounds", weight: 0.3 },
        { name: "historical pairing success", weight: 0.1 }
      ]
    };
  }
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
FlavorDiffusion 모델에서 나온 페어링 점수는 1.00점 만점에 ${score.toFixed(2)}점으로, 이는 ${compatibilityLevel} 수준의 궁합을 나타냅니다.

주류 풍미 프로필: ${liquorFlavors.length > 0 ? liquorFlavors.join(', ') : '명시되지 않음'}
재료 풍미 프로필: ${ingredientFlavors.length > 0 ? ingredientFlavors.join(', ') : '명시되지 않음'}
${sharedCompounds.length > 0 ? `공유 풍미 화합물: ${sharedCompounds.join(', ')}` : ''}

이 페어링이 왜 잘 어울리는지 또는 잘 어울리지 않는지에 대한 간결하고 정보가 풍부한 설명(2-3문장)을 한국어로 제공해주세요. 다음 사항에 초점을 맞추세요:
1. 풍미가 어떻게 서로 보완하거나 대조되는지
2. 특히 중요한 특정 풍미 화합물이나 노트
3. 이 페어링이 전체적인 시식 경험을 어떻게 향상시킬 수 있는지

설명은 전문적이고 과학적이지만 비전문가도 이해할 수 있게 작성해주세요. 글머리 기호나 단락 나누기를 사용하지 마세요. 간결하게 유지하세요.
반드시 한국어로 응답해주세요.
`;

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
      max_tokens: 150,
      temperature: 0.7,
    });

    // Extract and return the explanation
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating explanation with AI:', error);
    
    // Fallback explanation if API call fails
    return `${liquorName}과(와) ${ingredientName}의 ${compatibilityLevel} 페어링은 보완적인 풍미 프로필을 바탕으로 합니다. ${
      liquorFlavors.length > 0 && ingredientFlavors.length > 0
        ? `${liquorName}의 ${liquorFlavors[0]} 노트는 ${ingredientName}의 ${ingredientFlavors[0]} 특성과 잘 어우러집니다.`
        : ''
    }`;
  }
}

/**
 * Helper function to get a random pairing score for development
 * @returns {Number} A random score between 0.3 and 0.95
 */
function getRandomScore() {
  return Math.round((0.3 + Math.random() * 0.65) * 100) / 100;
}

/**
 * Helper function to generate mock recommendations
 * @param {Number} limit - Number of recommendations to generate
 * @returns {Array} Array of mock recommendations
 */
function getMockRecommendations(limit) {
  const recommendations = [];
  for (let i = 1; i <= limit; i++) {
    recommendations.push({
      ingredient_id: i,
      score: getRandomScore()
    });
  }
  return recommendations;
}

/**
 * Helper function to determine shared compounds between a liquor and an ingredient
 * In a real system, this would come from a chemical database or ML model
 * @param {Object} liquor - Liquor object
 * @param {Object} ingredient - Ingredient object
 * @returns {Array} Array of shared compounds
 */
function getSharedCompounds(liquor, ingredient) {
  // This is a mock implementation
  const allCompounds = [
    'Ethyl acetate', 'Eugenol', 'Vanillin', 'Limonene', 'Linalool',
    'Citral', 'Methyl anthranilate', 'Benzaldehyde', 'Cinnamaldehyde',
    'Menthol', 'Geraniol', 'Pinene', 'Myrcene', 'Caryophyllene'
  ];
  
  // Randomly select 0-3 shared compounds
  const numShared = Math.floor(Math.random() * 4);
  const shuffled = [...allCompounds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numShared);
}

/**
 * Generate a random pairing score for development/testing
 * @returns {Number} - Random score between 0.1 and 0.9
 */
function getRandomScore() {
  // 0.1 to 0.9 range with 2 decimal places
  return Math.round((0.1 + Math.random() * 0.8) * 100) / 100;
}

/**
 * Generate mock recommendations for development/testing
 * @param {Number} limit - Number of recommendations to generate
 * @returns {Array} - Array of mock recommendations
 */
function getMockRecommendations(limit) {
  const recommendations = [];
  for (let i = 0; i < limit; i++) {
    recommendations.push({
      ingredient_id: Math.floor(Math.random() * 100) + 1,
      score: getRandomScore()
    });
  }
  return recommendations;
}

/**
 * Get shared compounds between a liquor and ingredient
 * @param {Object} liquor - Liquor object
 * @param {Object} ingredient - Ingredient object
 * @returns {Array} - Array of shared compound names
 */
function getSharedCompounds(liquor, ingredient) {
  // In a real implementation, this would query the database or call the model
  // For now, return some mock data
  const mockCompounds = [
    'Limonene', 'Beta-Caryophyllene', 'Linalool', 'Myrcene', 'Pinene',
    'Geraniol', 'Terpineol', 'Citral', 'Eugenol', 'Cinnamaldehyde'
  ];
  
  // Generate a random number of shared compounds (0-3)
  const numShared = Math.floor(Math.random() * 4);
  const sharedCompounds = [];
  
  for (let i = 0; i < numShared; i++) {
    const randomIndex = Math.floor(Math.random() * mockCompounds.length);
    const compound = mockCompounds[randomIndex];
    if (!sharedCompounds.includes(compound)) {
      sharedCompounds.push(compound);
    }
  }
  
  return sharedCompounds;
}

module.exports = {
  getPairingScore,
  getRecommendations,
  getExplanation
};
