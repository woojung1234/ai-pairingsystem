-- AI 페어링 시스템 초기화 SQL 스크립트

-- 데이터베이스 사용
USE ai_pairing_db;

-- Liquors 테이블
CREATE TABLE IF NOT EXISTS liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  liquor_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  description TEXT,
  origin VARCHAR(100),
  alcohol_content DECIMAL(5,2),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_liquor_id (liquor_id),
  INDEX idx_name (name)
);

-- Liquor_Flavor_Profiles 테이블
CREATE TABLE IF NOT EXISTS liquor_flavor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  liquor_id INT NOT NULL,
  flavor VARCHAR(50) NOT NULL,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_liquor_flavor (liquor_id, flavor)
);

-- Ingredients 테이블
CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingredient_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  is_hub BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ingredient_id (ingredient_id),
  INDEX idx_name (name),
  INDEX idx_category (category)
);

-- Ingredient_Flavor_Profiles 테이블
CREATE TABLE IF NOT EXISTS ingredient_flavor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingredient_id INT NOT NULL,
  flavor VARCHAR(50) NOT NULL,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_ingredient_flavor (ingredient_id, flavor)
);

-- Pairings 테이블
CREATE TABLE IF NOT EXISTS pairings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  liquor_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  score DECIMAL(3,2) NOT NULL,
  reason TEXT,
  user_rating DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_pairing (liquor_id, ingredient_id)
);

-- Pairing_Shared_Compounds 테이블
CREATE TABLE IF NOT EXISTS pairing_shared_compounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pairing_id INT NOT NULL,
  compound_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (pairing_id) REFERENCES pairings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_pairing_compound (pairing_id, compound_name)
);

-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- User_Favorite_Liquors 테이블
CREATE TABLE IF NOT EXISTS user_favorite_liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  liquor_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_liquor_fav (user_id, liquor_id)
);

-- User_Favorite_Ingredients 테이블
CREATE TABLE IF NOT EXISTS user_favorite_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_ingredient_fav (user_id, ingredient_id)
);

-- User_Disliked_Liquors 테이블
CREATE TABLE IF NOT EXISTS user_disliked_liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  liquor_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_liquor_dis (user_id, liquor_id)
);

-- User_Disliked_Ingredients 테이블
CREATE TABLE IF NOT EXISTS user_disliked_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_ingredient_dis (user_id, ingredient_id)
);

-- 샘플 데이터 추가 (예시)
INSERT INTO liquors (liquor_id, name, type, description, origin, alcohol_content, image_url)
VALUES
  (1, '스카치 위스키', '위스키', '스코틀랜드에서 생산된 전통 위스키', '스코틀랜드', 40.0, '/images/scotch.jpg'),
  (2, '버번 위스키', '위스키', '미국 켄터키산 옥수수 기반 위스키', '미국', 45.0, '/images/bourbon.jpg'),
  (3, '데킬라', '데킬라', '멕시코 아가베 식물로 만든 증류주', '멕시코', 38.0, '/images/tequila.jpg'),
  (4, '진', '진', '주니퍼 베리로 맛을 낸 증류주', '영국', 42.0, '/images/gin.jpg'),
  (5, '보드카', '보드카', '증류된 감자 또는 곡물로 만든 무색 증류주', '러시아', 40.0, '/images/vodka.jpg'),
  (6, '럼', '럼', '사탕수수에서 추출한 당밀로 만든 증류주', '카리브해', 37.5, '/images/rum.jpg');

INSERT INTO ingredients (ingredient_id, name, category, description, is_hub, image_url)
VALUES
  (1, '사과', '과일', '신선하고 달콤한 과일', false, '/images/apple.jpg'),
  (2, '레몬', '감귤류', '상큼한 시트러스 과일', false, '/images/lemon.jpg'),
  (3, '시나몬', '향신료', '달콤하고 따뜻한 향의 향신료', false, '/images/cinnamon.jpg'),
  (4, '바닐라', '향신료', '달콤하고 향긋한 향의 향신료', false, '/images/vanilla.jpg'),
  (5, '초콜릿', '디저트', '카카오에서 만든 달콤한 식품', false, '/images/chocolate.jpg'),
  (6, '바질', '허브', '향긋한 허브', false, '/images/basil.jpg');