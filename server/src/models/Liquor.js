const db = require('../config/db');
const pool = db.pool;
const logger = require('../utils/logger');

class Liquor {
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT l.*, n.is_hub
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
      `);
      return rows;
    } catch (error) {
      logger.error('Error getting all liquors:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT l.*, n.is_hub, n.created_at as node_created_at, n.updated_at as node_updated_at
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
        WHERE l.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      logger.error('Error getting liquor by id:', error);
      throw error;
    }
  }

  static async searchByName(searchTerm) {
    try {
      const [rows] = await pool.query(`
        SELECT l.*, n.is_hub
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
        WHERE l.name LIKE ?
        ORDER BY 
          CASE 
            WHEN l.name = ? THEN 1
            WHEN l.name LIKE ? THEN 2
            ELSE 3
          END
        LIMIT 20
      `, [`%${searchTerm}%`, searchTerm, `${searchTerm}%`]);
      return rows;
    } catch (error) {
      logger.error('Error searching liquors:', error);
      throw error;
    }
  }

  static async create(liquorData) {
    const { name, type, description, origin, alcoholContent, imageUrl } = liquorData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create node first
      const [nodeResult] = await connection.query(
        `INSERT INTO nodes 
         (node_id, name, external_id, node_type, is_hub, description, image_url)
         VALUES (?, ?, ?, 'liquor', false, ?, ?)`,
        [liquorData.nodeId || Math.floor(Math.random() * 1000000), name, null, description, imageUrl]
      );
      
      const nodeId = nodeResult.insertId;
      
      // Create liquor
      const [liquorResult] = await connection.query(
        `INSERT INTO liquors 
         (node_id, name, type, description, origin, alcohol_content, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nodeId, name, type, description, origin, alcoholContent, imageUrl]
      );
      
      await connection.commit();
      return liquorResult.insertId;
    } catch (error) {
      await connection.rollback();
      logger.error('Error creating liquor:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, liquorData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update liquor table
      const liquorUpdates = [];
      const liquorValues = [];
      
      ['name', 'type', 'description', 'origin', 'alcoholContent', 'imageUrl'].forEach(key => {
        if (liquorData[key] !== undefined) {
          liquorUpdates.push(`${this.camelToSnake(key)} = ?`);
          liquorValues.push(liquorData[key]);
        }
      });
      
      if (liquorUpdates.length > 0) {
        liquorValues.push(id);
        await connection.query(
          `UPDATE liquors SET ${liquorUpdates.join(', ')} WHERE id = ?`,
          liquorValues
        );
      }
      
      // Update node table if needed
      const nodeUpdates = [];
      const nodeValues = [];
      
      ['name', 'description', 'imageUrl'].forEach(key => {
        if (liquorData[key] !== undefined) {
          nodeUpdates.push(`${this.camelToSnake(key)} = ?`);
          nodeValues.push(liquorData[key]);
        }
      });
      
      if (nodeUpdates.length > 0) {
        nodeValues.push(id);
        await connection.query(
          `UPDATE nodes n
           JOIN liquors l ON n.id = l.node_id
           SET ${nodeUpdates.join(', ')}
           WHERE l.id = ?`,
          nodeValues
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error('Error updating liquor:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      // Cascading delete will handle nodes table
      const [result] = await pool.query(
        'DELETE FROM liquors WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting liquor:', error);
      throw error;
    }
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Liquor;