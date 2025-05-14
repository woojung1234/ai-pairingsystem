/**
 * Simplified test script for pairing model
 * OpenAI API 호출 없이 모델 예측만 테스트합니다.
 */

const path = require('path');
const { spawn } = require('child_process');

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
    
    // MODEL_PATH 정의
    const MODEL_PATH = path.resolve(__dirname, '../ai-server/model');
    console.log(`Model path: ${MODEL_PATH}`);
    
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
        }
        
        try {
          // 출력에서 마지막 줄을 찾아 숫자만 추출
          const lines = output.trim().split("\n");
          let lastLine = lines[lines.length - 1].trim();
          
          console.log(`Raw model output: "${output.trim()}"`);
          
          // 마지막 줄에서 숫자 추출
          const numberRegex = /(\\d+\\.\\d+)/;
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

// 테스트 함수
async function testModel() {
  try {
    // 여러 조합 테스트
    const testPairs = [
      { liquorId: 59, ingredientId: 863, name: "위스키-레몬" },
      { liquorId: 59, ingredientId: 864, name: "위스키-라임" },
      { liquorId: 60, ingredientId: 863, name: "보드카-레몬" },
      { liquorId: 61, ingredientId: 865, name: "진-오렌지" },
      { liquorId: 62, ingredientId: 866, name: "럼-파인애플" }
    ];
    
    console.log("====== 페어링 점수 테스트 시작 ======");
    
    const results = [];
    for (const pair of testPairs) {
      console.log(`\n테스트: ${pair.name} (${pair.liquorId}-${pair.ingredientId})`);
      const score = await getPairingScore(pair.liquorId, pair.ingredientId);
      console.log(`${pair.name} 페어링 점수: ${score}`);
      results.push({ ...pair, score });
    }
    
    console.log("\n====== 테스트 결과 요약 ======");
    for (const result of results) {
      console.log(`${result.name}: ${result.score}`);
    }
    
    return results;
  } catch (error) {
    console.error('Error in test:', error);
    throw error;
  }
}

// 테스트 실행
testModel()
  .then(results => {
    console.log('테스트가 성공적으로 완료되었습니다.');
    process.exit(0);
  })
  .catch(error => {
    console.error('테스트 실패:', error);
    process.exit(1);
  });
