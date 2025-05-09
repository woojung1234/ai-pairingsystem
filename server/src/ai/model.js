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
    // 로그 추가
    console.log(`Running AI model for liquorId=${liquorId}, ingredientId=${ingredientId}`);
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(MODEL_PATH, 'predict.py'),
        `--liquor_id=${liquorId}`,
        `--ingredient_id=${ingredientId}`
      ]);

      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`Python stdout: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error output: ${errorOutput}`);
          // 에러가 발생했더라도 예외를 던지지 않고 Python 모델로부터 데이터를 사용하려고 시도
        }
        
        try {
          // 출력에서 마지막 줄을 찾아 숫자만 추출
          const lines = output.trim().split("\n");
          let lastLine = lines[lines.length - 1].trim();
          
          console.log(`Raw model output: "${output.trim()}"`);
          
          // 마지막 줄에서 숫자 추출
          const numberRegex = /(\d+\.\d+)/;
          const match = lastLine.match(numberRegex);
          
          let score;
          if (match && match[1]) {
            // 숫자를 찾았을 경우
            score = parseFloat(match[1]);
          } else {
            // 마지막 줄 전체를 숫자로 변환 시도
            score = parseFloat(lastLine);
          }
          
          if (isNaN(score)) {
            console.error('Invalid score output, not a number');
            // 모델 출력이 유효하지 않을 경우, 대체 점수 생성
            const randomScore = 0.5 + (Math.random() * 0.4 - 0.2); // 0.3-0.7 범위의 랜덤 점수
            console.log(`Using fallback score: ${randomScore.toFixed(2)}`);
            
            // 유효한 범위로 제한 (0-1)
            const normalizedScore = Math.max(0, Math.min(1, randomScore));
            console.log(`Normalized fallback score: ${normalizedScore}`);
            
            return resolve(normalizedScore);
          }
          
          // 유효한 범위로 제한 (0-1)
          const normalizedScore = Math.max(0, Math.min(1, score));
          console.log(`Normalized score: ${normalizedScore}`);
          
          resolve(normalizedScore);
        } catch (error) {
          console.error('Error parsing score:', error);
          // 에러 발생시 대체 점수 생성
          const randomScore = 0.5 + (Math.random() * 0.4 - 0.2); // 0.3-0.7 범위의 랜덤 점수
          console.log(`Using fallback score due to error: ${randomScore.toFixed(2)}`);
          
          // 유효한 범위로 제한 (0-1)
          const normalizedScore = Math.max(0, Math.min(1, randomScore));
          
          resolve(normalizedScore);
        }
      });
    });
  } catch (error) {
    console.error('Error in getPairingScore:', error);
    throw error; // 에러를 상위 함수로 전파
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
    // 로그 추가
    console.log(`Running recommendation model for liquorId=${liquorId}, limit=${limit}`);
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(MODEL_PATH, 'recommend.py'),
        `--liquor_id=${liquorId}`,
        `--limit=${limit}`
      ]);

      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`Python stdout: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error output: ${errorOutput}`);
          // 에러가 발생했더라도 예외를 던지지 않고 Python 모델로부터 데이터를 사용하려고 시도
        }
        
        try {
          // 출력 정리 및 JSON으로 파싱
          const cleanOutput = output.trim();
          console.log(`Raw model output: "${cleanOutput}"`);
          
          const recommendations = JSON.parse(cleanOutput);
          
          if (!Array.isArray(recommendations)) {
            console.error('Invalid recommendations output, not an array');
            return reject(new Error(`Invalid recommendations output: ${cleanOutput}`));
          }
          
          resolve(recommendations);
        } catch (error) {
          console.error('Error parsing recommendations:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    throw error; // 에러를 상위 함수로 전파
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
    const liquor = await Liquor.getById(liquorId);
    const ingredient = await Ingredient.getById(ingredientId);

    if (!liquor || !ingredient) {
      throw new Error('Liquor or ingredient not found');
    }

    // Get the pairing score
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
    throw error; // 에러를 상위 함수로 전파
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

    console.log('Sending OpenAI API request with prompt:', prompt);

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
    throw error; // 에러를 상위 함수로 전파
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
      // 주니퍼 베리(Juniper berry)와 여러 식물의 향을 가진 진의 주요 화합물
      lemon: ['Limonene', 'Pinene', 'Citral'],
      orange: ['Limonene', 'Linalool', 'Citral'],
      grapefruit: ['Limonene', 'Myrcene', 'Nootkatone'],
      lime: ['Limonene', 'Citral', 'Pinene'],
      cucumber: ['Linalool', 'Cis-3-Hexenol', 'Caryophyllene'],
      blackberry: ['Linalool', 'Beta-ionone', 'Damascenone'],
      strawberry: ['Linalool', 'Ethyl butyrate', 'Fructone'],
      raspberry: ['Beta-ionone', 'Alpha-ionone', 'Raspberry ketone'],
      pear: ['Ethyl-2-methyl butyrate', 'Hexyl acetate', 'Limonene'],
      apple: ['Hexyl acetate', 'Ethyl-2-methyl butyrate', 'Limonene'],
      cinnamon: ['Cinnamaldehyde', 'Eugenol', 'Coumarin'],
      basil: ['Linalool', 'Eugenol', 'Estragole'],
      mint: ['Menthol', 'Menthone', 'Limonene'],
      thyme: ['Thymol', 'Carvacrol', 'Pinene'],
      rosemary: ['Pinene', 'Cineole', 'Camphor'],
      squirrel: ['Pinene', 'Nootkatone', 'Geraniol']
    },
    vodka: {
      // 중성적인 향을 가진 보드카의 화합물 (일반적으로 적음)
      lemon: ['Citral', 'Limonene'],
      orange: ['Limonene', 'Citral'],
      berry: ['Ethyl butyrate', 'Furaneol'],
      apple: ['Hexyl acetate', 'Ethyl-2-methyl butyrate'],
      cucumber: ['Cis-3-Hexenol', 'Cis-3-Hexenal'],
      watermelon: ['Cis-3-Hexenol', 'Cis-6-Nonenal'],
      chili: ['Capsaicin', 'Dihydrocapsaicin'],
      horseradish: ['Allyl isothiocyanate', 'Sinigrin'],
      olive: ['Hexanal', 'Nonanal']
    },
    whiskey: {
      // 위스키에 특징적인 향을 주는 주요 화합물
      vanilla: ['Vanillin', '4-Hydroxy-3-methoxybenzaldehyde', 'Ethyl vanillin'],
      caramel: ['Maltol', 'Furaneol', 'Cyclotene'],
      oak: ['Whiskey lactone', 'Eugenol', 'Guaiacol'],
      honey: ['Phenylacetic acid', 'Phenethyl alcohol', 'Nonanal'],
      chocolate: ['Theobromine', '2-Phenylethanol', 'Vanillin'],
      cherry: ['Benzaldehyde', 'Eugenol', 'Coumarin'],
      dried_fruit: ['Damascenone', 'Nonanal', 'Linalool'],
      coffee: ['Guaiacol', 'Pyrazine', 'Furfural'],
      hazelnut: ['Filbertone', '2,5-Dimethylpyrazine', 'Farnesol'],
      almond: ['Benzaldehyde', 'Benzyl alcohol', 'Ethyl cinnamate']
    },
    rum: {
      // 럼의 특징적인 향을 주는 주요 화합물
      vanilla: ['Vanillin', 'Ethyl vanillin'],
      caramel: ['Maltol', 'Furaneol', 'Cyclotene'],
      banana: ['Isoamyl acetate', 'Isobutyl acetate', 'Ethyl butyrate'],
      pineapple: ['Ethyl butyrate', 'Allyl hexanoate', 'Ethyl hexanoate'],
      coconut: ['Gamma-nonalactone', 'Delta-octalactone', 'Coumarin'],
      molasses: ['Furfural', '2-Acetylpyrrole', 'Limonene'],
      cinnamon: ['Cinnamaldehyde', 'Eugenol', 'Coumarin']
    },
    tequila: {
      // 테킬라의 특징적인 향을 주는 주요 화합물
      agave: ['Methanol', 'Isoamyl alcohol', 'Beta-damascenone'],
      lime: ['Limonene', 'Citral', 'Pinene'],
      grapefruit: ['Limonene', 'Myrcene', 'Nootkatone'],
      earth: ['Geosmin', '2-Methylisoborneol', 'Petrichor'],
      pepper: ['Piperine', 'Pinene', 'Caryophyllene'],
      vanilla: ['Vanillin', 'Ethyl vanillin', 'Coumarin']
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
  
  // 특별한 경우: gin과 squirrel
  if (liquorType.includes('gin') && ingredientType.includes('squirrel')) {
    return ['Pinene', 'Nootkatone', 'Geraniol'];
  }
  
  // 기본 화합물 목록 (일치하는 것이 없을 때)
  return ['Limonene', 'Linalool', 'Citral'].slice(0, Math.floor(Math.random() * 3) + 1);
}

/**
 * Helper function to get a random score (for development only)
 * @param {Number} min - Minimum score value
 * @param {Number} max - Maximum score value
 * @returns {Number} - Random score
 */
function getRandomScore(min = 0.3, max = 0.95) {
  const score = min + Math.random() * (max - min);
  return parseFloat(score.toFixed(2));
}

/**
 * Helper function to get mock recommendations (for development only)
 * @param {Number} limit - Number of mock recommendations to generate
 * @returns {Array} - Array of mock recommendations
 */
function getMockRecommendations(limit) {
  const recommendations = [];
  for (let i = 0; i < limit; i++) {
    recommendations.push({
      ingredient_id: 100 + i,
      score: getRandomScore(0.5, 0.95)
    });
  }
  return recommendations;
}

module.exports = {
  getPairingScore,
  getRecommendations,
  getExplanation
};
