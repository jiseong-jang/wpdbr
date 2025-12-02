@echo off
echo ========================================
echo Python 설치 확인 중...
echo ========================================
echo.

echo [1] python 명령어 확인...
where python >nul 2>&1
if errorlevel 1 (
    echo    실패: python 명령어를 찾을 수 없습니다.
) else (
    echo    성공: python 명령어를 찾았습니다.
    python --version
)

echo.
echo [2] py 명령어 확인...
where py >nul 2>&1
if errorlevel 1 (
    echo    실패: py 명령어를 찾을 수 없습니다.
) else (
    echo    성공: py 명령어를 찾았습니다.
    py --version
)

echo.
echo [3] python3 명령어 확인...
where python3 >nul 2>&1
if errorlevel 1 (
    echo    실패: python3 명령어를 찾을 수 없습니다.
) else (
    echo    성공: python3 명령어를 찾았습니다.
    python3 --version
)

echo.
echo ========================================
echo 확인 완료
echo ========================================
echo.
pause

