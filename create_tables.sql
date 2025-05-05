-- Liquors 테이블
CREATE TABLE IF NOT EXISTS liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  description TEXT,
  origin VARCHAR(100),
  alcohol_content DECIMAL(5,2),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  INDEX idx_name (name)
);

-- Ingredients 테이블
CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  INDEX idx_name (name),
  INDEX idx_category (category)
);

-- Compounds 테이블
CREATE TABLE IF NOT EXISTS compounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  external_id VARCHAR(50),
  chemical_formula VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  INDEX idx_name (name)
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

-- Pairings 테이블 (liquors와 ingredients 테이블이 먼저 생성된 후에 생성되어야 함)
CREATE TABLE IF NOT EXISTS pairings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  liquor_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  score DECIMAL(10,8) NOT NULL,
  explanation TEXT,
  user_rating DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_pairing (liquor_id, ingredient_id)
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

-- Node 유형별 데이터 추출 및 각 테이블에 삽입
INSERT IGNORE INTO liquors (node_id, name)
SELECT id, name
FROM nodes
WHERE node_type = 'liquor';

INSERT IGNORE INTO ingredients (node_id, name)
SELECT id, name
FROM nodes
WHERE node_type = 'ingredient';

INSERT IGNORE INTO compounds (node_id, name, external_id)
SELECT id, name, external_id
FROM nodes
WHERE node_type = 'compound';