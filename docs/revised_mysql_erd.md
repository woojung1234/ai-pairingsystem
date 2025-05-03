# 수정된 MySQL 기반 AI 페어링 시스템 ERD

## 개요

본 문서는 AI 기반 설명 가능한 페어링 시스템의 MySQL 데이터베이스 엔티티 관계 다이어그램(ERD)을 Hub_Nodes.csv와 Hub_Edges.csv 데이터셋 분석 결과를 반영하여 재설계한 것입니다.

## 테이블 구조

### Nodes (노드 테이블)

```sql
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
```

### Edges (엣지 테이블)

```sql
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
```

### Liquors (주류 테이블)

```sql
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
```

### Ingredients (재료 테이블)

```sql
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
```

### Compounds (화합물 테이블)

```sql
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
```

### Pairings (페어링 테이블)

```sql
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

## 데이터 마이그레이션 방법

Hub_Nodes.csv 및 Hub_Edges.csv 파일에서 데이터베이스로 데이터를 이관하는 방법은 다음과 같습니다:

1. Hub_Nodes.csv에서 nodes 테이블로 데이터 삽입
2. nodes 테이블의 데이터를 기반으로 liquors, ingredients, compounds 테이블에 추가 정보 삽입
3. Hub_Edges.csv에서 edges 테이블로 데이터 삽입
4. edges 테이블의 데이터 중 liquor-ingredient 관계를 pairings 테이블에 삽입

이 과정을 위한 SQL 스크립트는 별도로 마이그레이션 스크립트 파일에 작성할 수 있습니다.

## ERD 설계 설명

1. **nodes 테이블**: 모든 노드(주류, 재료, 화합물)의 기본 정보를 저장하는 테이블입니다. Hub_Nodes.csv의 데이터를 직접 매핑합니다.

2. **edges 테이블**: 노드 간의 관계를 저장하는 테이블입니다. Hub_Edges.csv의 데이터를 직접 매핑합니다.

3. **liquors, ingredients, compounds 테이블**: 각 노드 유형별로 추가 정보를 저장하는 테이블입니다. nodes 테이블과 1:1 관계를 가집니다.

4. **pairings 테이블**: 주류와 재료 간의 페어링 정보를 저장하는 테이블입니다. edges 테이블에서 liquor-ingredient 관계만 추출하여 사용합니다.

5. **사용자 관련 테이블**: 사용자 정보와 선호도를 저장하는 테이블입니다.

이 구조는 그래프 데이터베이스의 특성을 관계형 데이터베이스로 효과적으로 표현할 수 있게 합니다.
