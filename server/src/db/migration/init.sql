-- AI 페어링 시스템 데이터베이스 초기화 스크립트

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS ai_pairing_db;
USE ai_pairing_db;

-- 테이블 생성 전 기존 테이블 삭제 (있는 경우)
DROP TABLE IF EXISTS user_disliked_ingredients;
DROP TABLE IF EXISTS user_disliked_liquors;
DROP TABLE IF EXISTS user_favorite_ingredients;
DROP TABLE IF EXISTS user_favorite_liquors;
DROP TABLE IF EXISTS pairings;
DROP TABLE IF EXISTS compounds;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS liquors;
DROP TABLE IF EXISTS edges;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS nodes;

-- nodes 테이블 생성
CREATE TABLE nodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  external_id VARCHAR(50),
  node_type ENUM('ingredient', 'liquor', 'compound') NOT NULL,
  is_hub BOOLEAN DEFAULT FALSE,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_node_id (node_id),
  INDEX idx_name (name),
  INDEX idx_node_type (node_type)
);

-- edges 테이블 생성
CREATE TABLE edges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_id INT NOT NULL,
  target_id INT NOT NULL,
  score DECIMAL(10,8),
  edge_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES nodes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_edge (source_id, target_id, edge_type),
  INDEX idx_edge_type (edge_type)
);

-- liquors 테이블 생성
CREATE TABLE liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
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

-- ingredients 테이블 생성
CREATE TABLE ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  INDEX idx_name (name),
  INDEX idx_category (category)
);

-- compounds 테이블 생성
CREATE TABLE compounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  external_id VARCHAR(50),
  chemical_formula VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  INDEX idx_name (name)
);

-- pairings 테이블 생성
CREATE TABLE pairings (
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

-- users 테이블 생성
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- user_favorite_liquors 테이블 생성
CREATE TABLE user_favorite_liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  liquor_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_liquor_fav (user_id, liquor_id)
);

-- user_favorite_ingredients 테이블 생성
CREATE TABLE user_favorite_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_ingredient_fav (user_id, ingredient_id)
);

-- user_disliked_liquors 테이블 생성
CREATE TABLE user_disliked_liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  liquor_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_liquor_dis (user_id, liquor_id)
);

-- user_disliked_ingredients 테이블 생성
CREATE TABLE user_disliked_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_ingredient_dis (user_id, ingredient_id)
);

-- 초기 관리자 계정 생성 (비밀번호: admin123 - 실제 환경에서는 암호화된 비밀번호 사용)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2b$10$XW.dCwUB9ZbQE25.nIw5buLwge23p5ARXk5tZX.P8vkU4FIxlpS0m', 'admin');

-- 테스트 계정 생성 (비밀번호: testpassword)
INSERT INTO users (username, email, password, role) 
VALUES ('tester', 'example@example.com', '$2b$10$8s9vV.9lTjXV.ZCfXHvOuu6j8FTXhO7O4OPf8aP9HBGfWDkPqIY5m', 'user');