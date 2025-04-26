# AI 기반 설명 가능한 페어링 시스템 개발 계획

## 프로젝트 개요

본 프로젝트는 사용자의 취향과 상황에 맞는 최적의 술과 음식 조합을 추천하는 AI 기반 웹서비스를 개발하는 것을 목표로 합니다. FlavorDiffusion 모델을 활용하여 술과 음식의 페어링 점수를 계산하고, 그 이유를 설명할 수 있는 시스템을 구축합니다.

## 기술 스택

- **백엔드**: Node.js + Express.js
- **프론트엔드**: React
- **데이터베이스**: MongoDB
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
│   │   └── ai/              # AI 모델 통합
│   └── Dockerfile           # 백엔드용 Docker 설정
│
├── logs/                    # 로그 파일 디렉토리
│
├── docs/                    # 프로젝트 문서
│
└── docker-compose.yml       # Docker Compose 설정
```

## 현재까지 진행된 작업

1. **프론트엔드 번역 작업 완료**
   - 전체 UI 텍스트 영어에서 한국어로 변환 완료
   - 모든 페이지 및 컴포넌트 번역 완료:
     - Header.js: 네비게이션 메뉴 및 사용자 메뉴 번역
     - Footer.js: 하단 네비게이션 및 정보 번역
     - HomePage.js: 메인 페이지 컨텐츠 및 기능 설명 번역
     - AboutPage.js: 프로젝트 소개 및 기술 설명 번역
     - LoginPage.js: 로그인 페이지 및 폼 요소 번역
     - RegisterPage.js: 회원가입 페이지 및 폼 요소 번역
     - LiquorPage.js: 주류 목록 및 검색 페이지 번역
     - LiquorDetailPage.js: 주류 상세 정보 및 페어링 추천 페이지 번역
     - IngredientPage.js: 재료 목록 및 검색 페이지 번역
     - IngredientDetailPage.js: 재료 상세 정보 및 페어링 추천 페이지 번역
     - PairingPage.js: 페어링 도구 페이지 번역
     - NotFoundPage.js: 404 오류 페이지 번역
   - 사용자 인터페이스 전반의 텍스트 일관성 유지
   - README.md 파일 영어에서 한국어로 번역 완료
   - 한국어 지원을 위한 모든 준비 완료

2. **기존 진행 작업**

   1. **프로젝트 초기 설정**
      - 기본 디렉토리 구조 생성
      - Git 저장소 초기화 및 GitHub 연결
      - package.json 구성

   2. **백엔드 서버 설정**
      - Express.js 서버 기본 구조 설정
      - MongoDB 연결 설정
      - 데이터 모델 정의 (Liquor, Ingredient, Pairing, User)
      - API 경로 및 컨트롤러 구현 

   3. **AI 모델 통합 준비**
      - FlavorDiffusion 모델 파일 확인
      - 백엔드와 AI 모델 연동 인터페이스 설계

   4. **백엔드 컨트롤러 개발 완료**
      - 모든 컨트롤러 구현 (Liquor, Ingredient, Pairing, User)
      - 라우트와 컨트롤러 분리하여 MVC 패턴 적용
      - 인증 미들웨어 구현 (JWT 기반)
      - 에러 처리 미들웨어 구현
      - 로깅 시스템 구현 (로그 파일 로테이션)

   5. **OpenAI API 통합**
      - 페어링 설명 생성을 위한 GPT 모델 연동
      - 자연어 설명 생성 로직 구현
      - 환경 변수를 통한 API 키 관리

   6. **프론트엔드 개발**
      - React 앱 기본 구조 설정
      - 핵심 페이지 컴포넌트 구현:
        - HomePage: 사이트 소개 및 주요 기능 안내
        - PairingPage: 술과 음식 조합 검색 및 결과 표시
        - LiquorPage: 술 목록 조회 및 검색
        - LiquorDetailPage: 술 상세 정보 및 추천 페어링
        - IngredientPage: 음식/재료 목록 조회 및 검색
        - IngredientDetailPage: 재료 상세 정보 및 추천 페어링
        - AboutPage: 프로젝트 소개 및 기술 설명
        - LoginPage/RegisterPage: 사용자 인증 화면
        - NotFoundPage: 404 오류 페이지
      - 컴포넌트 구현:
        - Header: 네비게이션 바 및 사용자 메뉴
        - Footer: 사이트 정보 및 링크
      - API 서비스 파일 구현으로 백엔드 연동 준비

   7. **프론트엔드-백엔드 연동 테스트**
      - API 호출 로직 구현
      - 서비스 레이어 구현 및 테스트
      - 에러 처리 및 로딩 상태 관리
      - 인증 토큰 관리 로직 구현

## 다음 진행 단계

1. **프론트엔드 추가 개발**
   - 사용자 프로필 페이지 구현
   - 상태 관리 시스템 개선 (Context API 또는 Redux)
   - 반응형 디자인 최적화
   - 접근성 개선
   - 프론트엔드 UI 전체 한국어 지원 완료

2. **AI 모델 서비스 최적화**
   - 모델 예측 성능 개선
   - 캐싱 메커니즘 추가
   - 설명 품질 향상

3. **통합 테스트**
   - API 엔드포인트 테스트
   - 프론트엔드-백엔드 통합 테스트
   - 성능 테스트

4. **배포 준비**
   - Docker 컨테이너 최적화
   - AWS 배포 스크립트 작성
   - CI/CD 파이프라인 설정

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
- `/api/users/me`: 현재 사용자 정보 조회
- `/api/users/profile`: 사용자 프로필 업데이트
- `/api/users/preferences`: 사용자 취향 정보 관리

### 페어링 관련
- `/api/pairing/score/:liquorId/:ingredientId`: 특정 술과 음식의 페어링 점수 계산
- `/api/pairing/recommendations/:liquorId`: 특정 술에 맞는 음식 추천
- `/api/pairing/explanation/:liquorId/:ingredientId`: 페어링 설명 조회
- `/api/pairing/top`: 인기 페어링 조회
- `/api/pairing/rate/:pairingId`: 페어링 평가

### 술 관련
- `/api/liquors`: 술 정보 조회 및 관리
- `/api/liquors/search/:query`: 술 검색
- `/api/liquors/:id`: 특정 술 정보 관리

### 음식/재료 관련
- `/api/ingredients`: 음식/재료 정보 조회 및 관리
- `/api/ingredients/categories`: 카테고리 목록 조회
- `/api/ingredients/category/:category`: 카테고리별 음식/재료 조회
- `/api/ingredients/search/:query`: 음식/재료 검색
- `/api/ingredients/:id`: 특정 음식/재료 정보 관리

## 애플리케이션 실행 방법

1. **백엔드 서버 실행**
   ```
   cd server
   npm install
   npm run dev
   ```
   서버는 기본적으로 http://localhost:5000에서 실행됩니다.

2. **프론트엔드 실행**
   ```
   cd client
   npm install
   npm start
   ```
   애플리케이션은 http://localhost:3000에서 실행됩니다.

3. **환경 변수 설정**
   백엔드에서 .env 파일을 통해 다음 환경 변수를 설정해야 합니다:
   - MONGODB_URI: MongoDB 연결 문자열
   - JWT_SECRET: JWT 토큰 서명용 비밀 키
   - OPENAI_API_KEY: OpenAI API 키
   - PORT: 서버 포트 (기본값: 5000)
   - NODE_ENV: 실행 환경 (development 또는 production)

## 다음 작업 계획

1. **통합 테스트 준비**
   - 테스트 스크립트 작성
   - 테스트 데이터 준비

2. **프론트엔드와 백엔드 연동 테스트 계속**
   - 페어링 추천 기능 테스트
   - 사용자 인증 흐름 테스트
   - 상세 페이지 데이터 로딩 테스트

3. **성능 최적화**
   - API 응답 속도 개선
   - 이미지 최적화
   - 렌더링 성능 개선