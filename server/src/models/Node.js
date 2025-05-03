const pool = require('../config/db');
const logger = require('../utils/logger');

class Node {
  static async getAll(nodeType = null) {
    try {
      let query = 'SELECT * FROM nodes';
      const values = [];
      
      if (nodeType) {
        query += ' WHERE node_type = ?';
        values.push(nodeType);
      }
      
      const [rows] = await pool.execute(query, values);
      return rows;
    } catch (error) {
      logger.error('Error getting all nodes:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM nodes WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error getting node by id:', error);
      throw error;
    }
  }

  static async getByNodeId(nodeId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM nodes WHERE node_id = ?',
        [nodeId]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error getting node by node_id:', error);
      throw error;
    }
  }

  static async searchByName(searchTerm) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM nodes 
         WHERE name LIKE ?
         ORDER BY 
           CASE 
             WHEN name = ? THEN 1
             WHEN name LIKE ? THEN 2
             ELSE 3
           END
         LIMIT 50`,
        [`%${searchTerm}%`, searchTerm, `${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      logger.error('Error searching nodes:', error);
      throw error;
    }
  }

  static async create(nodeData) {
    const { nodeId, name, externalId, nodeType, isHub, description, imageUrl } = nodeData;
    
    try {
      const [result] = await pool.execute(
        `INSERT INTO nodes 
         (node_id, name, external_id, node_type, is_hub, description, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nodeId, name, externalId, nodeType, isHub || false, description || null, imageUrl || null]
      );
      
      return result.insertId;
    } catch (error) {
      logger.error('Error creating node:', error);
      throw error;
    }
  }

  static async update(id, nodeData) {
    const updates = [];
    const values = [];
    
    Object.keys(nodeData).forEach(key => {
      if (nodeData[key] !== undefined && key !== 'id' && key !== 'nodeId') {
        updates.push(`${this.camelToSnake(key)} = ?`);
        values.push(nodeData[key]);
      }
    });
    
    if (updates.length === 0) return false;
    
    values.push(id);
    
    try {
      const [result] = await pool.execute(
        `UPDATE nodes SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating node:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM nodes WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting node:', error);
      throw error;
    }
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Node;