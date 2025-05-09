/**
 * Hub_Nodes.csv와 Hub_Edges.csv 데이터를 MySQL 데이터베이스로 임포트하는 스크립트
 * 
 * 사용 방법:
 * node import-hub-data.js
 */

require('dotenv').config({ path: '../../../.env' });
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');
const db = require('../config/db');
const logger = require('../utils/logger');

// 경로 설정
const HUB_NODES_PATH = path.join(__dirname, '../../../ai-server/dataset/Hub_Nodes.csv');
const HUB_EDGES_PATH = path.join(__dirname, '../../../ai-server/dataset/Hub_Edges.csv');

// Node 타입 매핑
const NODE_TYPE_MAP = {
  'ingredient': 'ingredient',
  'liquor': 'liquor',
  'compound': 'compound'
};

// CSV 파일 읽기 함수
function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// 메인 함수
async function importHubData() {
  let connection;
  
  try {
    console.log('데이터베이스 연결 중...');
    
    // DB 연결
    connection = await db.pool.getConnection();
    
    // 트랜잭션 시작
    await connection.beginTransaction();
    
    // 기존 테이블 확인
    let [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME || 'ai_pairing_db'}'
    `);
    
    const tableExists = tables.some(t => t.TABLE_NAME === 'nodes');
    
    if (!tableExists) {
      // nodes 테이블 생성
      await connection.query(`
        CREATE TABLE IF NOT EXISTS nodes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          node_id INT NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          external_id VARCHAR(100),
          node_type ENUM('ingredient', 'liquor', 'compound') NOT NULL,
          is_hub BOOLEAN DEFAULT FALSE,
          description TEXT,
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_node_id (node_id),
          INDEX idx_name (name),
          INDEX idx_node_type (node_type)
        )
      `);
      
      // edges 테이블 생성
      await connection.query(`
        CREATE TABLE IF NOT EXISTS edges (
          id INT AUTO_INCREMENT PRIMARY KEY,
          source_id INT NOT NULL,
          target_id INT NOT NULL,
          score DECIMAL(10,8),
          edge_type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_source (source_id),
          INDEX idx_target (target_id),
          INDEX idx_edge_type (edge_type)
        )
      `);
    }
    
    // Hub_Nodes.csv 읽기
    console.log('Hub_Nodes.csv 파일 읽는 중...');
    const hubNodes = await readCsvFile(HUB_NODES_PATH);
    console.log(`${hubNodes.length}개의 허브 노드를 찾았습니다.`);
    
    // nodes 테이블에 데이터 삽입
    console.log('nodes 테이블에 데이터 삽입 중...');
    const nodeIdMap = {}; // node_id -> DB id 매핑을 위한 객체
    
    for (const node of hubNodes) {
      // 이미 존재하는지 확인
      const [existingNodes] = await connection.query(
        'SELECT id FROM nodes WHERE node_id = ?',
        [node.node_id]
      );
      
      if (existingNodes.length > 0) {
        nodeIdMap[node.node_id] = existingNodes[0].id;
        continue;
      }
      
      // 노드 타입 확인 및 수정
      const nodeType = NODE_TYPE_MAP[node.node_type] || 'ingredient';
      const isHub = node.is_hub === 'hub' || node.is_hub === 'true' || node.is_hub === '1';
      
      // 노드 추가
      const [result] = await connection.query(
        `INSERT INTO nodes 
         (node_id, name, external_id, node_type, is_hub) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          node.node_id,
          node.name,
          node.id || null,
          nodeType,
          isHub
        ]
      );
      
      nodeIdMap[node.node_id] = result.insertId;
    }
    
    // Hub_Edges.csv 읽기
    console.log('Hub_Edges.csv 파일 읽는 중...');
    const hubEdges = await readCsvFile(HUB_EDGES_PATH);
    console.log(`${hubEdges.length}개의 엣지를 찾았습니다.`);
    
    // 누락된 노드가 있는지 확인 및 추가
    const missingNodeIds = new Set();
    
    for (const edge of hubEdges) {
      if (!nodeIdMap[edge.source]) missingNodeIds.add(edge.source);
      if (!nodeIdMap[edge.target]) missingNodeIds.add(edge.target);
    }
    
    // 누락된 노드 추가
    if (missingNodeIds.size > 0) {
      console.log(`${missingNodeIds.size}개의 누락된 노드를 추가합니다...`);
      
      for (const nodeId of missingNodeIds) {
        // 이미 존재하는지 확인
        const [existingNodes] = await connection.query(
          'SELECT id FROM nodes WHERE node_id = ?',
          [nodeId]
        );
        
        if (existingNodes.length > 0) {
          nodeIdMap[nodeId] = existingNodes[0].id;
          continue;
        }
        
        // 노드 추가 (기본값으로 ingredient 타입)
        const [result] = await connection.query(
          `INSERT INTO nodes 
           (node_id, name, node_type, is_hub) 
           VALUES (?, ?, ?, ?)`,
          [
            nodeId,
            `Node ${nodeId}`,
            'ingredient',
            false
          ]
        );
        
        nodeIdMap[nodeId] = result.insertId;
      }
    }
    
    // edges 테이블에 데이터 삽입
    console.log('edges 테이블에 데이터 삽입 중...');
    let edgeCount = 0;
    let skipCount = 0;
    
    for (const edge of hubEdges) {
      // 필요한 노드 ID가 맵에 있는지 확인
      if (!nodeIdMap[edge.source] || !nodeIdMap[edge.target]) {
        console.warn(`누락된 노드 ID: source=${edge.source}, target=${edge.target}`);
        skipCount++;
        continue;
      }
      
      // 이미 존재하는지 확인
      const [existingEdges] = await connection.query(
        'SELECT id FROM edges WHERE source_id = ? AND target_id = ? AND edge_type = ?',
        [nodeIdMap[edge.source], nodeIdMap[edge.target], edge.edge_type]
      );
      
      if (existingEdges.length > 0) {
        skipCount++;
        continue;
      }
      
      // 엣지 추가
      try {
        await connection.query(
          `INSERT INTO edges 
           (source_id, target_id, score, edge_type) 
           VALUES (?, ?, ?, ?)`,
          [
            nodeIdMap[edge.source],
            nodeIdMap[edge.target],
            edge.score,
            edge.edge_type
          ]
        );
        
        edgeCount++;
        
        // 진행 상황 로깅 (100개마다)
        if (edgeCount % 100 === 0) {
          console.log(`${edgeCount}개의 엣지 삽입 완료...`);
        }
      } catch (error) {
        console.warn(`엣지 삽입 오류: ${error.message}`);
        skipCount++;
      }
    }
    
    // 커밋
    await connection.commit();
    
    console.log('데이터 임포트 완료');
    console.log(`총 ${hubNodes.length}개 노드와 ${edgeCount}개 엣지 추가 (${skipCount}개 엣지 건너뜀)`);
  } catch (error) {
    // 오류 발생 시 롤백
    if (connection) {
      await connection.rollback();
    }
    
    console.error('데이터 임포트 오류:', error);
    logger.error(`데이터 임포트 오류: ${error.message}`);
  } finally {
    // 연결 해제
    if (connection) {
      connection.release();
    }
  }
}

// 스크립트 실행
importHubData()
  .then(() => {
    console.log('스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('스크립트 실행 오류:', error);
    process.exit(1);
  });
