/**
 * Ingredient 모델 - MySQL 버전
 */
const { pool } = require('../../config/db');
const logger = require('../../utils/logger');

class Ingredient {
  /**
   * 모든 재료 목록을 조회합니다.
   * @param {Object} options - 조회 옵션 (정렬, 필터링, 페이징 등)
   * @returns {Promise<Array>} 재료 객체 배열
   */
  static async findAll(options = {}) {
    try {
      let query = `
        SELECT i.*, GROUP_CONCAT(ifp.flavor) AS flavor_profile
        FROM ingredients i
        LEFT JOIN ingredient_flavor_profiles ifp ON i.id = ifp.ingredient_id
      `;

      // 필터링 조건 추가
      const whereConditions = [];
      const queryParams = [];

      if (options.category) {
        whereConditions.push('i.category = ?');
        queryParams.push(options.category);
      }

      if (options.is_hub !== undefined) {
        whereConditions.push('i.is_hub = ?');
        queryParams.push(options.is_hub ? 1 : 0);
      }

      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }

      // 그룹화
      query += ' GROUP BY i.id';

      // 정렬 조건 추가
      if (options.sort) {
        const [field, direction] = options.sort.split(':');
        query += ` ORDER BY i.${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
      } else {
        query += ' ORDER BY i.name ASC';
      }

      // 페이징 처리
      if (options.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(options.limit));

        if (options.offset) {
          query += ' OFFSET ?';
          queryParams.push(parseInt(options.offset));
        }
      }

      const [rows] = await pool.query(query, queryParams);

      // flavor_profile 문자열을 배열로 변환
      return rows.map(row => ({
        ...row,
        flavor_profile: row.flavor_profile ? row.flavor_profile.split(',') : []
      }));
    } catch (error) {
      logger.error(`Error in Ingredient.findAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * ID로 재료를 조회합니다.
   * @param {number} id - 재료 ID
   * @returns {Promise<Object|null>} 재료 객체 또는 null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT i.*, GROUP_CONCAT(ifp.flavor) AS flavor_profile
        FROM ingredients i
        LEFT JOIN ingredient_flavor_profiles ifp ON i.id = ifp.ingredient_id
        WHERE i.id = ?
        GROUP BY i.id
      `;

      const [rows] = await pool.query(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        ...row,
        flavor_profile: row.flavor_profile ? row.flavor_profile.split(',') : []
      };
    } catch (error) {
      logger.error(`Error in Ingredient.findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * 외부 ID(ingredient_id)로 재료를 조회합니다.
   * @param {number} ingredientId - 외부 재료 ID
   * @returns {Promise<Object|null>} 재료 객체 또는 null
   */
  static async findByIngredientId(ingredientId) {
    try {
      const query = `
        SELECT i.*, GROUP_CONCAT(ifp.flavor) AS flavor_profile
        FROM ingredients i
        LEFT JOIN ingredient_flavor_profiles ifp ON i.id = ifp.ingredient_id
        WHERE i.ingredient_id = ?
        GROUP BY i.id
      `;

      const [rows] = await pool.query(query, [ingredientId]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        ...row,
        flavor_profile: row.flavor_profile ? row.flavor_profile.split(',') : []
      };
    } catch (error) {
      logger.error(`Error in Ingredient.findByIngredientId: ${error.message}`);
      throw error;
    }
  }

  /**
   * 새 재료를 생성합니다.
   * @param {Object} ingredientData - 재료 데이터
   * @returns {Promise<Object>} 생성된 재료 객체
   */
  static async create(ingredientData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 재료 기본 정보 삽입
      const { flavor_profile, ...ingredientBasicData } = ingredientData;
      
      const insertIngredientQuery = `
        INSERT INTO ingredients
        (ingredient_id, name, category, description, is_hub, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.query(insertIngredientQuery, [
        ingredientBasicData.ingredient_id,
        ingredientBasicData.name,
        ingredientBasicData.category || null,
        ingredientBasicData.description || null,
        ingredientBasicData.is_hub || false,
        ingredientBasicData.image_url || null
      ]);

      const ingredientId = result.insertId;

      // 2. 풍미 프로필 삽입 (배열인 경우)
      if (flavor_profile && Array.isArray(flavor_profile) && flavor_profile.length > 0) {
        const insertFlavorQuery = `
          INSERT INTO ingredient_flavor_profiles
          (ingredient_id, flavor)
          VALUES (?, ?)
        `;

        for (const flavor of flavor_profile) {
          await connection.query(insertFlavorQuery, [ingredientId, flavor]);
        }
      }

      await connection.commit();

      // 생성된 재료 조회하여 반환
      return this.findById(ingredientId);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Ingredient.create: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 재료 정보를 업데이트합니다.
   * @param {number} id - 재료 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Object|null>} 업데이트된 재료 객체 또는 null
   */
  static async update(id, updateData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 재료가 존재하는지 확인
      const [ingredientExists] = await connection.query(
        'SELECT id FROM ingredients WHERE id = ?',
        [id]
      );

      if (ingredientExists.length === 0) {
        return null;
      }

      // 2. 재료 기본 정보 업데이트
      const { flavor_profile, ...ingredientBasicData } = updateData;
      
      if (Object.keys(ingredientBasicData).length > 0) {
        const fields = Object.keys(ingredientBasicData)
          .map(key => `${key} = ?`)
          .join(', ');
        
        const values = Object.values(ingredientBasicData);
        
        const updateIngredientQuery = `
          UPDATE ingredients
          SET ${fields}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        await connection.query(updateIngredientQuery, [...values, id]);
      }

      // 3. 풍미 프로필 업데이트 (배열인 경우)
      if (flavor_profile && Array.isArray(flavor_profile)) {
        // 기존 풍미 프로필 삭제
        await connection.query(
          'DELETE FROM ingredient_flavor_profiles WHERE ingredient_id = ?',
          [id]
        );

        // 새 풍미 프로필 추가
        if (flavor_profile.length > 0) {
          const insertFlavorQuery = `
            INSERT INTO ingredient_flavor_profiles
            (ingredient_id, flavor)
            VALUES (?, ?)
          `;

          for (const flavor of flavor_profile) {
            await connection.query(insertFlavorQuery, [id, flavor]);
          }
        }
      }

      await connection.commit();

      // 업데이트된 재료 조회하여 반환
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Ingredient.update: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 재료를 삭제합니다.
   * @param {number} id - 재료 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 재료가 존재하는지 확인
      const [ingredientExists] = await connection.query(
        'SELECT id FROM ingredients WHERE id = ?',
        [id]
      );

      if (ingredientExists.length === 0) {
        return false;
      }

      // 2. 관련 풍미 프로필 삭제 (외래 키 제약조건으로 자동 삭제될 수 있음)
      await connection.query(
        'DELETE FROM ingredient_flavor_profiles WHERE ingredient_id = ?',
        [id]
      );

      // 3. 재료 삭제
      await connection.query(
        'DELETE FROM ingredients WHERE id = ?',
        [id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Ingredient.delete: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 카테고리별 재료를 조회합니다.
   * @param {string} category - 재료 카테고리
   * @returns {Promise<Array>} 재료 객체 배열
   */
  static async findByCategory(category) {
    try {
      const query = `
        SELECT i.*, GROUP_CONCAT(ifp.flavor) AS flavor_profile
        FROM ingredients i
        LEFT JOIN ingredient_flavor_profiles ifp ON i.id = ifp.ingredient_id
        WHERE i.category = ?
        GROUP BY i.id
        ORDER BY i.name ASC
      `;

      const [rows] = await pool.query(query, [category]);

      return rows.map(row => ({
        ...row,
        flavor_profile: row.flavor_profile ? row.flavor_profile.split(',') : []
      }));
    } catch (error) {
      logger.error(`Error in Ingredient.findByCategory: ${error.message}`);
      throw error;
    }
  }

  /**
   * 모든 카테고리를 조회합니다.
   * @returns {Promise<Array>} 카테고리 목록
   */
  static async getAllCategories() {
    try {
      const query = `
        SELECT DISTINCT category
        FROM ingredients
        WHERE category IS NOT NULL
        ORDER BY category ASC
      `;

      const [rows] = await pool.query(query);
      return rows.map(row => row.category);
    } catch (error) {
      logger.error(`Error in Ingredient.getAllCategories: ${error.message}`);
      throw error;
    }
  }

  /**
   * 재료를 검색합니다.
   * @param {string} query - 검색어
   * @returns {Promise<Array>} 검색 결과 배열
   */
  static async search(query) {
    try {
      const searchQuery = `
        SELECT i.*, GROUP_CONCAT(ifp.flavor) AS flavor_profile
        FROM ingredients i
        LEFT JOIN ingredient_flavor_profiles ifp ON i.id = ifp.ingredient_id
        WHERE 
          i.name LIKE ? OR 
          i.category LIKE ? OR 
          i.description LIKE ?
        GROUP BY i.id
        ORDER BY i.name ASC
      `;

      const searchParam = `%${query}%`;
      const [rows] = await pool.query(searchQuery, [
        searchParam, searchParam, searchParam
      ]);

      return rows.map(row => ({
        ...row,
        flavor_profile: row.flavor_profile ? row.flavor_profile.split(',') : []
      }));
    } catch (error) {
      logger.error(`Error in Ingredient.search: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Ingredient;