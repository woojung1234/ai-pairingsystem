-- Hub_Nodes.csv와 Hub_Edges.csv에서 데이터를 가져오는 마이그레이션 스크립트

-- 1. Hub_Nodes.csv 데이터를 MySQL로 가져오기
LOAD DATA LOCAL INFILE '/ai-server/dataset/Hub_Nodes.csv'
INTO TABLE nodes
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(node_id, name, @external_id, node_type, is_hub)
SET external_id = NULLIF(@external_id, '');

-- 2. nodes 테이블에서 liquors, ingredients, compounds 테이블로 데이터 분리
INSERT INTO liquors (node_id, name, description, image_url)
SELECT n.id, n.name, n.description, n.image_url
FROM nodes n
WHERE n.node_type = 'liquor';

INSERT INTO ingredients (node_id, name, description, image_url)
SELECT n.id, n.name, n.description, n.image_url
FROM nodes n
WHERE n.node_type = 'ingredient';

INSERT INTO compounds (node_id, name, external_id, description)
SELECT n.id, n.name, n.external_id, n.description
FROM nodes n
WHERE n.node_type = 'compound';

-- 3. Hub_Edges.csv 데이터를 MySQL로 가져오기
-- 먼저 임시 테이블 생성
CREATE TEMPORARY TABLE temp_edges (
  source INT,
  target INT,
  score DECIMAL(10,8),
  edge_type VARCHAR(20)
);

-- Hub_Edges.csv 파일에서 임시 테이블로 데이터 로드
LOAD DATA LOCAL INFILE '/ai-server/dataset/Hub_Edges.csv'
INTO TABLE temp_edges
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(source, target, @score, edge_type)
SET score = NULLIF(@score, '');

-- 임시 테이블에서 edges 테이블로 데이터 복사
INSERT INTO edges (source_id, target_id, score, edge_type)
SELECT 
  (SELECT id FROM nodes WHERE node_id = te.source),
  (SELECT id FROM nodes WHERE node_id = te.target),
  te.score,
  te.edge_type
FROM temp_edges te;

-- 4. liquor-ingredient 관계를 pairings 테이블로 추가
INSERT INTO pairings (liquor_id, ingredient_id, score)
SELECT 
  l.id,
  i.id,
  e.score
FROM edges e
JOIN nodes n1 ON e.source_id = n1.id
JOIN nodes n2 ON e.target_id = n2.id
JOIN liquors l ON n1.id = l.node_id
JOIN ingredients i ON n2.id = i.node_id
WHERE n1.node_type = 'liquor' AND n2.node_type = 'ingredient'
UNION
SELECT 
  l.id,
  i.id,
  e.score
FROM edges e
JOIN nodes n1 ON e.source_id = n1.id
JOIN nodes n2 ON e.target_id = n2.id
JOIN ingredients i ON n1.id = i.node_id
JOIN liquors l ON n2.id = l.node_id
WHERE n1.node_type = 'ingredient' AND n2.node_type = 'liquor';

-- 임시 테이블 삭제
DROP TEMPORARY TABLE temp_edges;