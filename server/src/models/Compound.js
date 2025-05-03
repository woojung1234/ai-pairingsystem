const pool = require('../config/db');
const logger = require('../utils/logger');

class Compound {
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, n.is_hub
        FROM compounds c
        JOIN nodes n ON c.node_id = n.id
      `);
      return rows;
    } catch (error) {
      logger.error('Error getting all compounds:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, n.is_hub, n.created_at as node_created_at, n.updated_at as node_updated_at
        FROM compounds c
        JOIN nodes n ON c.node_id = n.id
        WHERE c.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      logger.error('Error getting compound by id:', error);
      throw error;
    }
  }

  static async searchByName(searchTerm) {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, n.is_hub
        FROM compounds c
        JOIN nodes n ON c.node_id = n.id
        WHERE c.name LIKE ?
        ORDER BY 
          CASE 
            WHEN c.name = ? THEN 1
            WHEN c.name LIKE ? THEN 2
            ELSE 3
          END
        LIMIT 20
      `, [`%${searchTerm}%`, searchTerm, `${searchTerm}%`]);
      return rows;
    } catch (error) {
      logger.error('Error searching compounds:', error);
      throw error;
    }
  }

  static async create(compoundData) {
    const { name, externalId, chemicalFormula, description } = compoundData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create node first
      const [nodeResult] = await connection.execute(
        `INSERT INTO nodes 
         (node_id, name, external_id, node_type, is_hub, description, image_url)
         VALUES (?, ?, ?, 'compound', ?, ?, ?)`,
        [
          compoundData.nodeId || Math.floor(Math.random() * 1000000), 
          name, 
          externalId, 
          compoundData.isHub || false, 
          description, 
          null
        ]
      );
      
      const nodeId = nodeResult.insertId;
      
      // Create compound
      const [compoundResult] = await connection.execute(
        `INSERT INTO compounds 
         (node_id, name, external_id, chemical_formula, description)
         VALUES (?, ?, ?, ?, ?)`,
        [nodeId, name, externalId, chemicalFormula, description]
      );
      
      await connection.commit();
      return compoundResult.insertId;
    } catch (error) {
      await connection.rollback();
      logger.error('Error creating compound:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, compoundData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update compound table
      const compoundUpdates = [];
      const compoundValues = [];
      
      ['name', 'externalId', 'chemicalFormula', 'description'].forEach(key => {
        if (compoundData[key] !== undefined) {
          compoundUpdates.push(`${this.camelToSnake(key)} = ?`);
          compoundValues.push(compoundData[key]);
        }
      });
      
      if (compoundUpdates.length > 0) {
        compoundValues.push(id);
        await connection.execute(
          `UPDATE compounds SET ${compoundUpdates.join(', ')} WHERE id = ?`,
          compoundValues
        );
      }
      
      // Update node table if needed
      const nodeUpdates = [];
      const nodeValues = [];
      
      ['name', 'externalId', 'description'].forEach(key => {
        if (compoundData[key] !== undefined) {
          nodeUpdates.push(`${this.camelToSnake(key)} = ?`);
          nodeValues.push(compoundData[key]);
        }
      });
      
      if (compoundData.isHub !== undefined) {
        nodeUpdates.push(`is_hub = ?`);
        nodeValues.push(compoundData.isHub);
      }
      
      if (nodeUpdates.length > 0) {
        nodeValues.push(id);
        await connection.execute(
          `UPDATE nodes n
           JOIN compounds c ON n.id = c.node_id
           SET ${nodeUpdates.join(', ')}
           WHERE c.id = ?`,
          nodeValues
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error('Error updating compound:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      // Cascading delete will handle nodes table
      const [result] = await pool.execute(
        'DELETE FROM compounds WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting compound:', error);
      throw error;
    }
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Compound;