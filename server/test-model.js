/**
 * Test script for pairing model
 */

const { getPairingScore } = require('./src/ai/model');

async function testModel() {
  try {
    // Test pairing - 위스키(59)와 레몬(863) 조합
    const liquorId = 59;
    const ingredientId = 863;
    
    console.log(`Testing pairing for liquorId: ${liquorId}, ingredientId: ${ingredientId}`);
    
    const score = await getPairingScore(liquorId, ingredientId);
    
    console.log(`Pairing score: ${score}`);
    
    return score;
  } catch (error) {
    console.error('Error in test:', error);
    throw error;
  }
}

// 테스트 실행
testModel()
  .then(score => {
    console.log('Test completed successfully with score:', score);
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
