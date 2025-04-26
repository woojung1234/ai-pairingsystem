/**
 * AI Model Integration for FlavorDiffusion
 * This file serves as an interface between the FlavorDiffusion model and our Express API
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

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
          return reject(new Error(`Python process exited with code ${code}`));
        }
        
        try {
          // Parse the output as a float
          const score = parseFloat(output.trim());
          if (isNaN(score)) {
            return reject(new Error('Invalid score output from model'));
          }
          resolve(score);
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error in getPairingScore:', error);
    throw error;
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
    // Placeholder implementation
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
          return reject(new Error(`Python process exited with code ${code}`));
        }
        
        try {
          // Parse the output as JSON
          const recommendations = JSON.parse(output);
          resolve(recommendations);
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    throw error;
  }
}

/**
 * Get explanation for a pairing recommendation
 * @param {Number} liquorId - The ID of the liquor
 * @param {Number} ingredientId - The ID of the ingredient
 * @returns {Promise<Object>} - Explanation data including text and possibly shared compounds
 */
async function getExplanation(liquorId, ingredientId) {
  try {
    // This would generate an explanation of why a pairing was recommended
    // Could use a separate model or feature of the main model
    // For now, returning a placeholder
    return {
      explanation: `This pairing was recommended based on the flavor profile matching between the liquor and ingredient.`,
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

module.exports = {
  getPairingScore,
  getRecommendations,
  getExplanation
};
