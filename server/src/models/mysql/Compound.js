/**
 * MySQL Compound Model
 * 
 * 화합물 데이터 모델
 */
const db = require('../../config/db');
const pool = db.pool;
const logger = require('../../utils/logger');

class Compound {
  /**
   * 모든 화합물 조회
   */
  static async findAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, n.name as node_name, n.external_id as node_external_id, n.is_hub
        FROM compounds c
        JOIN nodes n ON c.node_id = n.id
        ORDER BY c.name ASC
      `);
      return rows;
    } catch (error) {
      logger.error(`Error in Compound.findAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * ID로 화합물 조회
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, n.name as node_name, n.external_id as node_external_id, n.is_hub
        FROM compounds c
        JOIN nodes n ON c.node_id = n.id
        WHERE c.id = ?
      `, [id]);
      
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error in Compound.findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * 키워드로 화합물 검색
   */
  static async search(keyword) {
    try {
      const searchTerm = `%${keyword}%`;
      const [rows] = await pool.execute(`
        SELECT c.*, n.name as node_name, n.external_id as node_external_id, n.is_hub
        FROM compounds c
        JOIN nodes n ON c.node_id = n.id
        WHERE c.name LIKE ? OR c.chemical_formula LIKE ? OR c.description LIKE ?
        ORDER BY 
          CASE 
            WHEN c.name = ? THEN 1
            WHEN c.name LIKE ? THEN 2
            ELSE 3
          END,
          c.name ASC
        LIMIT 30
      `, [searchTerm, searchTerm, searchTerm, keyword, `${keyword}%`]);
      
      return rows;
    } catch (error) {
      logger.error(`Error in Compound.search: ${error.message}`);
      throw error;
    }
  }

  /**
   * 새로운 화합물 생성
   */
  static async create(compoundData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 화합물 생성
      const [result] = await connection.execute(
        `INSERT INTO compounds (node_id, name, external_id, chemical_formula, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          compoundData.node_id,
          compoundData.name,
          compoundData.external_id,
          compoundData.chemical_formula,
          compoundData.description
        ]
      );
      
      await connection.commit();
      
      // 생성된 화합물 반환
      const id = result.insertId;
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Compound.create: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 화합물 정보 수정
   */
  static async update(id, updateData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const updates = [];
      const values = [];
      
      // 업데이트할 필드 추가
      if (updateData.name) {
        updates.push('name = ?');
        values.push(updateData.name);
      }
      
      if (updateData.external_id) {
        updates.push('external_id = ?');
        values.push(updateData.external_id);
      }
      
      if (updateData.chemical_formula) {
        updates.push('chemical_formula = ?');
        values.push(updateData.chemical_formula);
      }
      
      if (updateData.description) {
        updates.push('description = ?');
        values.push(updateData.description);
      }
      
      if (updates.length === 0) {
        await connection.commit();
        return true;
      }
      
      // ID 추가
      values.push(id);
      
      // 업데이트 쿼리 실행
      await connection.execute(
        `UPDATE compounds SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Compound.update: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 화합물 삭제
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM compounds WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error in Compound.delete: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Compound;
