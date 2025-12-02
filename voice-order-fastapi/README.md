# Voice Order FastAPI Service

이 디렉터리는 기존 Node.js 기반 `voice-order` 서버를 FastAPI로 옮긴 버전입니다.  
React 프런트(`voice-order/src/demo.js`)가 호출하는 API와 동일한 엔드포인트/동작을 제공하므로, 다른 프런트엔드에서도 재사용할 수 있습니다.

## 구조

```
voice-order-fastapi/
├─ app/
│  ├─ main.py              # FastAPI 엔트리포인트
│  ├─ config.py            # 환경 변수 로딩 및 설정
│  ├─ context.py           # 시스템 프롬프트 & 메뉴/스타일 데이터
│  ├─ schemas.py           # 요청/응답 Pydantic 모델
│  ├─ llm.py               # LLM 호출(OpenAI/Hugging Face) 및 주문 요약
│  ├─ order_summary.py     # 요약 프롬프트 구성 & 파서
│  └─ stt.py               # Whisper(STT) 호출
├─ app/data/
│  ├─ menus.csv            # 세트 메뉴 정의
│  ├─ menu_items.csv       # 메뉴 기본 구성품 & 단품 단가
│  ├─ styles.csv           # 서빙 스타일 정의
│  └─ orders/              # 저장된 주문 JSON (자동 생성)
├─ requirements.txt
└─ README.md
```

`.env`는 기존 프로젝트(`Mr.Daeback/.env`)를 그대로 재사용합니다. 필요한 환경변수는 `app/config.py` 참고. 메뉴 데이터 위치를 커스터마이징하려면 `VOICE_ORDER_MENU_DATA_DIR`(디렉터리)을 설정하세요.

## 빠른 시작

프로젝트 루트(`wpdbr`) 디렉토리에서 다음 명령어를 실행하세요:

**가장 쉬운 방법 (Windows):**

1. `voice-order-fastapi` 폴더로 이동
2. `setup.bat` 파일을 더블클릭하여 환경 설정 (처음 한 번만)
3. 설정 완료 후 `start.bat` 파일을 더블클릭하여 서버 실행

또는 CMD에서 수동으로 실행:

### Windows CMD

CMD에서는 각 명령어를 **한 줄씩** 순차적으로 실행하세요:

```cmd
cd voice-order-fastapi
python -m venv .venv
```

가상환경이 생성되면, 다음 명령어로 활성화:

```cmd
call .venv\Scripts\activate.bat
```

활성화되면 프롬프트 앞에 `(.venv)`가 표시됩니다. 그 다음:

```cmd
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 5001
```

**전체를 한 번에 실행하려면:**

```cmd
cd voice-order-fastapi && python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 5001
```

### Windows PowerShell

```powershell
cd voice-order-fastapi
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 5001
```

**PowerShell 실행 정책 오류가 나는 경우:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
위 명령어를 실행한 후 다시 시도하세요.

### Linux/Mac

```bash
cd voice-order-fastapi
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 5001
```

**주요 참고사항:**
- `.env` 파일은 `voice-order-fastapi` 폴더 또는 프로젝트 루트(`wpdbr`)에 위치해야 합니다. 없어도 기본 설정으로 실행 가능하지만, LLM API 키 등이 필요하면 반드시 설정해야 합니다.
- Python 3.8 이상이 설치되어 있어야 합니다.
- 실행이 안 될 경우, Python 경로를 확인하거나 `python3` 명령어를 사용해보세요.

**문제 해결:**

1. **Python을 찾을 수 없다는 오류가 나는 경우:**
   - Python이 설치되어 있는지 확인: `python --version` 또는 `python3 --version`
   - 환경 변수에 Python이 추가되어 있는지 확인

2. **가상환경 활성화가 안 되는 경우 (Windows PowerShell):**
   - PowerShell 실행 정책 문제일 수 있습니다. 다음 명령어로 해결:
     ```powershell
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```

3. **포트 5001이 이미 사용 중인 경우:**
   - 다른 프로세스가 사용 중이거나 이미 서버가 실행 중일 수 있습니다.
   - 다른 포트를 사용하려면: `uvicorn app.main:app --reload --host 0.0.0.0 --port 5002`

4. **모듈을 찾을 수 없다는 오류:**
   - 가상환경이 활성화되어 있는지 확인
   - `pip install -r requirements.txt`를 다시 실행

5. **.env 파일 관련 오류:**
   - `.env` 파일이 없어도 기본 설정으로 실행됩니다.
   - 하지만 OpenAI API 키 등이 필요하면 `voice-order-fastapi/.env` 파일을 생성하고 환경 변수를 설정해야 합니다.

- React 앱에서는 기존과 동일하게 `http://localhost:5001`를 바라보면 됩니다.
- 다른 프런트엔드도 동일한 REST 엔드포인트를 사용하면 즉시 연동 가능합니다.
- FastAPI 프로젝트에 포함된 간단한 프런트엔드 데모는 `http://localhost:5001/`에서 바로 확인할 수 있습니다.

## 제공 엔드포인트

| Method | Path                    | 설명                              |
| ------ | ----------------------- | --------------------------------- |
| GET    | `/health`              | 서버 상태 확인                     |
| GET    | `/config/system-prompt`| 데모와 동일한 시스템 프롬프트 제공 |
| GET    | `/config/order-token`  | 확정 토큰 `<<CONFIRM_ORDER>>` 조회 |
| GET    | `/config/initial-language` | 초기 언어 코드(`ko-KR`)          |
| GET    | `/config/ui-text`      | 언어별 UI 메시지 세트              |
| GET    | `/config/greeting`     | 언어별 초기 인사 문구              |
| GET    | `/config/language-instruction` | 언어 고정 시스템 메시지        |
| POST   | `/utils/detect-language` | 텍스트 기반 언어 감지            |
| POST   | `/api/llm/generate`    | LLM 대화 응답 생성                 |
| POST   | `/api/stt/transcribe`  | Whisper를 통한 음성 → 텍스트 변환 |
| POST   | `/api/order/confirm`   | 주문 요약 LLM 호출 + JSON 저장    |

`/api/order/confirm`는 Node 버전과 동일하게 `app/data/orders/`(혹은 `VOICE_ORDER_ORDER_DIR`)에 JSON을 저장합니다.

## 프런트엔드 연동 가이드

1. FastAPI 서버 실행 후 CORS 허용 오리진(`VOICE_ORDER_CLIENT_ORIGIN`)을 필요에 따라 `.env`에서 수정합니다.
2. 프런트엔드에서
   - 채팅: `POST /api/llm/generate`에 `{ messages: [{ role, content }, ...] }`
   - 음성 변환: `POST /api/stt/transcribe`에 `FormData`로 `file` 업로드
   - 주문 확정: `POST /api/order/confirm`에 `{ history: [...], finalMessage }`
   를 호출합니다.
3. 응답 포맷은 React 데모와 동일하므로 추가 수정 없이 재사용할 수 있습니다.

## 모델 전환 빠르게 하기 (프리셋)
- 루트 `.env`에서 `VOICE_ORDER_MODEL_PRESET`을 설정하면 관련 값이 자동 적용됩니다.
  - `openai` → OpenAI 사용 (`VOICE_ORDER_CHAT_MODEL` 기본 gpt-4o-mini)
  - `hf_base` → HF router + `meta-llama/Meta-Llama-3.1-8B-Instruct`
- `hf_finetune` → 로컬/사설 엔드포인트(예: vLLM/TGI) + `meta-llama/Meta-Llama-3.1-8B-Instruct` (LoRA 포함)
  - 기본 엔드포인트: `http://localhost:8000/v1/chat/completions` (필요 시 `.env`의 `VOICE_ORDER_HF_ENDPOINT`로 덮어쓰기)
- `local_finetune` → FastAPI 프로세스 내에서 GPU로 직접 로드 (transformers+peft)
  - `.env` 예:
    ```
    VOICE_ORDER_MODEL_PRESET=local_finetune
    VOICE_ORDER_LOCAL_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct   # 또는 로컬 베이스 경로
    VOICE_ORDER_LOCAL_ADAPTER=/home/work/wonjun/Mr.Daeback/finetuning/outputs/llama3.1-8b-sft-h100/final
    VOICE_ORDER_LOCAL_MAX_NEW_TOKENS=256
    VOICE_ORDER_LOCAL_TEMPERATURE=0.6
    VOICE_ORDER_LOCAL_TOP_P=0.9
    ```
- 프리셋을 써도 개별 값(모델, 엔드포인트, temperature 등)은 `.env`에서 자유롭게 덮어쓸 수 있습니다.

필요 시 TTS, LLM 모델 교체는 `.env`와 `app/config.py`의 설정을 통해 제어하세요.
