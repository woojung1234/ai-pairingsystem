/**
 * Node 모델 - MySQL 버전
 */
const db = require('../../config/db');
const pool = db.pool;
const logger = require('../../utils/logger');

class Node {
  /**
   * 모든 노드 목록을 조회합니다.
   * @param {Object} options - 조회 옵션 (타입, 허브 여부 등)
   * @returns {Promise<Array>} 노드 객체 배열
   */
  static async findAll(options = {}) {
    try {
      let query = 'SELECT * FROM nodes';
      const whereConditions = [];
      const queryParams = [];

      if (options.node_type) {
        whereConditions.push('node_type = ?');
        queryParams.push(options.node_type);
      }

      if (options.is_hub !== undefined) {
        whereConditions.push('is_hub = ?');
        queryParams.push(options.is_hub);
      }

      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }

      query += ' ORDER BY name ASC';

      if (options.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(options.limit));

        if (options.offset) {
          query += ' OFFSET ?';
          queryParams.push(parseInt(options.offset));
        }
      }

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      logger.error(`Error in Node.findAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * ID로 노드를 조회합니다.
   * @param {number} id - 노드 ID
   * @returns {Promise<Object|null>} 노드 객체 또는 null
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM nodes WHERE id = ?';
      const [rows] = await pool.query(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Error in Node.findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * 외부 ID(node_id)로 노드를 조회합니다.
   * @param {number} nodeId - 외부 노드 ID
   * @returns {Promise<Object|null>} 노드 객체 또는 null
   */
  static async findByNodeId(nodeId) {
    try {
      const query = 'SELECT * FROM nodes WHERE node_id = ?';
      const [rows] = await pool.query(query, [nodeId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error(`Error in Node.findByNodeId: ${error.message}`);
      throw error;
    }
  }

  /**
   * 새 노드를 생성합니다.
   * @param {Object} nodeData - 노드 데이터
   * @returns {Promise<Object>} 생성된 노드 객체
   */
  static async create(nodeData) {
    try {
      const query = `
        INSERT INTO nodes
        (node_id, name, external_id, node_type, is_hub, description, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.query(query, [
        nodeData.node_id,
        nodeData.name,
        nodeData.external_id || null,
        nodeData.node_type,
        nodeData.is_hub || false,
        nodeData.description || null,
        nodeData.image_url || null
      ]);

      return this.findById(result.insertId);
    } catch (error) {
      logger.error(`Error in Node.create: ${error.message}`);
      throw error;
    }
  }

  /**
   * 노드 정보를 업데이트합니다.
   * @param {number} id - 노드 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Object|null>} 업데이트된 노드 객체 또는 null
   */
  static async update(id, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.values(updateData);
      
      const query = `
        UPDATE nodes
        SET ${fields}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await pool.query(query, [...values, id]);
      return this.findById(id);
    } catch (error) {
      logger.error(`Error in Node.update: ${error.message}`);
      throw error;
    }
  }

  /**
   * 노드를 삭제합니다.
   * @param {number} id - 노드 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM nodes WHERE id = ?';
      const [result] = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error in Node.delete: ${error.message}`);
      throw error;
    }
  }

  /**
   * 노드를 검색합니다.
   * @param {string} query - 검색어
   * @returns {Promise<Array>} 검색 결과 배열
   */
  static async search(query) {
    try {
      const searchQuery = `
        SELECT * FROM nodes
        WHERE 
          name LIKE ? OR 
          description LIKE ?
        ORDER BY name ASC
      `;

      const searchParam = `%${query}%`;
      const [rows] = await pool.query(searchQuery, [searchParam, searchParam]);
      return rows;
    } catch (error) {
      logger.error(`Error in Node.search: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Node;