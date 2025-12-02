@echo off
echo FastAPI 음성 주문 서버 환경 설정 중...
echo.

REM 가상환경 생성
echo 가상환경 생성 중...
python -m venv .venv
if errorlevel 1 (
    echo 오류: 가상환경 생성 실패. Python이 설치되어 있는지 확인하세요.
    pause
    exit /b 1
)

REM 가상환경 활성화
echo 가상환경 활성화 중...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo 오류: 가상환경 활성화 실패
    pause
    exit /b 1
)

REM 패키지 설치
echo 패키지 설치 중...
pip install -r requirements.txt
if errorlevel 1 (
    echo 오류: 패키지 설치 실패
    pause
    exit /b 1
)

echo.
echo 설정이 완료되었습니다!
echo.
echo 서버를 시작하려면 다음 명령어를 실행하세요:
echo   start.bat
echo.
echo 또는 직접 실행:
echo   call .venv\Scripts\activate.bat
echo   uvicorn app.main:app --reload --host 0.0.0.0 --port 5001
echo.

pause

