# MySQL 기반 AI 페어링 시스템 ERD

## 개요

본 문서는 AI 기반 설명 가능한 페어링 시스템의 MySQL 데이터베이스 엔티티 관계 다이어그램(ERD)을 기술합니다. 기존 MongoDB 기반 시스템에서 MySQL로 마이그레이션하기 위한 스키마 설계를 포함합니다.

## 테이블 구조

### Liquors (주류 테이블)

```sql
CREATE TABLE liquors (
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
```

### Liquor_Flavor_Profiles (주류 풍미 프로필 테이블)

```sql
CREATE TABLE liquor_flavor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  liquor_id INT NOT NULL,
  flavor VARCHAR(50) NOT NULL,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_liquor_flavor (liquor_id, flavor)
);
```

### Ingredients (재료 테이블)

```sql
CREATE TABLE ingredients (
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
```

### Ingredient_Flavor_Profiles (재료 풍미 프로필 테이블)

```sql
CREATE TABLE ingredient_flavor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingredient_id INT NOT NULL,
  flavor VARCHAR(50) NOT NULL,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_ingredient_flavor (ingredient_id, flavor)
);
```

### Pairings (페어링 테이블)

```sql
CREATE TABLE pairings (
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
```

### Pairing_Shared_Compounds (페어링 공유 화합물 테이블)

```sql
CREATE TABLE pairing_shared_compounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pairing_id INT NOT NULL,
  compound_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (pairing_id) REFERENCES pairings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_pairing_compound (pairing_id, compound_name)
);
```

### Users (사용자 테이블)

```sql
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
```

### User_Favorite_Liquors (사용자 선호 주류 테이블)

```sql
CREATE TABLE user_favorite_liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  liquor_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_liquor_fav (user_id, liquor_id)
);
```

### User_Favorite_Ingredients (사용자 선호 재료 테이블)

```sql
CREATE TABLE user_favorite_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_ingredient_fav (user_id, ingredient_id)
);
```

### User_Disliked_Liquors (사용자 비선호 주류 테이블)

```sql
CREATE TABLE user_disliked_liquors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  liquor_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_liquor_dis (user_id, liquor_id)
);
```

### User_Disliked_Ingredients (사용자 비선호 재료 테이블)

```sql
CREATE TABLE user_disliked_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_ingredient_dis (user_id, ingredient_id)
);
```