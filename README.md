# 미스터 대박 디너 서비스

React 프론트엔드와 Spring Boot 백엔드로 구현된 프리미엄 디너 주문 및 배달 관리 시스템입니다.

## 기술 스택

### 백엔드
- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security + JWT
- MySQL
- Lombok

### 프론트엔드
- React 18
- TypeScript
- React Router
- Zustand
- Axios
- Vite

## 프로젝트 구조

```
wpdbr/
├── backend/          # Spring Boot 백엔드
│   ├── src/main/java/com/mrdinner/
│   │   ├── config/      # 설정 클래스
│   │   ├── controller/  # REST API 컨트롤러
│   │   ├── service/     # 비즈니스 로직
│   │   ├── repository/  # 데이터 접근 계층
│   │   ├── entity/      # JPA 엔티티
│   │   ├── dto/         # 데이터 전송 객체
│   │   ├── security/    # JWT 인증/인가
│   │   └── exception/   # 예외 처리
│   └── src/main/resources/
│       ├── application.yml
│       └── data.sql      # 초기 데이터
│
└── frontend/        # React 프론트엔드
    ├── src/
    │   ├── components/  # 재사용 컴포넌트
    │   ├── pages/       # 페이지 컴포넌트
    │   ├── store/       # Zustand 스토어
    │   ├── api/         # API 호출 함수
    │   └── types/       # TypeScript 타입
    └── package.json
```

## 설정 방법

### 1. 데이터베이스 설정

MySQL 데이터베이스를 생성합니다:

```sql
CREATE DATABASE mrdinner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> **기존 DB에서 한글이 깨질 때**
> 1. 데이터베이스/테이블 문자셋을 강제로 UTF-8로 변경합니다.
>    ```sql
>    ALTER DATABASE mrdinner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
>    ALTER TABLE items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
>    ALTER TABLE menus CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
>    ALTER TABLE menu_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
>    ```
> 2. `backend/sql/reset_menu_data.sql`을 실행하여 기존 메뉴/아이템/재고 데이터를 초기화합니다.
>    ```bash
>    mysql -u root -p mrdinner < backend/sql/reset_menu_data.sql
>    ```
> 3. 애플리케이션을 재시작하면 `DataInitializer`가 UTF-8 데이터로 다시 채워줍니다.

### 2. 백엔드 설정

1. `backend/src/main/resources/application.yml` 파일에서 데이터베이스 연결 정보를 수정합니다:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mrdinner?useSSL=false&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci
    username: root
    password: root  # 실제 비밀번호로 변경
```

2. 백엔드 디렉토리에서 Maven으로 빌드 및 실행:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

백엔드는 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 설정

1. 프론트엔드 디렉토리에서 의존성 설치:
```bash
cd frontend
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 주요 기능

### 고객 기능
- 회원가입 및 로그인
- 메뉴 조회 및 커스터마이징
- 장바구니 관리
- 주문 생성 (즉시 배달 / 예약 주문)
- 쿠폰 적용
- 주문 내역 조회 및 추적
- 프로필 관리

### 주방 직원 기능
- 대기 중인 주문 조회
- 주문 수령 및 조리 관리
- 재고 관리 (수동 조정, 발주 요청)
- 재고 자동 보충 (일일/주간 스케줄러)

### 배달 직원 기능
- 배달 준비된 주문 조회
- 주문 픽업 및 배달 완료 처리

## 초기 계정

### 주방 직원 (5명)
- 아이디: `kitchen1` ~ `kitchen5`
- 비밀번호: `password`
- 직원 ID: `K001` ~ `K005`

### 배달 직원 (5명)
- 아이디: `delivery1` ~ `delivery5`
- 비밀번호: `password`
- 직원 ID: `D001` ~ `D005`

## 초기 데이터

애플리케이션이 부팅될 때 `DataInitializer`가 한 번만 다음 데이터를 삽입합니다.

- 5명의 주방 직원 계정
- 5명의 배달 직원 계정
- 기본 재고 아이템
- 샘플 쿠폰

> 수동으로 데이터를 리셋하고 싶다면 `backend/sql/reset_menu_data.sql`을 실행한 뒤
> 애플리케이션을 재시작하세요.

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/check-id` - 아이디 중복 확인

### 메뉴
- `GET /api/menus` - 메뉴 목록
- `GET /api/menus/{id}` - 메뉴 상세
- `GET /api/items` - 아이템 목록

### 장바구니 (인증 필요)
- `GET /api/cart` - 장바구니 조회
- `POST /api/cart/items` - 장바구니에 추가
- `PUT /api/cart/items/{id}` - 장바구니 아이템 수정
- `DELETE /api/cart/items/{id}` - 장바구니 아이템 삭제
- `DELETE /api/cart` - 장바구니 비우기

### 주문 (인증 필요)
- `POST /api/orders` - 주문 생성
- `POST /api/orders/{id}/coupon` - 쿠폰 적용
- `GET /api/orders` - 주문 내역 조회
- `GET /api/orders/{id}` - 주문 상세 조회
- `GET /api/orders/current` - 현재 진행 중 주문 조회

### 주방 직원 (인증 필요)
- `GET /api/kitchen/orders/pending` - 대기 중인 주문 목록
- `POST /api/kitchen/orders/{id}/receive` - 주문 수령
- `POST /api/kitchen/orders/{id}/start` - 조리 시작
- `POST /api/kitchen/orders/{id}/complete` - 조리 완료
- `GET /api/kitchen/inventory` - 재고 조회
- `PUT /api/kitchen/inventory/{itemName}` - 재고 수정

### 배달 직원 (인증 필요)
- `GET /api/delivery/orders/ready` - 배달 준비된 주문 목록
- `POST /api/delivery/orders/{id}/pickup` - 주문 픽업
- `POST /api/delivery/orders/{id}/complete` - 배달 완료

## 메뉴 정보

### 발렌타인 디너 (100,000원)
- 작은 하트 모양과 큐피드가 장식된 접시 1개
- 냅킨 2개
- 와인 1병
- 스테이크 1개

### 프렌치 디너 (80,000원)
- 커피 1잔
- 와인 1잔
- 샐러드 1개
- 스테이크 1개

### 잉글리시 디너 (70,000원)
- 에그 스크램블 1개
- 베이컨 1개
- 빵 1개
- 스테이크 1개

### 샴페인 축제 디너 (250,000원) - 2인분
- 샴페인 1병
- 바게트빵 4개
- 커피 포트 1개
- 와인 1병
- 스테이크 2개

### 스타일 옵션
- 심플: 기본 (추가 금액 없음)
- 그랜드: +10,000원
- 디럭스: +20,000원
- 샴페인 축제 디너는 그랜드 또는 디럭스만 선택 가능

## 재고 자동 보충

- **일일 보충** (매일 자정): 와인(병) 5병, 샴페인 5병, 와인(잔) 10잔
- **주간 보충** (월요일, 목요일 자정): 스테이크 15개, 커피 30개, 샐러드 10개, 에그 스크램블 10개, 베이컨 10개, 빵 10개, 바게트빵 20개, 커피포트 5개

## 배포 가이드

이 프로젝트는 **완전 무료**로 배포할 수 있도록 설정되어 있습니다. 두 가지 배포 방법을 제공합니다:

### 배포 방법 선택

#### 방법 1: 개별 서비스 배포 (추천) 🚀
- **백엔드**: Render Web Service (Spring Boot)
- **프론트엔드**: Render Static Site (React)
- **음성인식 API**: Render Web Service (FastAPI)
- **데이터베이스**: PlanetScale MySQL
- 각 서비스를 독립적으로 관리하고 스케일링 가능

#### 방법 2: Docker 단일 컨테이너 배포 🐳
- **하나의 서비스로 전체 애플리케이션 배포** (프론트엔드 + 백엔드 + 음성인식 API)
- 단일 URL로 모든 서비스 접근
- 하나의 서비스만 무료 티어 사용

---

## 🚀 방법 1: 개별 서비스 배포 (Render)

### 사전 준비

1. **GitHub 저장소에 코드 푸시**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **PlanetScale 데이터베이스 생성**
   - [PlanetScale](https://planetscale.com/)에서 무료 계정 생성
   - 새 데이터베이스 생성
   - 연결 정보 확인 (Host, Username, Password, Database name)

### 1단계: 백엔드 배포 (Render Web Service)

1. **Render 대시보드 접속**
   - [Render](https://render.com/)에 로그인 (GitHub 계정 연동)

2. **새 Web Service 생성**
   - "New" → "Web Service" 선택
   - GitHub 저장소 연결
   - 다음 설정 입력:
     - **Name**: `mrdinner-backend`
     - **Environment**: `Java`
     - **Build Command**: `cd backend && mvn clean package -DskipTests`
     - **Start Command**: `cd backend && java -jar target/mrdinner-backend-1.0.0.jar`
     - **Root Directory**: (비워두기)

3. **환경 변수 설정**
   Render 대시보드의 "Environment" 탭에서 다음 변수들을 추가:
   ```env
   SPRING_DATASOURCE_URL=jdbc:mysql://[HOST]:3306/[DATABASE]?useSSL=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci
   SPRING_DATASOURCE_USERNAME=[USERNAME]
   SPRING_DATASOURCE_PASSWORD=[PASSWORD]
   JWT_SECRET=[최소 32자 이상의 랜덤 문자열]
   FRONTEND_URL=https://[프론트엔드 URL].onrender.com
   ```
   > **참고**: `FRONTEND_URL`은 프론트엔드 배포 후 실제 URL로 업데이트하세요.

4. **배포 시작**
   - "Create Web Service" 클릭
   - 배포 완료 후 백엔드 URL 확인 (예: `https://mrdinner-backend.onrender.com`)

### 2단계: 음성인식 API 배포 (Render Web Service)

1. **새 Web Service 생성**
   - "New" → "Web Service" 선택
   - 같은 GitHub 저장소 연결
   - 다음 설정 입력:
     - **Name**: `mrdinner-voice-api`
     - **Environment**: `Python 3`
     - **Build Command**: `cd voice-order-fastapi && pip install -r requirements.txt`
     - **Start Command**: `cd voice-order-fastapi && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Root Directory**: (비워두기)

2. **환경 변수 설정**
   ```env
   VOICE_ORDER_CLIENT_ORIGIN=https://[프론트엔드 URL].onrender.com
   VOICE_ORDER_MODEL_PRESET=openai
   OPENAI_API_KEY=[OpenAI API 키]
   VOICE_ORDER_CHAT_MODEL=gpt-4o-mini
   ```
   > **참고**: `VOICE_ORDER_CLIENT_ORIGIN`은 프론트엔드 배포 후 실제 URL로 업데이트하세요.

3. **배포 시작**
   - "Create Web Service" 클릭
   - 배포 완료 후 음성인식 API URL 확인 (예: `https://mrdinner-voice-api.onrender.com`)

### 3단계: 프론트엔드 배포 (Render Static Site)

1. **새 Static Site 생성**
   - "New" → "Static Site" 선택
   - GitHub 저장소 연결
   - 다음 설정 입력:
     - **Name**: `mrdinner-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **환경 변수 설정**
   "Environment Variables" 섹션에서 다음 추가:
   ```env
   VITE_API_URL=https://[백엔드 URL]/api
   VITE_VOICE_API_URL=https://[음성인식 API URL]
   ```
   예시:
   - `VITE_API_URL=https://mrdinner-backend.onrender.com/api`
   - `VITE_VOICE_API_URL=https://mrdinner-voice-api.onrender.com`

3. **배포 시작**
   - "Create Static Site" 클릭
   - 배포 완료 후 프론트엔드 URL 확인 (예: `https://mrdinner-frontend.onrender.com`)

### 4단계: CORS 설정 업데이트

프론트엔드 배포 후, 백엔드와 음성인식 API의 환경 변수를 업데이트합니다:

1. **백엔드 CORS 설정**
   - Render 대시보드 → `mrdinner-backend` 서비스 → "Environment" 탭
   - `FRONTEND_URL` 환경 변수를 실제 프론트엔드 URL로 업데이트:
     ```
     FRONTEND_URL=https://mrdinner-frontend.onrender.com
     ```

2. **음성인식 API CORS 설정**
   - Render 대시보드 → `mrdinner-voice-api` 서비스 → "Environment" 탭
   - `VOICE_ORDER_CLIENT_ORIGIN` 환경 변수를 실제 프론트엔드 URL로 업데이트:
     ```
     VOICE_ORDER_CLIENT_ORIGIN=https://mrdinner-frontend.onrender.com
     ```

3. **서비스 재배포**
   - 환경 변수 저장 후 자동으로 재배포되거나, 수동으로 "Manual Deploy" 클릭

### 5단계: 배포 확인

- [ ] 프론트엔드: `https://mrdinner-frontend.onrender.com`
- [ ] 백엔드 API: `https://mrdinner-backend.onrender.com/api/menus`
- [ ] 음성인식 API: `https://mrdinner-voice-api.onrender.com/health`
- [ ] CORS 오류 확인 (브라우저 개발자 도구)
- [ ] 로그인 기능 테스트
- [ ] 음성인식 기능 테스트

---

## 🐳 방법 2: Docker 단일 컨테이너 배포 (Render)

### 장점
- ✅ **간단함**: 하나의 서비스만 배포하면 됨
- ✅ **빠른 설정**: render.yaml 파일만 사용
- ✅ **단일 URL**: 모든 서비스가 같은 도메인에서 동작
- ✅ **비용 절감**: 하나의 서비스만 무료 티어 사용

### 사전 준비

1. **GitHub 저장소에 코드 푸시**
   ```bash
   git add .
   git commit -m "Add Docker configuration"
   git push origin main
   ```

2. **PlanetScale 데이터베이스 생성**
   - [PlanetScale](https://planetscale.com/)에서 무료 계정 생성
   - 새 데이터베이스 생성
   - 연결 정보 확인 (Host, Username, Password, Database name)

### Render 배포 단계

1. **Render 대시보드 접속**
   - [Render](https://render.com/)에 로그인 (GitHub 계정 연동)

2. **새 Web Service 생성**
   - "New" → "Web Service" 선택
   - GitHub 저장소 연결
   - **중요**: "Docker" 옵션 선택 (또는 render.yaml 파일이 있으면 자동 인식)

3. **서비스 설정**
   - **Name**: `mrdinner-all-in-one`
   - **Environment**: `Docker` (또는 `Dockerfile` 선택)
   - **Dockerfile Path**: `./Dockerfile` (기본값)
   - **Docker Context**: `.` (프로젝트 루트)

4. **환경 변수 설정**
   Render 대시보드의 "Environment" 탭에서 다음 변수들을 추가:

   ```env
   # 데이터베이스 (PlanetScale)
   SPRING_DATASOURCE_URL=jdbc:mysql://[HOST]:3306/[DATABASE]?useSSL=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci
   SPRING_DATASOURCE_USERNAME=[USERNAME]
   SPRING_DATASOURCE_PASSWORD=[PASSWORD]
   
   # JWT
   JWT_SECRET=[최소 32자 이상의 랜덤 문자열]
   
   # 프론트엔드 URL (배포 후 Render에서 제공하는 URL로 변경)
   FRONTEND_URL=https://your-service.onrender.com
   
   # 음성 인식 API 설정
   VOICE_ORDER_CLIENT_ORIGIN=https://your-service.onrender.com
   VOICE_ORDER_MODEL_PRESET=openai
   OPENAI_API_KEY=[OpenAI API 키]
   VOICE_ORDER_CHAT_MODEL=gpt-4o-mini
   
   # Hugging Face 사용 시 (선택사항)
   VOICE_ORDER_HF_ENDPOINT=https://router.huggingface.co/v1/chat/completions
   VOICE_ORDER_HF_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct
   VOICE_ORDER_HF_TOKEN=[Hugging Face 토큰]
   ```

   > **참고**: `PORT` 환경 변수는 Render가 자동으로 설정하므로 추가할 필요 없습니다.

5. **배포 시작**
   - "Create Web Service" 클릭
   - 첫 빌드는 약 5-10분 소요 (의존성 다운로드 및 빌드)
   - 배포 완료 후 Render가 제공하는 URL 확인 (예: `https://mrdinner-all-in-one.onrender.com`)

6. **배포 후 확인**
   - 프론트엔드: `https://your-service.onrender.com`
   - 백엔드 API: `https://your-service.onrender.com/api`
   - 음성 인식 API: `https://your-service.onrender.com/voice-api`

### render.yaml 사용 (선택사항)

프로젝트 루트에 `render.yaml` 파일이 있으면, Render 대시보드에서 "Apply render.yaml" 옵션을 사용하여 자동으로 서비스를 생성할 수 있습니다.

---

### 무료 티어 제한사항 및 대안

#### Render 무료 티어
- ✅ **무료**: 월 $0
- ⚠️ **제한**: 15분간 요청이 없으면 서비스가 sleep 상태로 전환
- ⚠️ **제한**: 첫 요청 시 깨어나는데 약 30초~1분 소요
- 💡 **대안**: 
  - [Railway](https://railway.app/) (월 $5 크레딧 무료, sleep 없음)
  - [Fly.io](https://fly.io/) (무료 티어, sleep 없음)
  - [Render 유료 플랜](https://render.com/pricing) ($7/월부터 sleep 없음)

#### PlanetScale 무료 티어
- ✅ **무료**: 월 $0
- ⚠️ **제한**: 데이터베이스 크기 5GB
- ⚠️ **제한**: 연결 수 제한
- 💡 **대안**:
  - [Supabase](https://supabase.com/) (PostgreSQL, 무료 티어, 500MB)
  - [Neon](https://neon.tech/) (PostgreSQL, 무료 티어, 3GB)
  - [Railway](https://railway.app/) (MySQL/PostgreSQL, 무료 크레딧)

### 데이터베이스 초기화

배포 후 첫 실행 시 `DataInitializer`가 자동으로 초기 데이터를 생성합니다. 만약 수동으로 초기화해야 한다면:

1. PlanetScale 대시보드에서 SQL 콘솔 열기
2. `backend/sql/reset_menu_data.sql` 파일의 내용 실행 (있는 경우)
3. 또는 백엔드 애플리케이션을 재시작하여 자동 초기화

### 배포 후 확인 사항

- [ ] 프론트엔드가 정상적으로 로드되는지 확인 (`https://your-service.onrender.com`)
- [ ] 백엔드 API가 정상적으로 응답하는지 확인 (`https://your-service.onrender.com/api/menus` 엔드포인트 테스트)
- [ ] 음성인식 API가 정상적으로 응답하는지 확인 (`https://your-service.onrender.com/voice-api/health` 엔드포인트 테스트)
- [ ] CORS 오류가 없는지 확인 (브라우저 개발자 도구 콘솔 확인)
- [ ] 로그인이 정상적으로 작동하는지 확인
- [ ] 데이터베이스 연결이 정상인지 확인 (주문 생성 등 테스트)
- [ ] 음성인식 기능이 정상적으로 작동하는지 확인 (메뉴 목록 페이지에서 음성 주문 테스트)

### 주의사항

1. **Render 무료 티어 제한**:
   - 15분간 요청이 없으면 서비스가 sleep 상태로 전환됩니다
   - 첫 요청 시 깨어나는데 약 30초~1분 정도 소요될 수 있습니다
   - **해결 방법**: 
     - [UptimeRobot](https://uptimerobot.com/) (무료)로 5분마다 헬스체크 요청
     - [Cron-job.org](https://cron-job.org/) (무료)로 주기적 ping 설정
     - 프로덕션 환경에서는 유료 플랜($7/월)을 고려하세요

2. **PlanetScale 무료 티어 제한**:
   - 데이터베이스 크기 제한 (약 5GB)
   - 연결 수 제한
   - 자세한 내용은 PlanetScale 문서를 참조하세요

3. **환경 변수 보안**:
   - 민감한 정보(비밀번호, JWT 시크릿)는 절대 코드에 커밋하지 마세요
   - `.env` 파일은 `.gitignore`에 추가되어 있어야 합니다

### 무료로 Sleep 방지하기

Render 무료 티어의 sleep 문제를 해결하려면:

1. **UptimeRobot 사용 (추천)**:
   - [UptimeRobot](https://uptimerobot.com/) 가입 (무료)
   - 새 Monitor 생성
   - Type: HTTP(s)
   - URL: `https://your-service.onrender.com/api/menus` (또는 `/` 프론트엔드)
   - Interval: 5분
   - 이렇게 하면 5분마다 요청이 가서 sleep 상태가 되지 않습니다

2. **Cron-job.org 사용**:
   - [Cron-job.org](https://cron-job.org/) 가입 (무료)
   - 새 Job 생성
   - URL: `https://your-service.onrender.com/api/menus` (또는 `/` 프론트엔드)
   - Schedule: `*/5 * * * *` (5분마다)

### 문제 해결

**백엔드가 시작되지 않는 경우**:
- Render 로그 확인
- 환경 변수가 올바르게 설정되었는지 확인
- 데이터베이스 연결 정보 확인

**CORS 오류가 발생하는 경우**:
- `FRONTEND_URL` 환경 변수가 Render 서비스 URL과 일치하는지 확인
- `VOICE_ORDER_CLIENT_ORIGIN` 환경 변수가 Render 서비스 URL과 일치하는지 확인
- URL에 프로토콜(`https://`)이 포함되어 있는지 확인

**데이터베이스 연결 오류**:
- PlanetScale 연결 정보 확인
- SSL 설정 확인 (PlanetScale은 SSL 필수)
- 방화벽 설정 확인

**음성인식 API 오류**:
- OpenAI API 키가 올바르게 설정되었는지 확인
- `VOICE_ORDER_CLIENT_ORIGIN` 환경 변수가 프론트엔드 URL을 포함하는지 확인
- Render 로그에서 Python 의존성 설치 오류 확인

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

