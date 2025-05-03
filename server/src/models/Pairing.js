const pool = require('../config/db');
const logger = require('../utils/logger');

class Pairing {
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, 
               l.name as liquor_name, l.type as liquor_type,
               i.name as ingredient_name, i.category as ingredient_category
        FROM pairings p
        JOIN liquors l ON p.liquor_id = l.id
        JOIN ingredients i ON p.ingredient_id = i.id
      `);
      return rows;
    } catch (error) {
      logger.error('Error getting all pairings:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, 
               l.name as liquor_name, l.type as liquor_type, l.origin as liquor_origin,
               i.name as ingredient_name, i.category as ingredient_category
        FROM pairings p
        JOIN liquors l ON p.liquor_id = l.id
        JOIN ingredients i ON p.ingredient_id = i.id
        WHERE p.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      logger.error('Error getting pairing by id:', error);
      throw error;
    }
  }

  static async getByLiquorAndIngredient(liquorId, ingredientId) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*
        FROM pairings p
        WHERE p.liquor_id = ? AND p.ingredient_id = ?
      `, [liquorId, ingredientId]);
      return rows[0];
    } catch (error) {
      logger.error('Error getting pairing by liquor and ingredient:', error);
      throw error;
    }
  }

  static async getByLiquor(liquorId) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, 
               i.name as ingredient_name, i.category as ingredient_category
        FROM pairings p
        JOIN ingredients i ON p.ingredient_id = i.id
        WHERE p.liquor_id = ?
        ORDER BY p.score DESC
      `, [liquorId]);
      return rows;
    } catch (error) {
      logger.error('Error getting pairings by liquor:', error);
      throw error;
    }
  }

  static async getByIngredient(ingredientId) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, 
               l.name as liquor_name, l.type as liquor_type
        FROM pairings p
        JOIN liquors l ON p.liquor_id = l.id
        WHERE p.ingredient_id = ?
        ORDER BY p.score DESC
      `, [ingredientId]);
      return rows;
    } catch (error) {
      logger.error('Error getting pairings by ingredient:', error);
      throw error;
    }
  }

  static async getTopPairings(limit = 10) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, 
               l.name as liquor_name, l.type as liquor_type,
               i.name as ingredient_name, i.category as ingredient_category
        FROM pairings p
        JOIN liquors l ON p.liquor_id = l.id
        JOIN ingredients i ON p.ingredient_id = i.id
        ORDER BY p.score DESC
        LIMIT ?
      `, [limit]);
      return rows;
    } catch (error) {
      logger.error('Error getting top pairings:', error);
      throw error;
    }
  }

  static async create(pairingData) {
    const { liquorId, ingredientId, score, explanation, userRating } = pairingData;
    
    try {
      const [result] = await pool.execute(
        `INSERT INTO pairings 
         (liquor_id, ingredient_id, score, explanation, user_rating)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         score = VALUES(score),
         explanation = VALUES(explanation),
         user_rating = VALUES(user_rating)`,
        [liquorId, ingredientId, score, explanation || null, userRating || null]
      );
      
      return result.insertId || pairingData.id;
    } catch (error) {
      logger.error('Error creating pairing:', error);
      throw error;
    }
  }

  static async update(id, pairingData) {
    const updates = [];
    const values = [];
    
    Object.keys(pairingData).forEach(key => {
      if (pairingData[key] !== undefined && key !== 'id') {
        updates.push(`${this.camelToSnake(key)} = ?`);
        values.push(pairingData[key]);
      }
    });
    
    if (updates.length === 0) return false;
    
    values.push(id);
    
    try {
      const [result] = await pool.execute(
        `UPDATE pairings SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating pairing:', error);
      throw error;
    }
  }

  static async updateRating(id, rating) {
    try {
      const [result] = await pool.execute(
        'UPDATE pairings SET user_rating = ? WHERE id = ?',
        [rating, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating pairing rating:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM pairings WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting pairing:', error);
      throw error;
    }
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Pairing;