const db = require('../config/db');
const pool = db.pool;
const logger = require('../utils/logger');

class Edge {
  static async getAll(edgeType = null) {
    try {
      let query = 'SELECT * FROM edges';
      const values = [];
      
      if (edgeType) {
        query += ' WHERE edge_type = ?';
        values.push(edgeType);
      }
      
      const [rows] = await pool.execute(query, values);
      return rows;
    } catch (error) {
      logger.error('Error getting all edges:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM edges WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error getting edge by id:', error);
      throw error;
    }
  }

  static async getByNodes(sourceId, targetId, edgeType = null) {
    try {
      let query = 'SELECT * FROM edges WHERE source_id = ? AND target_id = ?';
      const values = [sourceId, targetId];
      
      if (edgeType) {
        query += ' AND edge_type = ?';
        values.push(edgeType);
      }
      
      const [rows] = await pool.execute(query, values);
      return rows[0];
    } catch (error) {
      logger.error('Error getting edge by nodes:', error);
      throw error;
    }
  }

  static async getEdgesForNode(nodeId, direction = 'both') {
    try {
      let query;
      let values = [nodeId];
      
      if (direction === 'incoming') {
        query = 'SELECT * FROM edges WHERE target_id = ?';
      } else if (direction === 'outgoing') {
        query = 'SELECT * FROM edges WHERE source_id = ?';
      } else {
        query = 'SELECT * FROM edges WHERE source_id = ? OR target_id = ?';
        values.push(nodeId);
      }
      
      const [rows] = await pool.execute(query, values);
      return rows;
    } catch (error) {
      logger.error('Error getting edges for node:', error);
      throw error;
    }
  }

  static async create(edgeData) {
    const { sourceId, targetId, score, edgeType } = edgeData;
    
    try {
      const [result] = await pool.execute(
        `INSERT INTO edges 
         (source_id, target_id, score, edge_type)
         VALUES (?, ?, ?, ?)`,
        [sourceId, targetId, score || null, edgeType]
      );
      
      return result.insertId;
    } catch (error) {
      logger.error('Error creating edge:', error);
      throw error;
    }
  }

  static async update(id, edgeData) {
    const updates = [];
    const values = [];
    
    Object.keys(edgeData).forEach(key => {
      if (edgeData[key] !== undefined && key !== 'id') {
        updates.push(`${this.camelToSnake(key)} = ?`);
        values.push(edgeData[key]);
      }
    });
    
    if (updates.length === 0) return false;
    
    values.push(id);
    
    try {
      const [result] = await pool.execute(
        `UPDATE edges SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating edge:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM edges WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting edge:', error);
      throw error;
    }
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Edge;