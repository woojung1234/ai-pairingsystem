# AI 기반 설명 가능한 페어링 시스템 개발 계획

## 프로젝트 개요

본 프로젝트는 사용자의 취향과 상황에 맞는 최적의 술과 음식 조합을 추천하는 AI 기반 웹서비스를 개발하는 것을 목표로 합니다. FlavorDiffusion 모델을 활용하여 술과 음식의 페어링 점수를 계산하고, 그 이유를 설명할 수 있는 시스템을 구축합니다.

## 기술 스택

- **백엔드**: Node.js + Express.js
- **프론트엔드**: React
- **데이터베이스**: MySQL
- **AI 모델**: FlavorDiffusion (GNN 기반)
- **자연어 생성**: OpenAI API
- **배포**: Docker, AWS

## 프로젝트 구조

```
ai-pairing/
├── ai-server/               # AI 모델 및 훈련 코드
│   ├── dataset/             # 데이터셋 파일
│   ├── model/               # 모델 구현
│   ├── api.py               # FastAPI 서버
│   └── Dockerfile.model     # AI 서비스 Docker 설정
│
├── client/                  # React 프론트엔드
│   ├── public/              # 정적 파일
│   ├── src/                 # 소스 코드
│   │   ├── components/      # React 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── services/        # API 서비스
│   │   └── assets/          # 이미지, 스타일 등
│   ├── Dockerfile           # 프론트엔드용 Docker 설정
│   └── nginx.conf           # Nginx 설정
│
├── server/                  # Express.js 백엔드
│   ├── src/                 # 소스 코드
│   │   ├── config/          # 설정 파일
│   │   ├── controllers/     # 라우트 컨트롤러
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── routes/          # API 라우트
│   │   ├── middleware/      # 커스텀 미들웨어
│   │   └── ai/              # AI 모델 통신
│   └── Dockerfile           # 백엔드용 Docker 설정
│
├── logs/                    # 로그 파일 디렉토리
│
├── docs/                    # 프로젝트 문서
│
└── docker-compose.yml       # Docker Compose 설정
```

## 현재까지 진행된 작업

### 0. API 컨트롤러 MongoDB에서 MySQL로 마이그레이션 (2025-05-05)
- **컨트롤러 코드 MongoDB에서 MySQL로 마이그레이션**:
  - liquorController.js - MongoDB 쿼리 메소드를 MySQL 모델 메소드로 변경
    - find(), findOne() 등을 getAll(), getById() 등으로 수정
    - 데이터 처리 로직을 MySQL 모델에 맞게 수정
  - ingredientController.js - MySQL 스타일로 코드 변경
    - pool 모듈 추가 임포트
    - 카테고리 조회 로직을 MySQL 쿼리로 변경
    - 페이지네이션 로직을 클라이언트 측에서 처리하도록 수정
  - API 엔드포인트 기능 확인 및 테스트
  - MongoDB 형식의 모델 메소드 호출로 인한 서버 오류 해결

### 1. Hub_Nodes 및 Hub_Edges 데이터 마이그레이션 완료 (2025-05-04)
- **MySQL 데이터베이스에 그래프 데이터 적재 완료**:
  - Hub_Nodes.csv에서 nodes 테이블로 2,005개 노드 데이터 임포트
  - Hub_Edges.csv에서 edges 테이블로 37,392개 엣지 데이터 임포트
  - 노드 유형별 분포: compound(1,589), ingredient(393), liquor(23)
  - 엣지 유형별 분포: ingr-fcomp(35,437), ingr-ingr(1,897), ingr-dcomp(58)
- **데이터 정합성 및 DB 스키마 개선**:
  - nodes 테이블의 name 필드 길이를 VARCHAR(100)에서 VARCHAR(255)로 확장
  - 누락된 score 값을 허용하도록 NULL 처리 로직 구현
  - 데이터 중복 방지를 위한 UNIQUE KEY 제약조건 적용

### 2. 데이터 마이그레이션 스크립트 추가 (2025-05-04)
- **데이터 마이그레이션 스크립트 개발**:
  - `server/src/scripts/import-hub-data.js` 스크립트 생성
  - Hub_Nodes.csv와 Hub_Edges.csv 파일을 MySQL 데이터베이스로 가져오는 기능 구현
  - 노드 및 엣지 데이터의 일관성 확인 및 유효성 검사 로직 추가
  - CSV 파싱 및 데이터베이스 트랜잭션 처리 기능 구현

### 3. 버그 수정 (2025-05-04)
- **모듈 경로 문제 해결**: 
  - compoundController.js 파일에서는 `../../models/Compound`를 이미 올바르게 사용 중이었음
  - 누락된 `models/mysql/Compound.js` 및 `models/mysql/Edge.js` 파일 생성
  - MySQL 기반의 모델 파일들을 통일성 있게 관리
- **인증 미들웨어 문제 해결**:
  - `auth.js` 파일의 미들웨어 이름을 `protect`에서 `authMiddleware`로 변경
  - `adminMiddleware` 미들웨어 추가
  - 모든 라우트 파일(user.js, liquor.js, ingredient.js 등)에서 미들웨어 참조 수정
- **라우트 순서 수정**:
  - compound.js 라우터에서 `/search/:query` 경로를 `/:id` 경로보다 먼저 정의하도록 수정
- **DB 모듈 참조 방식 수정**:
  - `Node.js`, `Compound.js`, `Edge.js` 등 모든 모델 파일에서 db 모듈 참조 방식 수정 (`const pool = require(...)` → `const db = require(...); const pool = db.pool`)
  - `index.js`에서 데이터베이스 연결 코드 수정
- **데이터베이스 연결 정보 수정**:
  - `.env` 파일에 MySQL 연결 정보 추가
  - 데이터베이스 비밀번호 수정 (`rootpassword` → `8912@28DP`)
- **데이터베이스 초기화 함수 개선**:
  - prepared statement 프로토콜에서 지원되지 않는 `USE` 문 제거
  - SQL 명령 실행 오류 처리 개선
  - 이미 존재하는 테이블에 대한 예외 처리 추가
- 서버 실행 오류 해결

### 4. 데이터베이스 전환 및 ERD 개선 완료
- MongoDB에서 MySQL로 완전 전환
- Hub_Nodes.csv와 Hub_Edges.csv 데이터셋 분석
- 새로운 ERD 설계 완료:
  - **nodes**: 모든 노드 정보 저장 (liquor, ingredient, compound)
  - **edges**: 노드 간 관계 저장
  - **liquors, ingredients, compounds**: 타입별 추가 정보
  - **pairings**: 주류-재료 페어링 전용 테이블
  - **사용자 관련 테이블**: users, 즐겨찾기, 비선호 테이블

### 2. 백엔드 API 개발 완료 (2025-05-03)
- 모든 REST API 엔드포인트 구현:
  - **Liquors API**: CRUD 작업, 검색
  - **Ingredients API**: CRUD 작업, 카테고리별 조회
  - **Compounds API**: 화합물 관리
  - **Edges API**: 노드 간 관계 조회 및 수정
  - **Pairings API**: 페어링 점수 예측 및 조회
  - **Preferences API**: 사용자 선호도 관리
  - **Recommendations API**: 주류/재료 추천, 맞춤 추천
  - **Admin API**: 데이터 임포트, 통계, 로그 조회

### 3. 프론트엔드 개발 
- React 앱 기본 구조 설정
- 핵심 페이지 컴포넌트 구현
- API 서비스 파일 구현
- UI 텍스트 번역 완료 (영문 → 한국어)
- 누락된 이미지 리소스 추가 완료

## 다음 진행 단계

### 1. API 보완 및 버그 수정 [진행 중]
- ✅ 사용자 컨트롤러 코드를 MongoDB에서 MySQL로 완전히 마이그레이션
- ✅ Auth 미들웨어를 MySQL 호환 방식으로 수정
- ✅ ingredientController.js의 구문 오류 수정
- ✅ userController.js의 pool 참조 문제 수정
- ✅ MySQL 데이터베이스 연결 설정 수정
- ✅ 로그아웃 API 엔드포인트 추가
- MongoDB에서 MySQL로 마이그레이션 완료 후 나머지 컨트롤러 오류 수정
- API 응답 형식 통일 및 오류 메시지 개선

### 2. 프론트엔드 서비스 연동 [다음 예정]
- 새로 구성된 MySQL 데이터베이스와 API 연동
- Preferences API 연동
- Recommendations API 연동
- Admin 페이지 개발

### 3. API 문서화 작업 [다음 예정]
- OpenAPI/Swagger 스펙 업데이트
- API 엔드포인트 문서화
- 요청/응답 스키마 정의

### 4. AI 모델 통합 [다음 예정]
- 페어링 점수 예측 API 개선
- 설명 생성 로직 고도화
- 성능 최적화

### 5. 배포 환경 구성 [다음 예정]
- Docker 컨테이너 최적화
- CI/CD 파이프라인 구축
- AWS 배포 설정

## 데이터 흐름

1. **사용자 입력**: 사용자가 술 또는 음식을 선택
2. **백엔드 처리**: Express.js 서버가 요청을 처리하고 AI 모델 API에 전달
3. **AI 모델 예측**: FlavorDiffusion 모델이 페어링 점수를 계산
4. **자연어 설명 생성**: OpenAI API를 사용하여 페어링 결과에 대한 설명 생성
5. **결과 처리**: 점수와 설명을 사용자에게 반환

## 주요 API 엔드포인트

### 인증 관련
- `/api/users/register`: 사용자 등록
- `/api/users/login`: 사용자 로그인
- `/api/users/logout`: 사용자 로그아웃
- `/api/users/me`: 현재 사용자 정보 조회

### 페어링 관련
- `/api/pairing/predict`: 특정 술과 음식의 페어링 점수 예측
- `/api/pairings/:liquorId/:ingredientId`: 페어링 정보 조회
- `/api/pairings/:id/rate`: 페어링 평가

### 추천 관련
- `/api/recommendations/liquors/:liquorId`: 특정 주류에 맞는 재료 추천
- `/api/recommendations/personal`: 사용자 맞춤 추천
- `/api/recommendations/popular`: 인기 페어링 조회

### 관리자 전용
- `/api/admin/import/nodes`: 노드 데이터 임포트
- `/api/admin/import/edges`: 엣지 데이터 임포트
- `/api/admin/recalculate`: 페어링 점수 재계산
- `/api/admin/stats`: 시스템 통계 조회

## 애플리케이션 실행 방법

1. **백엔드 서버 실행**
   ```
   cd server
   npm install
   npm run dev
   ```
   서버는 기본적으로 http://localhost:5004에서 실행됩니다.

2. **프론트엔드 실행**
   ```
   cd client
   npm install
   npm start
   ```
   애플리케이션은 http://localhost:3004에서 실행됩니다.

3. **환경 변수 설정**
   백엔드에서 .env 파일을 통해 다음 환경 변수를 설정해야 합니다:
   - DB_HOST: MySQL 서버 호스트 (기본값: localhost)
   - DB_PORT: MySQL 서버 포트 (기본값: 3306)
   - DB_USER: MySQL 사용자 이름
   - DB_PASSWORD: MySQL 사용자 비밀번호
   - DB_NAME: MySQL 데이터베이스 이름
   - JWT_SECRET: JWT 토큰 서명용 비밀 키
   - OPENAI_API_KEY: OpenAI API 키
   - PORT: 서버 포트 (기본값: 5004)
   - NODE_ENV: 실행 환경 (development 또는 production)

## 데이터베이스 구조

ERD 파일(`docs/revised_mysql_erd.md`)에 상세한 테이블 구조가 정의되어 있습니다.

## 로그 관리

시스템 로그는 `logs/` 디렉토리에 저장되며, 애플리케이션 로그, 오류 로그, 접근 로그가 별도로 관리됩니다.
