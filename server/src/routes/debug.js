const express = require('express');
const router = express.Router();
const db = require('../config/db');
const pool = db.pool;
const logger = require('../utils/logger');

/**
 * @route   GET /api/debug/tables
 * @desc    테이블 목록 조회
 * @access  Public
 */
router.get('/tables', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [process.env.DB_NAME || 'ai_pairing_db']);
    
    res.json({ tables: rows.map(row => row.table_name) });
  } catch (error) {
    logger.error(`Error getting tables: ${error.message}`);
    res.status(500).json({ message: 'Error fetching tables', error: error.message });
  }
});

/**
 * @route   GET /api/debug/table/:name
 * @desc    특정 테이블의 데이터 조회
 * @access  Public
 */
router.get('/table/:name', async (req, res) => {
  try {
    const tableName = req.params.name;
    
    // SQL 인젝션 방지를 위한 기본적인 검증
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ message: 'Invalid table name' });
    }
    
    const [rows] = await pool.query(`
      SELECT * FROM ${tableName} LIMIT 100
    `);
    
    res.json({ table: tableName, data: rows, count: rows.length });
  } catch (error) {
    logger.error(`Error getting table data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching table data', error: error.message });
  }
});

/**
 * @route   GET /api/debug/count/:name
 * @desc    특정 테이블의 레코드 수 조회
 * @access  Public
 */
router.get('/count/:name', async (req, res) => {
  try {
    const tableName = req.params.name;
    
    // SQL 인젝션 방지를 위한 기본적인 검증
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ message: 'Invalid table name' });
    }
    
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count FROM ${tableName}
    `);
    
    res.json({ table: tableName, count: rows[0].count });
  } catch (error) {
    logger.error(`Error counting records: ${error.message}`);
    res.status(500).json({ message: 'Error counting records', error: error.message });
  }
});

module.exports = router;
