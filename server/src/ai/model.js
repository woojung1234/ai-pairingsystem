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
    // Get liquor and ingredient details from database
    const [liquor, ingredient] = await Promise.all([
      Liquor.findOne({ liquor_id: liquorId }),
      Ingredient.findOne({ ingredient_id: ingredientId })
    ]);

    if (!liquor || !ingredient) {
      throw new Error('Liquor or ingredient not found');
    }

    // Get the pairing score
    const score = await getPairingScore(liquorId, ingredientId);
    
    // Calculate level of compatibility
    let compatibilityLevel;
    if (score >= 0.8) compatibilityLevel = "excellent";
    else if (score >= 0.6) compatibilityLevel = "good";
    else if (score >= 0.4) compatibilityLevel = "moderate";
    else compatibilityLevel = "challenging";

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
You are a expert sommelier and food pairing specialist. You have analyzed the pairing of ${liquorName} with ${ingredientName}.
The pairing score from our FlavorDiffusion model is ${score.toFixed(2)} out of 1.00, indicating a ${compatibilityLevel} compatibility.

Liquor flavor profile: ${liquorFlavors.length > 0 ? liquorFlavors.join(', ') : 'Not specified'}
Ingredient flavor profile: ${ingredientFlavors.length > 0 ? ingredientFlavors.join(', ') : 'Not specified'}
${sharedCompounds.length > 0 ? `Shared flavor compounds: ${sharedCompounds.join(', ')}` : ''}

Please provide a concise, informative explanation (2-3 sentences) of why this pairing works well or doesn't work well, focusing on:
1. How the flavors complement or contrast each other
2. Any specific flavor compounds or notes that are particularly important
3. How this pairing might enhance the overall tasting experience

Keep your explanation informative and scientific but accessible to a non-expert. Do not use bullet points or paragraph breaks. Keep it concise.
`;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable sommelier and food pairing expert who explains the science behind food and drink pairings in an accessible way."
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
    return `The ${compatibilityLevel} pairing between ${liquorName} and ${ingredientName} is based on their complementary flavor profiles. ${
      liquorFlavors.length > 0 && ingredientFlavors.length > 0
        ? `The ${liquorFlavors[0]} notes in the ${liquorName} harmonize well with the ${ingredientFlavors[0]} character of the ${ingredientName}.`
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

module.exports = {
  getPairingScore,
  getRecommendations,
  getExplanation
};
