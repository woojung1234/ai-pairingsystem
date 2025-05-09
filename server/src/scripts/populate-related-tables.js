/**
 * nodes 테이블 데이터를 기반으로 liquors, ingredients, compounds 테이블을 채우는 스크립트
 */

require('dotenv').config({ path: '../../../.env' });
const db = require('../config/db');
const logger = require('../utils/logger');

async function populateRelatedTables() {
  let connection;
  
  try {
    console.log('데이터베이스 연결 중...');
    connection = await db.pool.getConnection();
    await connection.beginTransaction();
    
    // 기존 테이블 내용 삭제
    console.log('기존 테이블 데이터 삭제 중...');
    await connection.query('DELETE FROM liquors');
    await connection.query('DELETE FROM ingredients');
    await connection.query('DELETE FROM compounds');
    
    // liquors 테이블 채우기
    console.log('liquors 테이블 채우는 중...');
    await connection.query(`
      INSERT INTO liquors (node_id, name, type, description, image_url)
      SELECT id, name, 
        CASE 
          WHEN name LIKE '%위스키%' THEN '위스키'
          WHEN name LIKE '%와인%' THEN '와인'
          WHEN name LIKE '%보드카%' THEN '보드카'
          WHEN name LIKE '%진%' THEN '진'
          WHEN name LIKE '%럼%' THEN '럼'
          WHEN name LIKE '%데킬라%' THEN '데킬라'
          ELSE '기타'
        END as type,
        description, image_url
      FROM nodes
      WHERE node_type = 'liquor'
    `);
    
    const [liquorResult] = await connection.query('SELECT COUNT(*) as count FROM liquors');
    console.log(`${liquorResult[0].count}개의 주류 데이터 추가됨`);
    
    // ingredients 테이블 채우기
    console.log('ingredients 테이블 채우는 중...');
    await connection.query(`
      INSERT INTO ingredients (node_id, name, category, description, image_url)
      SELECT id, name, 
        CASE 
          WHEN name LIKE '%과일%' OR name LIKE '%오렌지%' OR name LIKE '%레몬%' OR name LIKE '%사과%' THEN '과일'
          WHEN name LIKE '%허브%' OR name LIKE '%민트%' OR name LIKE '%바질%' THEN '허브'
          WHEN name LIKE '%향신료%' OR name LIKE '%시나몬%' OR name LIKE '%바닐라%' THEN '향신료'
          WHEN name LIKE '%치즈%' OR name LIKE '%육류%' OR name LIKE '%생선%' THEN '주요 식품'
          WHEN name LIKE '%초콜릿%' OR name LIKE '%디저트%' THEN '디저트'
          ELSE '기타'
        END as category,
        description, image_url
      FROM nodes
      WHERE node_type = 'ingredient'
    `);
    
    const [ingredientResult] = await connection.query('SELECT COUNT(*) as count FROM ingredients');
    console.log(`${ingredientResult[0].count}개의 재료 데이터 추가됨`);
    
    // compounds 테이블 채우기
    console.log('compounds 테이블 채우는 중...');
    await connection.query(`
      INSERT INTO compounds (node_id, name, description, compound_id)
      SELECT id, name, description, CONCAT('C', id) as compound_id
      FROM nodes
      WHERE node_type = 'compound'
    `);
    
    const [compoundResult] = await connection.query('SELECT COUNT(*) as count FROM compounds');
    console.log(`${compoundResult[0].count}개의 화합물 데이터 추가됨`);
    
    // 트랜잭션 커밋
    await connection.commit();
    console.log('관련 테이블 채우기 완료');
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('테이블 채우기 오류:', error);
    logger.error(`테이블 채우기 오류: ${error.message}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 스크립트 실행
populateRelatedTables()
  .then(() => {
    console.log('스크립트 실행 완료');
    process.exit(0);
  })
  .catch(error => {
    console.error('스크립트 실행 오류:', error);
    process.exit(1);
  });
