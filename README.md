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

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

