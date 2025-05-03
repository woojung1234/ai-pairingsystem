const pool = require('../config/db');
const logger = require('../utils/logger');

class Ingredient {
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT i.*, n.is_hub
        FROM ingredients i
        JOIN nodes n ON i.node_id = n.id
      `);
      return rows;
    } catch (error) {
      logger.error('Error getting all ingredients:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT i.*, n.is_hub, n.created_at as node_created_at, n.updated_at as node_updated_at
        FROM ingredients i
        JOIN nodes n ON i.node_id = n.id
        WHERE i.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      logger.error('Error getting ingredient by id:', error);
      throw error;
    }
  }

  static async getByCategory(category) {
    try {
      const [rows] = await pool.execute(`
        SELECT i.*, n.is_hub
        FROM ingredients i
        JOIN nodes n ON i.node_id = n.id
        WHERE i.category = ?
      `, [category]);
      return rows;
    } catch (error) {
      logger.error('Error getting ingredients by category:', error);
      throw error;
    }
  }

  static async searchByName(searchTerm) {
    try {
      const [rows] = await pool.execute(`
        SELECT i.*, n.is_hub
        FROM ingredients i
        JOIN nodes n ON i.node_id = n.id
        WHERE i.name LIKE ?
        ORDER BY 
          CASE 
            WHEN i.name = ? THEN 1
            WHEN i.name LIKE ? THEN 2
            ELSE 3
          END
        LIMIT 20
      `, [`%${searchTerm}%`, searchTerm, `${searchTerm}%`]);
      return rows;
    } catch (error) {
      logger.error('Error searching ingredients:', error);
      throw error;
    }
  }

  static async create(ingredientData) {
    const { name, category, description, imageUrl } = ingredientData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create node first
      const [nodeResult] = await connection.execute(
        `INSERT INTO nodes 
         (node_id, name, external_id, node_type, is_hub, description, image_url)
         VALUES (?, ?, ?, 'ingredient', false, ?, ?)`,
        [ingredientData.nodeId || Math.floor(Math.random() * 1000000), name, null, description, imageUrl]
      );
      
      const nodeId = nodeResult.insertId;
      
      // Create ingredient
      const [ingredientResult] = await connection.execute(
        `INSERT INTO ingredients 
         (node_id, name, category, description, image_url)
         VALUES (?, ?, ?, ?, ?)`,
        [nodeId, name, category, description, imageUrl]
      );
      
      await connection.commit();
      return ingredientResult.insertId;
    } catch (error) {
      await connection.rollback();
      logger.error('Error creating ingredient:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, ingredientData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update ingredient table
      const ingredientUpdates = [];
      const ingredientValues = [];
      
      ['name', 'category', 'description', 'imageUrl'].forEach(key => {
        if (ingredientData[key] !== undefined) {
          ingredientUpdates.push(`${this.camelToSnake(key)} = ?`);
          ingredientValues.push(ingredientData[key]);
        }
      });
      
      if (ingredientUpdates.length > 0) {
        ingredientValues.push(id);
        await connection.execute(
          `UPDATE ingredients SET ${ingredientUpdates.join(', ')} WHERE id = ?`,
          ingredientValues
        );
      }
      
      // Update node table if needed
      const nodeUpdates = [];
      const nodeValues = [];
      
      ['name', 'description', 'imageUrl'].forEach(key => {
        if (ingredientData[key] !== undefined) {
          nodeUpdates.push(`${this.camelToSnake(key)} = ?`);
          nodeValues.push(ingredientData[key]);
        }
      });
      
      if (nodeUpdates.length > 0) {
        nodeValues.push(id);
        await connection.execute(
          `UPDATE nodes n
           JOIN ingredients i ON n.id = i.node_id
           SET ${nodeUpdates.join(', ')}
           WHERE i.id = ?`,
          nodeValues
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error('Error updating ingredient:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      // Cascading delete will handle nodes table
      const [result] = await pool.execute(
        'DELETE FROM ingredients WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting ingredient:', error);
      throw error;
    }
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Ingredient;