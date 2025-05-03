/**
 * Liquor 모델 - MySQL 버전
 */
const { pool } = require('../../config/db');
const logger = require('../../utils/logger');

class Liquor {
  /**
   * 모든 주류 목록을 조회합니다.
   * @param {Object} options - 조회 옵션 (정렬, 필터링, 페이징 등)
   * @returns {Promise<Array>} 주류 객체 배열
   */
  static async findAll(options = {}) {
    try {
      let query = `
        SELECT l.*, GROUP_CONCAT(lfp.flavor) AS flavor_profile
        FROM liquors l
        LEFT JOIN liquor_flavor_profiles lfp ON l.id = lfp.liquor_id
      `;

      // 필터링 조건 추가
      const whereConditions = [];
      const queryParams = [];

      if (options.type) {
        whereConditions.push('l.type = ?');
        queryParams.push(options.type);
      }

      if (options.origin) {
        whereConditions.push('l.origin = ?');
        queryParams.push(options.origin);
      }

      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }

      // 그룹화
      query += ' GROUP BY l.id';

      // 정렬 조건 추가
      if (options.sort) {
        const [field, direction] = options.sort.split(':');
        query += ` ORDER BY l.${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
      } else {
        query += ' ORDER BY l.name ASC';
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
      logger.error(`Error in Liquor.findAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * ID로 주류를 조회합니다.
   * @param {number} id - 주류 ID
   * @returns {Promise<Object|null>} 주류 객체 또는 null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT l.*, GROUP_CONCAT(lfp.flavor) AS flavor_profile
        FROM liquors l
        LEFT JOIN liquor_flavor_profiles lfp ON l.id = lfp.liquor_id
        WHERE l.id = ?
        GROUP BY l.id
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
      logger.error(`Error in Liquor.findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * 외부 ID(liquor_id)로 주류를 조회합니다.
   * @param {number} liquorId - 외부 주류 ID
   * @returns {Promise<Object|null>} 주류 객체 또는 null
   */
  static async findByLiquorId(liquorId) {
    try {
      const query = `
        SELECT l.*, GROUP_CONCAT(lfp.flavor) AS flavor_profile
        FROM liquors l
        LEFT JOIN liquor_flavor_profiles lfp ON l.id = lfp.liquor_id
        WHERE l.liquor_id = ?
        GROUP BY l.id
      `;

      const [rows] = await pool.query(query, [liquorId]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        ...row,
        flavor_profile: row.flavor_profile ? row.flavor_profile.split(',') : []
      };
    } catch (error) {
      logger.error(`Error in Liquor.findByLiquorId: ${error.message}`);
      throw error;
    }
  }

  /**
   * 새 주류를 생성합니다.
   * @param {Object} liquorData - 주류 데이터
   * @returns {Promise<Object>} 생성된 주류 객체
   */
  static async create(liquorData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 주류 기본 정보 삽입
      const { flavor_profile, ...liquorBasicData } = liquorData;
      
      const insertLiquorQuery = `
        INSERT INTO liquors
        (liquor_id, name, type, description, origin, alcohol_content, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.query(insertLiquorQuery, [
        liquorBasicData.liquor_id,
        liquorBasicData.name,
        liquorBasicData.type || null,
        liquorBasicData.description || null,
        liquorBasicData.origin || null,
        liquorBasicData.alcohol_content || null,
        liquorBasicData.image_url || null
      ]);

      const liquorId = result.insertId;

      // 2. 풍미 프로필 삽입 (배열인 경우)
      if (flavor_profile && Array.isArray(flavor_profile) && flavor_profile.length > 0) {
        const insertFlavorQuery = `
          INSERT INTO liquor_flavor_profiles
          (liquor_id, flavor)
          VALUES (?, ?)
        `;

        for (const flavor of flavor_profile) {
          await connection.query(insertFlavorQuery, [liquorId, flavor]);
        }
      }

      await connection.commit();

      // 생성된 주류 조회하여 반환
      return this.findById(liquorId);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Liquor.create: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 주류 정보를 업데이트합니다.
   * @param {number} id - 주류 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Object|null>} 업데이트된 주류 객체 또는 null
   */
  static async update(id, updateData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 주류가 존재하는지 확인
      const [liquorExists] = await connection.query(
        'SELECT id FROM liquors WHERE id = ?',
        [id]
      );

      if (liquorExists.length === 0) {
        return null;
      }

      // 2. 주류 기본 정보 업데이트
      const { flavor_profile, ...liquorBasicData } = updateData;
      
      if (Object.keys(liquorBasicData).length > 0) {
        const fields = Object.keys(liquorBasicData)
          .map(key => `${key} = ?`)
          .join(', ');
        
        const values = Object.values(liquorBasicData);
        
        const updateLiquorQuery = `
          UPDATE liquors
          SET ${fields}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        await connection.query(updateLiquorQuery, [...values, id]);
      }

      // 3. 풍미 프로필 업데이트 (배열인 경우)
      if (flavor_profile && Array.isArray(flavor_profile)) {
        // 기존 풍미 프로필 삭제
        await connection.query(
          'DELETE FROM liquor_flavor_profiles WHERE liquor_id = ?',
          [id]
        );

        // 새 풍미 프로필 추가
        if (flavor_profile.length > 0) {
          const insertFlavorQuery = `
            INSERT INTO liquor_flavor_profiles
            (liquor_id, flavor)
            VALUES (?, ?)
          `;

          for (const flavor of flavor_profile) {
            await connection.query(insertFlavorQuery, [id, flavor]);
          }
        }
      }

      await connection.commit();

      // 업데이트된 주류 조회하여 반환
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Liquor.update: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 주류를 삭제합니다.
   * @param {number} id - 주류 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 주류가 존재하는지 확인
      const [liquorExists] = await connection.query(
        'SELECT id FROM liquors WHERE id = ?',
        [id]
      );

      if (liquorExists.length === 0) {
        return false;
      }

      // 2. 관련 풍미 프로필 삭제 (외래 키 제약조건으로 자동 삭제될 수 있음)
      await connection.query(
        'DELETE FROM liquor_flavor_profiles WHERE liquor_id = ?',
        [id]
      );

      // 3. 주류 삭제
      await connection.query(
        'DELETE FROM liquors WHERE id = ?',
        [id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Liquor.delete: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 주류를 검색합니다.
   * @param {string} query - 검색어
   * @returns {Promise<Array>} 검색 결과 배열
   */
  static async search(query) {
    try {
      const searchQuery = `
        SELECT l.*, GROUP_CONCAT(lfp.flavor) AS flavor_profile
        FROM liquors l
        LEFT JOIN liquor_flavor_profiles lfp ON l.id = lfp.liquor_id
        WHERE 
          l.name LIKE ? OR 
          l.type LIKE ? OR 
          l.origin LIKE ? OR
          l.description LIKE ?
        GROUP BY l.id
        ORDER BY l.name ASC
      `;

      const searchParam = `%${query}%`;
      const [rows] = await pool.query(searchQuery, [
        searchParam, searchParam, searchParam, searchParam
      ]);

      return rows.map(row => ({
        ...row,
        flavor_profile: row.flavor_profile ? row.flavor_profile.split(',') : []
      }));
    } catch (error) {
      logger.error(`Error in Liquor.search: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Liquor;