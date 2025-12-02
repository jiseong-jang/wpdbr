@echo off
echo FastAPI 음성 주문 서버 시작 중...
echo.

REM Python 명령어 찾기
where python >nul 2>&1
if errorlevel 1 (
    echo 오류: Python을 찾을 수 없습니다.
    echo.
    echo Python이 설치되어 있는지 확인하세요.
    echo Python 설치: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM Python 버전 확인
python --version
if errorlevel 1 (
    echo 오류: Python 버전 확인 실패
    pause
    exit /b 1
)

REM 가상환경이 없으면 생성
if not exist ".venv" (
    echo 가상환경 생성 중...
    python -m venv .venv
    if errorlevel 1 (
        echo.
        echo 오류: 가상환경 생성 실패
        echo Python이 올바르게 설치되어 있는지 확인하세요.
        echo.
        pause
        exit /b 1
    )
    echo 가상환경 생성 완료!
)

REM 가상환경 활성화
echo 가상환경 활성화 중...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo 오류: 가상환경 활성화 실패
    pause
    exit /b 1
)

REM 필요한 패키지 설치
echo 패키지 설치 확인 중...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo 오류: 패키지 설치 실패
    pause
    exit /b 1
)

REM 서버 실행
echo.
echo 서버 시작 중... (포트 5001)
echo 브라우저에서 http://localhost:5001 을 열어주세요.
echo 종료하려면 Ctrl+C를 누르세요.
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 5001

pause

