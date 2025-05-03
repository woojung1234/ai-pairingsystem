/**
 * Admin Controller - 관리자 전용 비즈니스 로직
 */
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const Node = require('../../models/mysql/Node');
const Edge = require('../../models/mysql/Edge');
const Pairing = require('../../models/mysql/Pairing');
const { pool } = require('../../config/db');
const logger = require('../../utils/logger');

/**
 * @desc    Hub_Nodes.csv 데이터 import
 * @route   POST /api/admin/import/nodes
 * @access  Private/Admin
 */
const importNodes = async (req, res) => {
  try {
    const nodesPath = path.join(__dirname, '../../../ai-server/dataset/Hub_Nodes.csv');
    
    if (!fs.existsSync(nodesPath)) {
      return res.status(404).json({ message: 'Hub_Nodes.csv file not found' });
    }

    const conn = await pool.getConnection();
    
    try {
      // LOAD DATA INFILE 실행
      const query = `
        LOAD DATA LOCAL INFILE ?
        INTO TABLE nodes
        FIELDS TERMINATED BY ',' ENCLOSED BY '"'
        LINES TERMINATED BY '\\n'
        IGNORE 1 ROWS
        (node_id, name, @external_id, node_type, is_hub)
        SET external_id = NULLIF(@external_id, '')
      `;
      
      await conn.query(query, [nodesPath]);
      
      res.json({ message: 'Nodes data imported successfully' });
    } finally {
      conn.release();
    }
  } catch (error) {
    logger.error(`Error in importNodes: ${error.message}`);
    res.status(500).json({ message: 'Failed to import nodes data', error: error.message });
  }
};

/**
 * @desc    Hub_Edges.csv 데이터 import
 * @route   POST /api/admin/import/edges
 * @access  Private/Admin
 */
const importEdges = async (req, res) => {
  try {
    const edgesPath = path.join(__dirname, '../../../ai-server/dataset/Hub_Edges.csv');
    
    if (!fs.existsSync(edgesPath)) {
      return res.status(404).json({ message: 'Hub_Edges.csv file not found' });
    }

    const conn = await pool.getConnection();
    
    try {
      // 임시 테이블 생성
      await conn.query(`
        CREATE TEMPORARY TABLE temp_edges (
          source INT,
          target INT,
          score DECIMAL(10,8),
          edge_type VARCHAR(20)
        )
      `);

      // 데이터 로드
      await conn.query(`
        LOAD DATA LOCAL INFILE ?
        INTO TABLE temp_edges
        FIELDS TERMINATED BY ',' ENCLOSED BY '"'
        LINES TERMINATED BY '\\n'
        IGNORE 1 ROWS
        (source, target, @score, edge_type)
        SET score = NULLIF(@score, '')
      `, [edgesPath]);

      // edges 테이블로 복사
      await conn.query(`
        INSERT INTO edges (source_id, target_id, score, edge_type)
        SELECT 
          (SELECT id FROM nodes WHERE node_id = te.source),
          (SELECT id FROM nodes WHERE node_id = te.target),
          te.score,
          te.edge_type
        FROM temp_edges te
      `);

      // 임시 테이블 삭제
      await conn.query('DROP TEMPORARY TABLE temp_edges');
      
      res.json({ message: 'Edges data imported successfully' });
    } finally {
      conn.release();
    }
  } catch (error) {
    logger.error(`Error in importEdges: ${error.message}`);
    res.status(500).json({ message: 'Failed to import edges data', error: error.message });
  }
};

/**
 * @desc    모든 페어링 점수 재계산
 * @route   POST /api/admin/recalculate
 * @access  Private/Admin
 */
const recalculatePairings = async (req, res) => {
  try {
    // liquor-ingredient 관계를 pairings 테이블로 추가
    const conn = await pool.getConnection();
    
    try {
      await conn.query(`
        INSERT IGNORE INTO pairings (liquor_id, ingredient_id, score)
        SELECT 
          l.id,
          i.id,
          e.score
        FROM edges e
        JOIN nodes n1 ON e.source_id = n1.id
        JOIN nodes n2 ON e.target_id = n2.id
        JOIN liquors l ON n1.id = l.node_id
        JOIN ingredients i ON n2.id = i.node_id
        WHERE n1.node_type = 'liquor' AND n2.node_type = 'ingredient'
        UNION
        SELECT 
          l.id,
          i.id,
          e.score
        FROM edges e
        JOIN nodes n1 ON e.source_id = n1.id
        JOIN nodes n2 ON e.target_id = n2.id
        JOIN ingredients i ON n1.id = i.node_id
        JOIN liquors l ON n2.id = l.node_id
        WHERE n1.node_type = 'ingredient' AND n2.node_type = 'liquor'
      `);

      res.json({ message: 'Pairings recalculated successfully' });
    } finally {
      conn.release();
    }
  } catch (error) {
    logger.error(`Error in recalculatePairings: ${error.message}`);
    res.status(500).json({ message: 'Failed to recalculate pairings', error: error.message });
  }
};

/**
 * @desc    시스템 통계 조회
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getSystemStats = async (req, res) => {
  try {
    const [nodeStats] = await pool.query(`
      SELECT node_type, COUNT(*) as count
      FROM nodes
      GROUP BY node_type
    `);

    const [edgeStats] = await pool.query(`
      SELECT edge_type, COUNT(*) as count
      FROM edges
      GROUP BY edge_type
    `);

    const [userStats] = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    const [pairingStats] = await pool.query(`
      SELECT COUNT(*) as total_pairings,
             AVG(score) as avg_score,
             AVG(user_rating) as avg_user_rating
      FROM pairings
    `);

    res.json({
      nodes: nodeStats.reduce((acc, curr) => {
        acc[curr.node_type] = curr.count;
        return acc;
      }, {}),
      edges: edgeStats.reduce((acc, curr) => {
        acc[curr.edge_type] = curr.count;
        return acc;
      }, {}),
      users: userStats.reduce((acc, curr) => {
        acc[curr.role] = curr.count;
        return acc;
      }, {}),
      pairings: pairingStats[0]
    });
  } catch (error) {
    logger.error(`Error in getSystemStats: ${error.message}`);
    res.status(500).json({ message: 'Failed to get system stats', error: error.message });
  }
};

/**
 * @desc    데이터베이스 상태 확인
 * @route   GET /api/admin/health
 * @access  Private/Admin
 */
const checkHealth = async (req, res) => {
  try {
    // 데이터베이스 연결 확인
    await pool.query('SELECT 1');

    // 각 테이블의 상태 확인
    const tables = ['nodes', 'edges', 'liquors', 'ingredients', 'compounds', 'pairings', 'users'];
    const tableStatus = {};

    for (const table of tables) {
      try {
        const [result] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        tableStatus[table] = { status: 'ok', count: result[0].count };
      } catch (error) {
        tableStatus[table] = { status: 'error', error: error.message };
      }
    }

    res.json({
      database: 'connected',
      tables: tableStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error in checkHealth: ${error.message}`);
    res.status(500).json({ message: 'Database health check failed', error: error.message });
  }
};

/**
 * @desc    로그 조회
 * @route   GET /api/admin/logs
 * @access  Private/Admin
 */
const getLogs = async (req, res) => {
  try {
    const { type = 'error', limit = 100 } = req.query;
    const logsDir = path.join(__dirname, '../../../logs');
    
    let logFile;
    switch (type) {
      case 'error':
        logFile = path.join(logsDir, 'error.log');
        break;
      case 'access':
        logFile = path.join(logsDir, 'access.log');
        break;
      default:
        logFile = path.join(logsDir, 'combined.log');
    }

    if (!fs.existsSync(logFile)) {
      return res.status(404).json({ message: 'Log file not found' });
    }

    // 파일의 마지막 N 줄 읽기
    const logs = await new Promise((resolve, reject) => {
      const lines = [];
      const rl = require('readline').createInterface({
        input: fs.createReadStream(logFile),
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        lines.push(line);
        if (lines.length > parseInt(limit)) {
          lines.shift();
        }
      });

      rl.on('close', () => resolve(lines));
      rl.on('error', reject);
    });

    res.json({ logs });
  } catch (error) {
    logger.error(`Error in getLogs: ${error.message}`);
    res.status(500).json({ message: 'Failed to read logs', error: error.message });
  }
};

module.exports = {
  importNodes,
  importEdges,
  recalculatePairings,
  getSystemStats,
  checkHealth,
  getLogs
};
