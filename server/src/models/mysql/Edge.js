/**
 * MySQL Edge Model
 * 
 * 노드 간 관계를 나타내는 Edge 모델
 */
const db = require('../../config/db');
const pool = db.pool;
const logger = require('../../utils/logger');

class Edge {
  /**
 * 모든 Edge 조회
 */
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT e.*, 
               sn.name as source_name, sn.node_type as source_type,
               tn.name as target_name, tn.node_type as target_type
        FROM edges e
        JOIN nodes sn ON e.source_id = sn.id
        JOIN nodes tn ON e.target_id = tn.id
        ORDER BY e.edge_type, e.created_at DESC
      `);
      return rows;
    } catch (error) {
      logger.error(`Error in Edge.getAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * ID로 Edge 조회
   */
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT e.*, 
               sn.name as source_name, sn.node_type as source_type,
               tn.name as target_name, tn.node_type as target_type
        FROM edges e
        JOIN nodes sn ON e.source_id = sn.id
        JOIN nodes tn ON e.target_id = tn.id
        WHERE e.id = ?
      `, [id]);
      
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error in Edge.getById: ${error.message}`);
      throw error;
    }
  }

  /**
   * 노드 ID로 관련 Edge 조회
   */
  static async getByNodeId(nodeId) {
    try {
      const [rows] = await pool.query(`
        SELECT e.*, 
               sn.name as source_name, sn.node_type as source_type,
               tn.name as target_name, tn.node_type as target_type
        FROM edges e
        JOIN nodes sn ON e.source_id = sn.id
        JOIN nodes tn ON e.target_id = tn.id
        WHERE e.source_id = ? OR e.target_id = ?
        ORDER BY e.edge_type, e.score DESC
      `, [nodeId, nodeId]);
      
      return rows;
    } catch (error) {
      logger.error(`Error in Edge.getByNodeId: ${error.message}`);
      throw error;
    }
  }

  /**
   * 두 노드 간의 Edge 조회
   */
  static async getByNodes(sourceId, targetId, edgeType = null) {
    try {
      let query = `
        SELECT e.*, 
               sn.name as source_name, sn.node_type as source_type,
               tn.name as target_name, tn.node_type as target_type
        FROM edges e
        JOIN nodes sn ON e.source_id = sn.id
        JOIN nodes tn ON e.target_id = tn.id
        WHERE e.source_id = ? AND e.target_id = ?
      `;
      
      const params = [sourceId, targetId];
      
      if (edgeType) {
        query += ' AND e.edge_type = ?';
        params.push(edgeType);
      }
      
      const [rows] = await pool.query(query, params);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error in Edge.getByNodes: ${error.message}`);
      throw error;
    }
  }

  /**
   * 새로운 Edge 생성
   */
  static async create(edgeData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 중복 확인
      const [existing] = await connection.query(
        'SELECT id FROM edges WHERE source_id = ? AND target_id = ? AND edge_type = ?',
        [edgeData.source_id, edgeData.target_id, edgeData.edge_type]
      );
      
      if (existing.length > 0) {
        await connection.commit();
        return await this.getById(existing[0].id);
      }
      
      // Edge 생성
      const [result] = await connection.query(
        `INSERT INTO edges (source_id, target_id, edge_type, score, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          edgeData.source_id,
          edgeData.target_id,
          edgeData.edge_type,
          edgeData.score || 0,
          edgeData.notes || null
        ]
      );
      
      await connection.commit();
      
      // 생성된 Edge 반환
      const id = result.insertId;
      return this.getById(id);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Edge.create: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Edge 정보 수정
   */
  static async update(id, updateData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const updates = [];
      const values = [];
      
      // 업데이트할 필드 추가
      if (updateData.score !== undefined) {
        updates.push('score = ?');
        values.push(updateData.score);
      }
      
      if (updateData.notes !== undefined) {
        updates.push('notes = ?');
        values.push(updateData.notes);
      }
      
      if (updateData.edge_type !== undefined) {
        updates.push('edge_type = ?');
        values.push(updateData.edge_type);
      }
      
      if (updates.length === 0) {
        await connection.commit();
        return true;
      }
      
      // ID 추가
      values.push(id);
      
      // 업데이트 쿼리 실행
      await connection.query(
        `UPDATE edges SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Edge.update: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Edge 삭제
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM edges WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error in Edge.delete: ${error.message}`);
      throw error;
    }
  }

  /**
   * 엣지 타입으로 조회
   */
  static async getByType(edgeType) {
    try {
      const [rows] = await pool.query(`
        SELECT e.*, 
               sn.name as source_name, sn.node_type as source_type,
               tn.name as target_name, tn.node_type as target_type
        FROM edges e
        JOIN nodes sn ON e.source_id = sn.id
        JOIN nodes tn ON e.target_id = tn.id
        WHERE e.edge_type = ?
        ORDER BY e.score DESC
      `, [edgeType]);
      
      return rows;
    } catch (error) {
      logger.error(`Error in Edge.getByType: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Edge;
