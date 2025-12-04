# 멀티 스테이지 빌드: 전체 프로젝트를 하나의 컨테이너로
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 프론트엔드 빌드
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Render에서는 같은 도메인을 사용하므로 상대 경로 사용
ENV VITE_API_URL=/api
ENV VITE_VOICE_API_URL=/voice-api
RUN npm run build

# Java 빌드 스테이지
FROM maven:3.9-eclipse-temurin-17 AS backend-builder

WORKDIR /app/backend

# 백엔드 빌드
COPY backend/pom.xml .
# 의존성 다운로드 (캐시 최적화)
RUN mvn dependency:go-offline -B
# 소스 코드 복사 및 빌드
COPY backend/src ./src
RUN mvn clean package -DskipTests

# 최종 런타임 스테이지
FROM ubuntu:22.04

# 환경 변수 설정
ENV DEBIAN_FRONTEND=noninteractive
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    python3.11 \
    python3-pip \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 프론트엔드 빌드 결과 복사
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 백엔드 JAR 복사
COPY --from=backend-builder /app/backend/target/mrdinner-backend-1.0.0.jar /app/backend/app.jar

# FastAPI 복사
COPY voice-order-fastapi/ /app/voice-order-fastapi/
WORKDIR /app/voice-order-fastapi
RUN pip3 install --no-cache-dir -r requirements.txt

# application.yml 복사 (환경 변수로 대체되지만 기본 구조는 필요)
RUN mkdir -p /app/backend/src/main/resources
COPY backend/src/main/resources/application.yml.example /app/backend/src/main/resources/application.yml

# Supervisor 설정
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 시작 스크립트
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 포트 노출 (Render는 PORT 환경 변수 사용)
EXPOSE 80

# 시작 스크립트 실행 (PORT 변수 처리 후 supervisor 시작)
CMD ["/app/start.sh"]

