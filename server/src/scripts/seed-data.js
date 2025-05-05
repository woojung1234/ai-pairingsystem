/**
 * 데이터베이스 시드 스크립트
 * 
 * 샘플 데이터를 데이터베이스에 추가합니다.
 */
require('dotenv').config({ path: '../.env' });
const db = require('../config/db');
const pool = db.pool;
const path = require('path');
const fs = require('fs');

async function seedDatabase() {
  try {
    console.log('데이터베이스 연결 중...');
    await db.connectDB();
    
    console.log('샘플 데이터 추가 시작...');
    
    // 사용자 데이터 추가
    const users = [
      { username: 'admin', email: 'admin@example.com', password: '$2a$10$ZvtAnm.M28Zq8p5r23zvROdKTq4UJadQv1FLBFcJlD5.AjVRSFXrW', role: 'admin' },
      { username: 'user1', email: 'user1@example.com', password: '$2a$10$ZvtAnm.M28Zq8p5r23zvROdKTq4UJadQv1FLBFcJlD5.AjVRSFXrW', role: 'user' },
      { username: 'user2', email: 'user2@example.com', password: '$2a$10$ZvtAnm.M28Zq8p5r23zvROdKTq4UJadQv1FLBFcJlD5.AjVRSFXrW', role: 'user' }
    ];
    
    console.log('사용자 데이터 추가 중...');
    for (const user of users) {
      try {
        await pool.query(
          'INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [user.username, user.email, user.password, user.role]
        );
      } catch (error) {
        console.error(`사용자 추가 오류 (${user.username}): ${error.message}`);
      }
    }
    
    // 주류 데이터 추가
    const liquors = [
      { liquor_id: 101, name: '스카치 위스키', type: '위스키', description: '스코틀랜드에서 생산된 전통 위스키', origin: '스코틀랜드', alcohol_content: 40.0, image_url: '/images/scotch.jpg' },
      { liquor_id: 102, name: '버번 위스키', type: '위스키', description: '미국 켄터키산 옥수수 기반 위스키', origin: '미국', alcohol_content: 45.0, image_url: '/images/bourbon.jpg' },
      { liquor_id: 103, name: '데킬라', type: '데킬라', description: '멕시코 아가베 식물로 만든 증류주', origin: '멕시코', alcohol_content: 38.0, image_url: '/images/tequila.jpg' },
      { liquor_id: 104, name: '진', type: '진', description: '주니퍼 베리로 맛을 낸 증류주', origin: '영국', alcohol_content: 42.0, image_url: '/images/gin.jpg' },
      { liquor_id: 105, name: '보드카', type: '보드카', description: '증류된 감자 또는 곡물로 만든 무색 증류주', origin: '러시아', alcohol_content: 40.0, image_url: '/images/vodka.jpg' },
      { liquor_id: 106, name: '럼', type: '럼', description: '사탕수수에서 추출한 당밀로 만든 증류주', origin: '카리브해', alcohol_content: 37.5, image_url: '/images/rum.jpg' }
    ];
    
    console.log('주류 데이터 추가 중...');
    for (const liquor of liquors) {
      try {
        await pool.query(
          'INSERT IGNORE INTO liquors (liquor_id, name, type, description, origin, alcohol_content, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [liquor.liquor_id, liquor.name, liquor.type, liquor.description, liquor.origin, liquor.alcohol_content, liquor.image_url]
        );
      } catch (error) {
        console.error(`주류 추가 오류 (${liquor.name}): ${error.message}`);
      }
    }
    
    // 원재료 데이터 추가
    const ingredients = [
      { ingredient_id: 201, name: '사과', category: '과일', description: '신선하고 달콤한 과일', is_hub: false, image_url: '/images/apple.jpg' },
      { ingredient_id: 202, name: '레몬', category: '감귤류', description: '상큼한 시트러스 과일', is_hub: false, image_url: '/images/lemon.jpg' },
      { ingredient_id: 203, name: '시나몬', category: '향신료', description: '달콤하고 따뜻한 향의 향신료', is_hub: false, image_url: '/images/cinnamon.jpg' },
      { ingredient_id: 204, name: '바닐라', category: '향신료', description: '달콤하고 향긋한 향의 향신료', is_hub: false, image_url: '/images/vanilla.jpg' },
      { ingredient_id: 205, name: '초콜릿', category: '디저트', description: '카카오에서 만든 달콤한 식품', is_hub: false, image_url: '/images/chocolate.jpg' },
      { ingredient_id: 206, name: '바질', category: '허브', description: '향긋한 허브', is_hub: false, image_url: '/images/basil.jpg' },
      { ingredient_id: 207, name: '오렌지', category: '감귤류', description: '달콤한 감귤류 과일', is_hub: false, image_url: '/images/orange.jpg' },
      { ingredient_id: 208, name: '라임', category: '감귤류', description: '신맛이 강한 감귤류 과일', is_hub: false, image_url: '/images/lime.jpg' },
      { ingredient_id: 209, name: '커피', category: '음료', description: '쓴맛과 향이 풍부한 음료', is_hub: false, image_url: '/images/coffee.jpg' },
      { ingredient_id: 210, name: '계피', category: '향신료', description: '달콤하고 스파이시한 향신료', is_hub: false, image_url: '/images/cinnamon_stick.jpg' }
    ];
    
    console.log('원재료 데이터 추가 중...');
    for (const ingredient of ingredients) {
      try {
        await pool.query(
          'INSERT IGNORE INTO ingredients (ingredient_id, name, category, description, is_hub, image_url) VALUES (?, ?, ?, ?, ?, ?)',
          [ingredient.ingredient_id, ingredient.name, ingredient.category, ingredient.description, ingredient.is_hub, ingredient.image_url]
        );
      } catch (error) {
        console.error(`원재료 추가 오류 (${ingredient.name}): ${error.message}`);
      }
    }
    
    // 페어링 데이터 추가
    const pairings = [
      { liquor_id: 1, ingredient_id: 1, score: 0.75, reason: '사과의 달콤한 맛과 위스키의 풍미가 잘 어울립니다.' },
      { liquor_id: 1, ingredient_id: 3, score: 0.85, reason: '시나몬의 스파이시함이 위스키의 깊은 맛을 강화합니다.' },
      { liquor_id: 2, ingredient_id: 5, score: 0.80, reason: '초콜릿의 달콤함이 버번의 바닐라 풍미와 잘 어울립니다.' },
      { liquor_id: 3, ingredient_id: 2, score: 0.90, reason: '레몬의 상큼함이 데킬라의 풍미를 극대화합니다.' },
      { liquor_id: 4, ingredient_id: 6, score: 0.70, reason: '바질의 허브향이 진의 식물성 향과 조화를 이룹니다.' }
    ];
    
    console.log('페어링 데이터 추가 중...');
    for (const pairing of pairings) {
      try {
        await pool.query(
          'INSERT IGNORE INTO pairings (liquor_id, ingredient_id, score, reason) VALUES (?, ?, ?, ?)',
          [pairing.liquor_id, pairing.ingredient_id, pairing.score, pairing.reason]
        );
      } catch (error) {
        console.error(`페어링 추가 오류 (${pairing.liquor_id}-${pairing.ingredient_id}): ${error.message}`);
      }
    }
    
    console.log('샘플 데이터 추가 완료!');
    
  } catch (error) {
    console.error('데이터베이스 시드 오류:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
