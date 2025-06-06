/**
 * 🆕 한글 재료 입력으로 술 추천하기 (새로운 엔드포인트)
 */
exports.getLiquorRecommendationsKorean = async (req, res) => {
  try {
    const { ingredient } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 3), 3);
    
    console.log('🍽️ Getting Korean liquor recommendations for ingredient:', ingredient);
    
    if (!ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 재료명을 입력해주세요' 
      });
    }
    
    const ingredientResults = koreanMapper.searchByKorean(ingredient, 'ingredient');
    
    if (ingredientResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 재료를 찾을 수 없습니다',
        korean_input: ingredient
      });
    }
    
    const mainIngredient = ingredientResults[0];
    const sampleLiquorIds = [75, 423, 524, 300, 400, 500, 600, 700, 800, 900, 100, 200, 350, 450, 550];
    const bestLiquors = [];
    
    for (const liquorId of sampleLiquorIds) {
      try {
        const rawScore = await getPairingScoreOnly(liquorId, mainIngredient.nodeId);
        const normalizedScore = normalizeScoreTo100(rawScore);
        
        const liquorInfo = koreanMapper.getLiquorByNodeId(liquorId);
        
        if (liquorInfo) {
          bestLiquors.push({
            liquor_id: liquorInfo.nodeId,
            liquor_name: liquorInfo.name,
            score: normalizedScore,
            raw_score: rawScore
          });
        }
      } catch (error) {
        console.error(`❌ Error testing liquor ${liquorId}:`, error);
      }
    }
    
    bestLiquors.sort((a, b) => b.raw_score - a.raw_score);
    const topRecommendations = bestLiquors.slice(0, limit);
    
    // 각 추천에 대해 간단한 설명 추가
    const recommendationsWithExplanations = [];
    for (const rec of topRecommendations) {
      try {
        const explanation = await getExplanationOnly(
          rec.liquor_id,
          mainIngredient.nodeId,
          rec.raw_score
        );
        
        recommendationsWithExplanations.push({
          name: rec.liquor_name,
          score: rec.score,
          explanation: explanation.gpt_explanation || explanation.explanation || `${ingredient}과 ${rec.liquor_name}은 잘 어울리는 조합입니다.`
        });
      } catch (error) {
        recommendationsWithExplanations.push({
          name: rec.liquor_name,
          score: rec.score,
          explanation: `${ingredient}과 ${rec.liquor_name}은 좋은 조합입니다.`
        });
      }
    }
    
    // 전체 추천에 대한 설명
    let overallExplanation = null;
    if (topRecommendations.length > 0) {
      const topLiquorNames = topRecommendations.slice(0, 2).map(r => r.liquor_name).join(', ');
      overallExplanation = `${ingredient}에는 ${topLiquorNames} 등이 특히 잘 어울립니다. 이들은 ${ingredient}의 맛과 향을 보완하고 조화를 이룹니다.`;
    }
    
    return res.json({
      success: true,
      data: {
        korean_input: ingredient,
        ingredient_name: mainIngredient.name,
        ingredient_node_id: mainIngredient.nodeId,
        recommendations: recommendationsWithExplanations,
        overall_explanation: overallExplanation,
        token_usage: {
          gpt_calls_made: recommendationsWithExplanations.length,
          explanation: "GPT explanation for each recommendation"
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in Korean liquor recommendations:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};