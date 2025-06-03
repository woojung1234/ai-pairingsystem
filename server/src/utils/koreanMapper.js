const fs = require('fs');
const path = require('path');

class KoreanToNodeIdMapper {
  constructor() {
    this.nodesData = null;
    this.liquorMap = new Map();
    this.ingredientMap = new Map();
    this.koreanToEnglishMap = new Map(); // 새로 추가: CSV 매핑
    this.koreanMappings = this.loadKoreanMappings();
    this.loadKoreanLiquorMapping(); // 새로 추가: CSV 로드
    this.loadNodesData();
  }

  loadKoreanLiquorMapping() {
    try {
      const csvPath = path.join(__dirname, '../../../EnglishKorean_Liquor_Names.csv');
      
      if (!fs.existsSync(csvPath)) {
        console.warn('Korean liquor mapping CSV file not found');
        return;
      }
      
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.split('\n').slice(1); // 헤더 제거
      
      lines.forEach(line => {
        if (line.trim()) {
          const [liquor_name, korean_name] = line.split(',');
          if (liquor_name && korean_name) {
            const cleanLiquorName = liquor_name.trim();
            const cleanKoreanName = korean_name.trim();
            
            // 한국어 이름을 키로, 영어 이름을 값으로 저장
            this.koreanToEnglishMap.set(cleanKoreanName, cleanLiquorName);
          }
        }
      });
      
      console.log(`Loaded ${this.koreanToEnglishMap.size} Korean liquor mappings from CSV`);
    } catch (error) {
      console.error('Error loading Korean liquor mapping:', error);
    }
  }

  loadNodesData() {
    try {
      const csvPath = path.join(__dirname, '../../../ai-server/dataset/nodes_191120_updated.csv');
      
      if (!fs.existsSync(csvPath)) {
        console.warn('CSV file not found, using fallback data');
        return;
      }
      
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.split('\n').slice(1); // 헤더 제거
      
      lines.forEach(line => {
        if (line.trim()) {
          const parts = line.split(',');
          if (parts.length >= 4) {
            const node_id = parts[0];
            const name = parts[1];
            const node_type = parts[3];
            
            if (node_id && name && node_type) {
              const nodeId = parseInt(node_id);
              const cleanName = name.toLowerCase().trim();
              
              if (node_type === 'liquor') {
                this.liquorMap.set(cleanName, nodeId);
              } else if (node_type === 'ingredient') {
                this.ingredientMap.set(cleanName, nodeId);
              }
            }
          }
        }
      });
      
      console.log(`Loaded ${this.liquorMap.size} liquors and ${this.ingredientMap.size} ingredients from CSV`);
    } catch (error) {
      console.error('Error loading nodes data:', error);
      // 오류 발생 시 기본 데이터로 대체
      this.loadFallbackData();
    }
  }

  loadFallbackData() {
    // CSV 로드 실패 시 기본 데이터
    const fallbackData = {
      liquors: {
        39: 'absinthe',
        40: 'absolut_citron_vodka',
        75: 'ale',
        96: 'almond_flavored_liqueur',
        100: 'almond_liqueur',
        120: 'amaretto_liqueur',
        122: 'amber_beer',
        123: 'amber_rum',
        159: 'apple_brandy',
        167: 'apple_liqueur',
        177: 'apricot_brandy',
        184: 'apricot_liqueur',
        194: 'armagnac',
        311: 'banana_liqueur',
        423: 'beer',
        519: 'blackberry_brandy',
        521: 'blackberry_liqueur',
        524: 'blackberry_wine',
        652: 'bourbon',
        653: 'bourbon_whiskey',
        662: 'brandy',
        755: 'brut_champagne',
        777: 'burgundy_wine',
        827: 'cabernet_sauvignon_wine',
        1069: 'champagne',
        1079: 'chardonnay_wine',
        1112: 'cherry_brandy',
        1115: 'cherry_flavored_liqueur',
        1137: 'chianti_wine',
        1246: 'chinese_rice_wine',
        1251: 'chinese_wine',
        1317: 'chocolate_liqueur',
        1361: 'cider',
        1441: 'coconut_liqueur',
        1448: 'coconut_rum',
        1462: 'coffee_flavored_liqueur',
        1465: 'coffee_liqueur',
        1467: 'cognac',
        1468: 'cointreau_liqueur',
        1627: 'corona_beer',
        1830: 'dark_rum',
        1821: 'dark_jamaican_rum',
        2102: 'dry_champagne',
        2112: 'dry_gin',
        2119: 'dry_marsala_wine',
        2135: 'dry_red_wine',
        2149: 'dry_vermouth',
        2151: 'dry_white_vermouth',
        2152: 'dry_white_wine',
        2153: 'dry_wine',
        2204: 'elderflower_liqueur',
        2413: 'framboise_liqueur'
      },
      ingredients: {
        88: 'almond',
        158: 'apple',
        175: 'apricot',
        223: 'avocado',
        302: 'banana',
        328: 'basil',
        361: 'beef',
        518: 'blackberry',
        547: 'blueberry',
        668: 'bread',
        781: 'butter',
        805: 'buttermilk',
        823: 'cabbage',
        885: 'candy_bar',
        966: 'caper',
        1005: 'carrot',
        1014: 'cashew_nut',
        1041: 'celery',
        1083: 'cheddar_cheese',
        1089: 'cheese',
        1111: 'cherry',
        1125: 'cherry_tomato',
        1138: 'chicken',
        1204: 'chickpea',
        1266: 'chocolate',
        1368: 'cinnamon',
        1458: 'coffee',
        1595: 'corn',
        1598: 'corn_chip',
        1631: 'cottage_cheese',
        1645: 'crab',
        1664: 'cranberry',
        1681: 'cream',
        1682: 'cream_cheese',
        1768: 'cucumber',
        1845: 'date',
        1895: 'dill',
        2188: 'egg',
        2200: 'eggplant',
        2320: 'feta_cheese',
        2331: 'fig',
        2364: 'fish',
        2396: 'flour',
        2430: 'french_fry',
        2547: 'fresh_pea',
        2591: 'fresh_tomato'
      }
    };

    for (const [nodeId, name] of Object.entries(fallbackData.liquors)) {
      this.liquorMap.set(name.toLowerCase(), parseInt(nodeId));
    }

    for (const [nodeId, name] of Object.entries(fallbackData.ingredients)) {
      this.ingredientMap.set(name.toLowerCase(), parseInt(nodeId));
    }

    console.log(`Loaded fallback data: ${this.liquorMap.size} liquors, ${this.ingredientMap.size} ingredients`);
  }

  loadKoreanMappings() {
    return {
      liquors: {
        "위스키": ["whiskey", "whisky", "bourbon", "scotch"],
        "보드카": ["vodka", "absolut"],
        "럼": ["rum", "dark_rum", "jamaican_rum"],
        "진": ["gin", "dry_gin"],
        "브랜디": ["brandy", "cognac", "armagnac"],
        "맥주": ["beer", "ale", "lager", "corona"],
        "와인": ["wine", "chardonnay", "cabernet", "burgundy", "chianti"],
        "테킬라": ["tequila"],
        "사케": ["sake"],
        "소주": ["soju"],
        "리큐어": ["liqueur", "amaretto", "cointreau"],
        "샴페인": ["champagne", "brut"],
        "사이다": ["cider"],
        "코냑": ["cognac"],
        "아마레또": ["amaretto"],
        "커피리큐어": ["coffee_liqueur", "coffee_flavored_liqueur"],
        "초콜릿리큐어": ["chocolate_liqueur"]
      },
      ingredients: {
        "치즈": ["cheese", "cheddar", "mozzarella", "brie", "feta", "cottage"],
        "고기": ["beef", "pork", "chicken", "meat"],
        "생선": ["fish", "salmon", "tuna"],
        "과일": ["apple", "orange", "lemon", "lime", "berry"],
        "사과": ["apple"],
        "바나나": ["banana"],
        "블루베리": ["blueberry"],
        "딸기": ["strawberry"],
        "체리": ["cherry"],
        "포도": ["grape"],
        "레몬": ["lemon"],
        "라임": ["lime"],
        "오렌지": ["orange"],
        "채소": ["vegetable", "onion", "garlic", "pepper"],
        "토마토": ["tomato", "cherry_tomato"],
        "당근": ["carrot"],
        "셀러리": ["celery"],
        "오이": ["cucumber"],
        "아보카도": ["avocado"],
        "향신료": ["spice", "pepper", "salt", "herb"],
        "바질": ["basil"],
        "딜": ["dill"],
        "계피": ["cinnamon"],
        "초콜릿": ["chocolate"],
        "커피": ["coffee"],
        "견과류": ["nut", "almond", "walnut", "cashew"],
        "아몬드": ["almond"],
        "캐슈넛": ["cashew_nut"],
        "해산물": ["seafood", "shrimp", "crab"],
        "게": ["crab"],
        "새우": ["shrimp"],
        "버섯": ["mushroom"],
        "올리브": ["olive"],
        "케이퍼": ["caper"],
        "빵": ["bread"],
        "버터": ["butter"],
        "크림": ["cream", "cream_cheese"],
        "달걀": ["egg"],
        "밀가루": ["flour"],
        "옥수수": ["corn"],
        "감자": ["potato"],
        "고구마": ["sweet_potato"],
        "콩": ["bean", "chickpea"],
        "완두콩": ["pea", "fresh_pea"],
        "가지": ["eggplant"],
        "무화과": ["fig"],
        "대추": ["date"],
        "크랜베리": ["cranberry"],
        "양배추": ["cabbage"],
        "우유": ["milk", "buttermilk"]
      }
    };
  }

  searchByKorean(koreanText, type = 'both') {
    const results = [];
    
    // 1. 먼저 CSV 매핑에서 정확한 매치 찾기 (주류만)
    if (type === 'liquor' || type === 'both') {
      // 정확한 매치부터 찾기
      if (this.koreanToEnglishMap.has(koreanText)) {
        const englishName = this.koreanToEnglishMap.get(koreanText);
        const nodeId = this.liquorMap.get(englishName.toLowerCase());
        if (nodeId) {
          results.push({
            nodeId,
            name: englishName,
            type: 'liquor',
            korean: koreanText,
            matchType: 'exact',
            priority: 1000 // 최고 우선순위
          });
        }
      }
      
      // 부분 매치 찾기
      for (const [korean, english] of this.koreanToEnglishMap.entries()) {
        if (korean.includes(koreanText) || koreanText.includes(korean)) {
          const nodeId = this.liquorMap.get(english.toLowerCase());
          if (nodeId && !results.find(r => r.nodeId === nodeId)) {
            results.push({
              nodeId,
              name: english,
              type: 'liquor',
              korean: korean,
              matchType: 'partial',
              priority: 500
            });
          }
        }
      }
    }

    // 2. 기존 매핑 방식으로 보완
    const mappings = type === 'liquor' ? { liquors: this.koreanMappings.liquors } : 
                    type === 'ingredient' ? { ingredients: this.koreanMappings.ingredients } :
                    this.koreanMappings;

    for (const [category, categoryMappings] of Object.entries(mappings)) {
      const dataMap = category === 'liquors' ? this.liquorMap : this.ingredientMap;
      
      for (const [koreanName, englishNames] of Object.entries(categoryMappings)) {
        if (koreanText.includes(koreanName) || koreanName.includes(koreanText)) {
          // 해당하는 영어 이름들로 실제 데이터 검색
          for (const englishName of englishNames) {
            for (const [dbName, nodeId] of dataMap.entries()) {
              // *** 중요한 수정: 정확한 매치를 우선순위로 처리 ***
              let priority = 100; // 기본 우선순위
              let matchType = 'mapping';
              
              // 정확한 매치인지 확인
              if (dbName === englishName.toLowerCase()) {
                priority = 800; // 높은 우선순위
                matchType = 'exact_mapping';
              } else if (dbName.includes(englishName.toLowerCase())) {
                // "wine"을 포함하는 경우들을 세분화
                if (englishName.toLowerCase() === 'wine') {
                  // 일반적인 와인 타입들에 높은 우선순위 부여
                  if (dbName.includes('red_wine') || 
                      dbName.includes('white_wine') || 
                      dbName.includes('dry_wine')) {
                    priority = 400;
                  } else if (dbName.includes('chardonnay') || 
                           dbName.includes('cabernet') || 
                           dbName.includes('burgundy')) {
                    priority = 300;
                  } else {
                    priority = 100; // black_berry_wine 같은 특수한 것들
                  }
                }
                matchType = 'partial_mapping';
              }
              
              if (!results.find(r => r.nodeId === nodeId)) {
                results.push({
                  nodeId,
                  name: dbName,
                  type: category.slice(0, -1), // 'liquors' -> 'liquor'
                  korean: koreanName,
                  matchType,
                  priority
                });
              }
            }
          }
        }
      }
    }

    // *** 수정된 정렬 로직: 우선순위와 매치 타입 모두 고려 ***
    results.sort((a, b) => {
      // 1. 우선순위가 높은 것 먼저
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // 2. 우선순위가 같으면 이름 길이가 짧은 것 (더 일반적인 것)
      return a.name.length - b.name.length;
    });

    console.log(`Korean search for "${koreanText}": found ${results.length} results`);
    results.forEach((result, i) => {
      console.log(`  ${i+1}. ${result.name} (${result.matchType}, priority: ${result.priority}) → node_id: ${result.nodeId}`);
    });

    return results.slice(0, 5);
  }

  // 새로운 메서드 추가: 최적의 페어링 조합 찾기
  async getBestPairingCombination(koreanLiquor, koreanIngredient) {
    const liquorResults = this.searchByKorean(koreanLiquor, 'liquor');
    const ingredientResults = this.searchByKorean(koreanIngredient, 'ingredient');
    
    if (liquorResults.length === 0 || ingredientResults.length === 0) {
      return {
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        suggestions: {
          liquors: liquorResults,
          ingredients: ingredientResults
        }
      };
    }
    
    // 상위 3개씩 조합해서 최고 점수 찾기
    const maxLiquors = Math.min(3, liquorResults.length);
    const maxIngredients = Math.min(3, ingredientResults.length);
    
    return {
      success: true,
      combinations: {
        liquors: liquorResults.slice(0, maxLiquors),
        ingredients: ingredientResults.slice(0, maxIngredients)
      }
    };
  }

  getNodeIdByKorean(koreanLiquor, koreanIngredient) {
    const liquorResults = this.searchByKorean(koreanLiquor, 'liquor');
    const ingredientResults = this.searchByKorean(koreanIngredient, 'ingredient');

    return {
      liquorNodeId: liquorResults.length > 0 ? liquorResults[0].nodeId : null,
      ingredientNodeId: ingredientResults.length > 0 ? ingredientResults[0].nodeId : null,
      liquorName: liquorResults.length > 0 ? liquorResults[0].name : null,
      ingredientName: ingredientResults.length > 0 ? ingredientResults[0].name : null,
      suggestions: {
        liquors: liquorResults,
        ingredients: ingredientResults
      }
    };
  }
}

module.exports = new KoreanToNodeIdMapper();