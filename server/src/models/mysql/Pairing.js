/**
 * Pairing 모델 - MySQL 버전
 */
const { pool } = require('../../config/db');
const logger = require('../../utils/logger');

class Pairing {
  /**
   * 특정 주류와 재료의 페어링을 찾거나 생성합니다.
   * @param {number} liquorId - 주류 ID
   * @param {number} ingredientId - 재료 ID
   * @param {Object} pairingData - 페어링 데이터
   * @returns {Promise<Object>} 페어링 객체
   */
  static async findOrCreate(liquorId, ingredientId, pairingData = {}) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 이미 존재하는 페어링 확인
      const [existingPairings] = await connection.query(
        'SELECT id FROM pairings WHERE liquor_id = ? AND ingredient_id = ?',
        [liquorId, ingredientId]
      );

      let pairingId;

      // 2. 페어링이 없는 경우 생성
      if (existingPairings.length === 0) {
        const { score, reason, user_rating } = pairingData;
        
        const insertPairingQuery = `
          INSERT INTO pairings
          (liquor_id, ingredient_id, score, reason, user_rating)
          VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await connection.query(insertPairingQuery, [
          liquorId,
          ingredientId,
          score || 0,
          reason || null,
          user_rating || null
        ]);

        pairingId = result.insertId;

        // 3. 공유 화합물 추가 (있는 경우)
        if (pairingData.shared_compounds && Array.isArray(pairingData.shared_compounds) && pairingData.shared_compounds.length > 0) {
          const insertCompoundQuery = `
            INSERT INTO pairing_shared_compounds
            (pairing_id, compound_name)
            VALUES (?, ?)
          `;

          for (const compound of pairingData.shared_compounds) {
            await connection.query(insertCompoundQuery, [pairingId, compound]);
          }
        }
      } else {
        pairingId = existingPairings[0].id;
        
        // 기존 페어링 업데이트 (새로운 데이터가 있는 경우)
        if (Object.keys(pairingData).length > 0) {
          await this.update(pairingId, pairingData);
        }
      }

      await connection.commit();

      // 생성 또는 찾은 페어링 조회하여 반환
      return this.findById(pairingId);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Pairing.findOrCreate: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * ID로 페어링을 조회합니다.
   * @param {number} id - 페어링 ID
   * @returns {Promise<Object|null>} 페어링 객체 또는 null
   */
  static async findById(id) {
    try {
      // 기본 페어링 정보 조회
      const pairingQuery = `
        SELECT p.*,
          l.name as liquor_name, l.type as liquor_type, l.image_url as liquor_image,
          i.name as ingredient_name, i.category as ingredient_category, i.image_url as ingredient_image
        FROM pairings p
        JOIN liquors l ON p.liquor_id = l.id
        JOIN ingredients i ON p.ingredient_id = i.id
        WHERE p.id = ?
      `;

      const [pairings] = await pool.query(pairingQuery, [id]);

      if (pairings.length === 0) {
        return null;
      }

      const pairing = pairings[0];

      // 공유 화합물 정보 조회
      const compoundsQuery = `
        SELECT compound_name
        FROM pairing_shared_compounds
        WHERE pairing_id = ?
      `;

      const [compounds] = await pool.query(compoundsQuery, [id]);
      const shared_compounds = compounds.map(c => c.compound_name);

      return {
        ...pairing,
        shared_compounds
      };
    } catch (error) {
      logger.error(`Error in Pairing.findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * 주류와 재료 ID로 페어링을 조회합니다.
   * @param {number} liquorId - 주류 ID
   * @param {number} ingredientId - 재료 ID
   * @returns {Promise<Object|null>} 페어링 객체 또는 null
   */
  static async findByLiquorAndIngredient(liquorId, ingredientId) {
    try {
      const query = `
        SELECT p.id
        FROM pairings p
        WHERE p.liquor_id = ? AND p.ingredient_id = ?
      `;

      const [pairings] = await pool.query(query, [liquorId, ingredientId]);

      if (pairings.length === 0) {
        return null;
      }

      return this.findById(pairings[0].id);
    } catch (error) {
      logger.error(`Error in Pairing.findByLiquorAndIngredient: ${error.message}`);
      throw error;
    }
  }

  /**
   * 특정 주류에 대한 추천 재료 페어링을 조회합니다.
   * @param {number} liquorId - 주류 ID
   * @param {Object} options - 옵션(limit, minScore 등)
   * @returns {Promise<Array>} 페어링 객체 배열
   */
  static async findRecommendationsForLiquor(liquorId, options = {}) {
    try {
      let query = `
        SELECT p.id
        FROM pairings p
        WHERE p.liquor_id = ?
      `;

      const queryParams = [liquorId];

      // 최소 점수 필터
      if (options.minScore) {
        query += ' AND p.score >= ?';
        queryParams.push(options.minScore);
      }

      // 정렬 - 기본적으로 점수 높은 순
      query += ' ORDER BY p.score DESC';

      // 결과 수 제한
      if (options.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(options.limit));
      }

      const [pairingIds] = await pool.query(query, queryParams);

      // 개별 페어링 조회 및 결과 모음
      const recommendations = [];
      for (const pair of pairingIds) {
        const pairing = await this.findById(pair.id);
        if (pairing) {
          recommendations.push(pairing);
        }
      }

      return recommendations;
    } catch (error) {
      logger.error(`Error in Pairing.findRecommendationsForLiquor: ${error.message}`);
      throw error;
    }
  }

  /**
   * 특정 재료에 대한 추천 주류 페어링을 조회합니다.
   * @param {number} ingredientId - 재료 ID
   * @param {Object} options - 옵션(limit, minScore 등)
   * @returns {Promise<Array>} 페어링 객체 배열
   */
  static async findRecommendationsForIngredient(ingredientId, options = {}) {
    try {
      let query = `
        SELECT p.id
        FROM pairings p
        WHERE p.ingredient_id = ?
      `;

      const queryParams = [ingredientId];

      // 최소 점수 필터
      if (options.minScore) {
        query += ' AND p.score >= ?';
        queryParams.push(options.minScore);
      }

      // 정렬 - 기본적으로 점수 높은 순
      query += ' ORDER BY p.score DESC';

      // 결과 수 제한
      if (options.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(options.limit));
      }

      const [pairingIds] = await pool.query(query, queryParams);

      // 개별 페어링 조회 및 결과 모음
      const recommendations = [];
      for (const pair of pairingIds) {
        const pairing = await this.findById(pair.id);
        if (pairing) {
          recommendations.push(pairing);
        }
      }

      return recommendations;
    } catch (error) {
      logger.error(`Error in Pairing.findRecommendationsForIngredient: ${error.message}`);
      throw error;
    }
  }

  /**
   * 페어링을 업데이트합니다.
   * @param {number} id - 페어링 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Object|null>} 업데이트된 페어링 객체 또는 null
   */
  static async update(id, updateData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 페어링이 존재하는지 확인
      const [pairingExists] = await connection.query(
        'SELECT id FROM pairings WHERE id = ?',
        [id]
      );

      if (pairingExists.length === 0) {
        return null;
      }

      // 2. 페어링 기본 정보 업데이트
      const { shared_compounds, ...pairingBasicData } = updateData;
      
      if (Object.keys(pairingBasicData).length > 0) {
        const fields = Object.keys(pairingBasicData)
          .map(key => `${key} = ?`)
          .join(', ');
        
        const values = Object.values(pairingBasicData);
        
        const updatePairingQuery = `
          UPDATE pairings
          SET ${fields}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        await connection.query(updatePairingQuery, [...values, id]);
      }

      // 3. 공유 화합물 업데이트 (배열인 경우)
      if (shared_compounds && Array.isArray(shared_compounds)) {
        // 기존 공유 화합물 삭제
        await connection.query(
          'DELETE FROM pairing_shared_compounds WHERE pairing_id = ?',
          [id]
        );

        // 새 공유 화합물 추가
        if (shared_compounds.length > 0) {
          const insertCompoundQuery = `
            INSERT INTO pairing_shared_compounds
            (pairing_id, compound_name)
            VALUES (?, ?)
          `;

          for (const compound of shared_compounds) {
            await connection.query(insertCompoundQuery, [id, compound]);
          }
        }
      }

      await connection.commit();

      // 업데이트된 페어링 조회하여 반환
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Pairing.update: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 페어링을 삭제합니다.
   * @param {number} id - 페어링 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 페어링이 존재하는지 확인
      const [pairingExists] = await connection.query(
        'SELECT id FROM pairings WHERE id = ?',
        [id]
      );

      if (pairingExists.length === 0) {
        return false;
      }

      // 2. 관련 공유 화합물 삭제 (외래 키 제약조건으로 자동 삭제될 수 있음)
      await connection.query(
        'DELETE FROM pairing_shared_compounds WHERE pairing_id = ?',
        [id]
      );

      // 3. 페어링 삭제
      await connection.query(
        'DELETE FROM pairings WHERE id = ?',
        [id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in Pairing.delete: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 상위 페어링을 조회합니다.
   * @param {Object} options - 옵션 (limit 등)
   * @returns {Promise<Array>} 페어링 객체 배열
   */
  static async findTopPairings(options = {}) {
    try {
      let query = `
        SELECT p.id
        FROM pairings p
        ORDER BY p.score DESC
      `;

      // 결과 수 제한
      const queryParams = [];
      if (options.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(options.limit));
      } else {
        query += ' LIMIT 10'; // 기본 10개
      }

      const [pairingIds] = await pool.query(query, queryParams);

      // 개별 페어링 조회 및 결과 모음
      const topPairings = [];
      for (const pair of pairingIds) {
        const pairing = await this.findById(pair.id);
        if (pairing) {
          topPairings.push(pairing);
        }
      }

      return topPairings;
    } catch (error) {
      logger.error(`Error in Pairing.findTopPairings: ${error.message}`);
      throw error;
    }
  }

  /**
   * 사용자 평가를 기록합니다.
   * @param {number} id - 페어링 ID
   * @param {number} rating - 평가 점수 (1-5)
   * @returns {Promise<Object|null>} 업데이트된 페어링 객체 또는 null
   */
  static async rateByUser(id, rating) {
    try {
      // 유효한 평가 점수 확인
      const validRating = Math.min(Math.max(parseFloat(rating), 1), 5);
      
      // 평가 업데이트
      return this.update(id, { user_rating: validRating });
    } catch (error) {
      logger.error(`Error in Pairing.rateByUser: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Pairing;