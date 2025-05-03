const pool = require('../config/db');
const logger = require('../utils/logger');

class User {
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, role, created_at, updated_at FROM users'
      );
      return rows;
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error getting user by id:', error);
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;
    
    try {
      const [result] = await pool.execute(
        `INSERT INTO users (username, email, password, role)
         VALUES (?, ?, ?, ?)`,
        [username, email, password, role]
      );
      
      return result.insertId;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    const updates = [];
    const values = [];
    
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && key !== 'id') {
        updates.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });
    
    if (updates.length === 0) return false;
    
    values.push(id);
    
    try {
      const [result] = await pool.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  // Favorite/Disliked items methods
  static async getFavorites(userId, type) {
    try {
      const tableName = type === 'liquors' ? 'user_favorite_liquors' : 'user_favorite_ingredients';
      const itemType = type === 'liquors' ? 'liquors' : 'ingredients';
      
      const [rows] = await pool.execute(`
        SELECT i.* 
        FROM ${tableName} uf
        JOIN ${itemType} i ON uf.${type.slice(0, -1)}_id = i.id
        WHERE uf.user_id = ?
      `, [userId]);
      
      return rows;
    } catch (error) {
      logger.error(`Error getting user's favorite ${type}:`, error);
      throw error;
    }
  }

  static async getDislikes(userId, type) {
    try {
      const tableName = type === 'liquors' ? 'user_disliked_liquors' : 'user_disliked_ingredients';
      const itemType = type === 'liquors' ? 'liquors' : 'ingredients';
      
      const [rows] = await pool.execute(`
        SELECT i.* 
        FROM ${tableName} uf
        JOIN ${itemType} i ON uf.${type.slice(0, -1)}_id = i.id
        WHERE uf.user_id = ?
      `, [userId]);
      
      return rows;
    } catch (error) {
      logger.error(`Error getting user's disliked ${type}:`, error);
      throw error;
    }
  }

  static async addFavorite(userId, itemId, type) {
    try {
      const tableName = type === 'liquors' ? 'user_favorite_liquors' : 'user_favorite_ingredients';
      const columnName = type === 'liquors' ? 'liquor_id' : 'ingredient_id';
      
      await pool.execute(
        `INSERT INTO ${tableName} (user_id, ${columnName}) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE ${columnName} = VALUES(${columnName})`,
        [userId, itemId]
      );
      
      return true;
    } catch (error) {
      logger.error(`Error adding favorite ${type}:`, error);
      throw error;
    }
  }

  static async removeFavorite(userId, itemId, type) {
    try {
      const tableName = type === 'liquors' ? 'user_favorite_liquors' : 'user_favorite_ingredients';
      const columnName = type === 'liquors' ? 'liquor_id' : 'ingredient_id';
      
      const [result] = await pool.execute(
        `DELETE FROM ${tableName} WHERE user_id = ? AND ${columnName} = ?`,
        [userId, itemId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error removing favorite ${type}:`, error);
      throw error;
    }
  }

  static async addDislike(userId, itemId, type) {
    try {
      const tableName = type === 'liquors' ? 'user_disliked_liquors' : 'user_disliked_ingredients';
      const columnName = type === 'liquors' ? 'liquor_id' : 'ingredient_id';
      
      await pool.execute(
        `INSERT INTO ${tableName} (user_id, ${columnName}) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE ${columnName} = VALUES(${columnName})`,
        [userId, itemId]
      );
      
      return true;
    } catch (error) {
      logger.error(`Error adding disliked ${type}:`, error);
      throw error;
    }
  }

  static async removeDislike(userId, itemId, type) {
    try {
      const tableName = type === 'liquors' ? 'user_disliked_liquors' : 'user_disliked_ingredients';
      const columnName = type === 'liquors' ? 'liquor_id' : 'ingredient_id';
      
      const [result] = await pool.execute(
        `DELETE FROM ${tableName} WHERE user_id = ? AND ${columnName} = ?`,
        [userId, itemId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error removing disliked ${type}:`, error);
      throw error;
    }
  }
}

module.exports = User;