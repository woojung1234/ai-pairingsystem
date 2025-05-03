/**
 * User 모델 - MySQL 버전
 */
const { pool } = require('../../config/db');
const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');

class User {
  /**
   * 모든 사용자 목록을 조회합니다.
   * @param {Object} options - 조회 옵션 (정렬, 필터링, 페이징 등)
   * @returns {Promise<Array>} 사용자 객체 배열
   */
  static async findAll(options = {}) {
    try {
      let query = `
        SELECT id, username, email, role, created_at, updated_at
        FROM users
      `;

      // 필터링 조건 추가
      const whereConditions = [];
      const queryParams = [];

      if (options.role) {
        whereConditions.push('role = ?');
        queryParams.push(options.role);
      }

      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }

      // 정렬 조건 추가
      if (options.sort) {
        const [field, direction] = options.sort.split(':');
        query += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
      } else {
        query += ' ORDER BY username ASC';
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
      return rows;
    } catch (error) {
      logger.error(`Error in User.findAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * ID로 사용자를 조회합니다.
   * @param {number} id - 사용자 ID
   * @param {boolean} includePassword - 비밀번호 포함 여부
   * @returns {Promise<Object|null>} 사용자 객체 또는 null
   */
  static async findById(id, includePassword = false) {
    try {
      // 1. 기본 사용자 정보 조회
      let userQuery = `
        SELECT ${includePassword ? '*' : 'id, username, email, role, created_at, updated_at'}
        FROM users
        WHERE id = ?
      `;

      const [users] = await pool.query(userQuery, [id]);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      // 2. 사용자 선호 정보 조회
      await this.loadUserPreferences(user);

      return user;
    } catch (error) {
      logger.error(`Error in User.findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * 이메일로 사용자를 조회합니다.
   * @param {string} email - 사용자 이메일
   * @param {boolean} includePassword - 비밀번호 포함 여부
   * @returns {Promise<Object|null>} 사용자 객체 또는 null
   */
  static async findByEmail(email, includePassword = false) {
    try {
      // 1. 기본 사용자 정보 조회
      let userQuery = `
        SELECT ${includePassword ? '*' : 'id, username, email, role, created_at, updated_at'}
        FROM users
        WHERE email = ?
      `;

      const [users] = await pool.query(userQuery, [email]);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      // 2. 사용자 선호 정보 조회
      await this.loadUserPreferences(user);

      return user;
    } catch (error) {
      logger.error(`Error in User.findByEmail: ${error.message}`);
      throw error;
    }
  }

  /**
   * 사용자 이름으로 사용자를 조회합니다.
   * @param {string} username - 사용자 이름
   * @param {boolean} includePassword - 비밀번호 포함 여부
   * @returns {Promise<Object|null>} 사용자 객체 또는 null
   */
  static async findByUsername(username, includePassword = false) {
    try {
      // 1. 기본 사용자 정보 조회
      let userQuery = `
        SELECT ${includePassword ? '*' : 'id, username, email, role, created_at, updated_at'}
        FROM users
        WHERE username = ?
      `;

      const [users] = await pool.query(userQuery, [username]);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      // 2. 사용자 선호 정보 조회
      await this.loadUserPreferences(user);

      return user;
    } catch (error) {
      logger.error(`Error in User.findByUsername: ${error.message}`);
      throw error;
    }
  }

  /**
   * 사용자 선호도 정보를 로드하는 헬퍼 메소드
   * @param {Object} user - 사용자 객체
   * @returns {Promise<void>}
   */
  static async loadUserPreferences(user) {
    try {
      // 초기화
      user.preferences = {
        favorite_liquors: [],
        favorite_ingredients: [],
        disliked_liquors: [],
        disliked_ingredients: []
      };

      // 선호 주류 조회
      const favLiquorsQuery = `
        SELECT l.id, l.liquor_id, l.name, l.type
        FROM user_favorite_liquors ufl
        JOIN liquors l ON ufl.liquor_id = l.id
        WHERE ufl.user_id = ?
      `;
      const [favLiquors] = await pool.query(favLiquorsQuery, [user.id]);
      user.preferences.favorite_liquors = favLiquors;

      // 선호 재료 조회
      const favIngredientsQuery = `
        SELECT i.id, i.ingredient_id, i.name, i.category
        FROM user_favorite_ingredients ufi
        JOIN ingredients i ON ufi.ingredient_id = i.id
        WHERE ufi.user_id = ?
      `;
      const [favIngredients] = await pool.query(favIngredientsQuery, [user.id]);
      user.preferences.favorite_ingredients = favIngredients;

      // 비선호 주류 조회
      const disLiquorsQuery = `
        SELECT l.id, l.liquor_id, l.name, l.type
        FROM user_disliked_liquors udl
        JOIN liquors l ON udl.liquor_id = l.id
        WHERE udl.user_id = ?
      `;
      const [disLiquors] = await pool.query(disLiquorsQuery, [user.id]);
      user.preferences.disliked_liquors = disLiquors;

      // 비선호 재료 조회
      const disIngredientsQuery = `
        SELECT i.id, i.ingredient_id, i.name, i.category
        FROM user_disliked_ingredients udi
        JOIN ingredients i ON udi.ingredient_id = i.id
        WHERE udi.user_id = ?
      `;
      const [disIngredients] = await pool.query(disIngredientsQuery, [user.id]);
      user.preferences.disliked_ingredients = disIngredients;
    } catch (error) {
      logger.error(`Error in User.loadUserPreferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * 새 사용자를 생성합니다.
   * @param {Object} userData - 사용자 데이터
   * @returns {Promise<Object>} 생성된 사용자 객체
   */
  static async create(userData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 비밀번호 해싱
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // 2. 사용자 기본 정보 삽입
      const insertUserQuery = `
        INSERT INTO users
        (username, email, password, role)
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await connection.query(insertUserQuery, [
        userData.username,
        userData.email,
        hashedPassword,
        userData.role || 'user'
      ]);

      const userId = result.insertId;

      await connection.commit();

      // 생성된 사용자 조회하여 반환 (비밀번호 제외)
      return this.findById(userId);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in User.create: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 사용자 정보를 업데이트합니다.
   * @param {number} id - 사용자 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Object|null>} 업데이트된 사용자 객체 또는 null
   */
  static async update(id, updateData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 사용자가 존재하는지 확인
      const [userExists] = await connection.query(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (userExists.length === 0) {
        return null;
      }

      // 2. 비밀번호 해싱 (비밀번호가 있는 경우)
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      // 3. 사용자 기본 정보 업데이트
      const fields = Object.keys(updateData)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.values(updateData);
      
      const updateUserQuery = `
        UPDATE users
        SET ${fields}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await connection.query(updateUserQuery, [...values, id]);

      await connection.commit();

      // 업데이트된 사용자 조회하여 반환
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in User.update: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 사용자를 삭제합니다.
   * @param {number} id - 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 사용자가 존재하는지 확인
      const [userExists] = await connection.query(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (userExists.length === 0) {
        return false;
      }

      // 2. 사용자 선호도 정보 삭제 (외래 키 제약조건으로 자동 삭제될 수 있음)
      await connection.query('DELETE FROM user_favorite_liquors WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM user_favorite_ingredients WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM user_disliked_liquors WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM user_disliked_ingredients WHERE user_id = ?', [id]);

      // 3. 사용자 삭제
      await connection.query('DELETE FROM users WHERE id = ?', [id]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in User.delete: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 사용자 자격 증명을 확인합니다.
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<Object|null>} 사용자 객체 또는 null
   */
  static async authenticate(email, password) {
    try {
      // 1. 이메일로 사용자 조회 (비밀번호 포함)
      const user = await this.findByEmail(email, true);

      if (!user) {
        return null;
      }

      // 2. 비밀번호 검증
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return null;
      }

      // 비밀번호 필드 제거 후 반환
      delete user.password;
      return user;
    } catch (error) {
      logger.error(`Error in User.authenticate: ${error.message}`);
      throw error;
    }
  }

  /**
   * 선호 주류를 추가합니다.
   * @param {number} userId - 사용자 ID
   * @param {number} liquorId - 주류 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async addFavoriteLiquor(userId, liquorId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 이미 존재하는지 확인
      const [existing] = await connection.query(
        'SELECT id FROM user_favorite_liquors WHERE user_id = ? AND liquor_id = ?',
        [userId, liquorId]
      );

      if (existing.length === 0) {
        // 2. 비선호 목록에서 제거 (있는 경우)
        await connection.query(
          'DELETE FROM user_disliked_liquors WHERE user_id = ? AND liquor_id = ?',
          [userId, liquorId]
        );

        // 3. 선호 목록에 추가
        await connection.query(
          'INSERT INTO user_favorite_liquors (user_id, liquor_id) VALUES (?, ?)',
          [userId, liquorId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in User.addFavoriteLiquor: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 선호 재료를 추가합니다.
   * @param {number} userId - 사용자 ID
   * @param {number} ingredientId - 재료 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async addFavoriteIngredient(userId, ingredientId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 이미 존재하는지 확인
      const [existing] = await connection.query(
        'SELECT id FROM user_favorite_ingredients WHERE user_id = ? AND ingredient_id = ?',
        [userId, ingredientId]
      );

      if (existing.length === 0) {
        // 2. 비선호 목록에서 제거 (있는 경우)
        await connection.query(
          'DELETE FROM user_disliked_ingredients WHERE user_id = ? AND ingredient_id = ?',
          [userId, ingredientId]
        );

        // 3. 선호 목록에 추가
        await connection.query(
          'INSERT INTO user_favorite_ingredients (user_id, ingredient_id) VALUES (?, ?)',
          [userId, ingredientId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in User.addFavoriteIngredient: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 비선호 주류를 추가합니다.
   * @param {number} userId - 사용자 ID
   * @param {number} liquorId - 주류 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async addDislikedLiquor(userId, liquorId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 이미 존재하는지 확인
      const [existing] = await connection.query(
        'SELECT id FROM user_disliked_liquors WHERE user_id = ? AND liquor_id = ?',
        [userId, liquorId]
      );

      if (existing.length === 0) {
        // 2. 선호 목록에서 제거 (있는 경우)
        await connection.query(
          'DELETE FROM user_favorite_liquors WHERE user_id = ? AND liquor_id = ?',
          [userId, liquorId]
        );

        // 3. 비선호 목록에 추가
        await connection.query(
          'INSERT INTO user_disliked_liquors (user_id, liquor_id) VALUES (?, ?)',
          [userId, liquorId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in User.addDislikedLiquor: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 비선호 재료를 추가합니다.
   * @param {number} userId - 사용자 ID
   * @param {number} ingredientId - 재료 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async addDislikedIngredient(userId, ingredientId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. 이미 존재하는지 확인
      const [existing] = await connection.query(
        'SELECT id FROM user_disliked_ingredients WHERE user_id = ? AND ingredient_id = ?',
        [userId, ingredientId]
      );

      if (existing.length === 0) {
        // 2. 선호 목록에서 제거 (있는 경우)
        await connection.query(
          'DELETE FROM user_favorite_ingredients WHERE user_id = ? AND ingredient_id = ?',
          [userId, ingredientId]
        );

        // 3. 비선호 목록에 추가
        await connection.query(
          'INSERT INTO user_disliked_ingredients (user_id, ingredient_id) VALUES (?, ?)',
          [userId, ingredientId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error in User.addDislikedIngredient: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 선호 주류를 제거합니다.
   * @param {number} userId - 사용자 ID
   * @param {number} liquorId - 주류 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async removeFavoriteLiquor(userId, liquorId) {
    try {
      await pool.query(
        'DELETE FROM user_favorite_liquors WHERE user_id = ? AND liquor_id = ?',
        [userId, liquorId]
      );
      return true;
    } catch (error) {
      logger.error(`Error in User.removeFavoriteLiquor: ${error.message}`);
      throw error;
    }
  }

  /**
   * 선호 재료를 제거합니다.
   * @param {number} userId - 사용자 ID
   * @param {number} ingredientId - 재료 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async removeFavoriteIngredient(userId, ingredientId) {
    try {
      await pool.query(
        'DELETE FROM user_favorite_ingredients WHERE user_id = ? AND ingredient_id = ?',
        [userId, ingredientId]
      );
      return true;
    } catch (error) {
      logger.error(`Error in User.removeFavoriteIngredient: ${error.message}`);
      throw error;
    }
  }

  /**
   * 비선호 주류를 제거합니다.
   * @param {number} userId - 사용자 ID
   * @param {number} liquorId - 주류 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async removeDislikedLiquor(userId, liquorId) {
    try {
      await pool.query(
        'DELETE FROM user_disliked_liquors WHERE user_id = ? AND liquor_id = ?',
        [userId, liquorId]
      );
      return true;
    } catch (error) {
      logger.error(`Error in User.removeDislikedLiquor: ${error.message}`);
      throw error;
    }
  }

  /**
   * 비선호 재료를 제거합니다.
   * @param {number} userId - 사용자 ID
   * @param {number} ingredientId - 재료 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  static async removeDislikedIngredient(userId, ingredientId) {
    try {
      await pool.query(
        'DELETE FROM user_disliked_ingredients WHERE user_id = ? AND ingredient_id = ?',
        [userId, ingredientId]
      );
      return true;
    } catch (error) {
      logger.error(`Error in User.removeDislikedIngredient: ${error.message}`);
      throw error;
    }
  }
}

module.exports = User;