"use strict";

const DEFAULT_ORDER_TOKEN = "<<CONFIRM_ORDER>>";

const state = {
  messages: [],
  loading: false,
  orderSaving: false,
  systemPrompt: null,
  customerName: "김민수",
  language: "ko-KR",
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  uiText: {},
  orderToken: DEFAULT_ORDER_TOKEN,
  isConfirmed: false,
  isConversationLocked: false,
};

const conversationEl = document.getElementById("conversation");
const statusEl = document.getElementById("status");
const inputEl = document.getElementById("user-input");
const formEl = document.getElementById("chat-form");
const micButton = document.getElementById("mic-button");
const sendButton = document.getElementById("send-button");
const pipelineLabelEl = document.getElementById("pipeline-label");
const modelInfoEl = document.getElementById("model-info");
const topModelInfoEl = document.getElementById("top-model-info");

function serializeMessages() {
  return state.messages.map(({ role, content }) => ({ role, content }));
}

function getOrderConfirmedDisplay() {
  const text = state.uiText || {};
  return text.orderConfirmedShort || text.statusConfirmed || "주문이 완료되었습니다.";
}

function sanitizeAssistantReply(text) {
  if (!text) return "";
  const token = state.orderToken || DEFAULT_ORDER_TOKEN;
  if (!token) return text;
  const containsToken = text.includes(token);
  let cleaned = text.split(token).join("");
  if (containsToken) {
    cleaned = cleaned.replace(/[\(\[\{]\s*[\)\]\}]/g, "");
  }
  cleaned = cleaned.trim();
  if (!containsToken) {
    return cleaned;
  }
  return cleaned || getOrderConfirmedDisplay();
}

function renderMessages() {
  conversationEl.innerHTML = "";
  state.messages.forEach((msg) => {
    if (msg.internal) {
      return;
    }
    const div = document.createElement("div");
    const roleClass = msg.role === "user" ? "user" : msg.role === "assistant" ? "assistant" : "system";
    div.className = `message ${roleClass}`;
    div.textContent = msg.content;
    conversationEl.appendChild(div);
  });
  conversationEl.scrollTop = conversationEl.scrollHeight;
}

function setStatus(text) {
  statusEl.textContent = text || "";
}

function speakText(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.language || "ko-KR";
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

function updateControls() {
  const text = state.uiText || {};
  let placeholder = text.placeholderIdle || "";

  if (state.isConversationLocked || state.isConfirmed) {
    placeholder = text.placeholderConfirmed || text.statusConfirmed || "주문이 완료되었습니다.";
  } else if (state.isRecording) {
    placeholder = text.placeholderListening || placeholder;
  } else if (state.orderSaving) {
    placeholder = text.statusSaving || placeholder;
  } else if (state.loading) {
    placeholder = text.placeholderInit || text.statusProcessing || placeholder;
  }

  inputEl.placeholder = placeholder;

  const inputsDisabled = state.loading || state.orderSaving || state.isConversationLocked || state.isConfirmed;
  inputEl.disabled = inputsDisabled;
  sendButton.disabled = inputsDisabled;
  const disableMic = inputsDisabled || (state.loading && !state.isRecording);
  micButton.disabled = disableMic;
}

function applyUiText() {
  const text = state.uiText || {};
  pipelineLabelEl.textContent = text.pipelineLabel || "";
  if (!state.loading && !state.orderSaving && !state.isRecording && !state.isConfirmed && !state.isConversationLocked) {
    setStatus(text.idleStatus || "");
  } else if (state.isConversationLocked || state.isConfirmed) {
    setStatus(text.statusConfirmed || "주문이 완료되었습니다.");
  }
  document.title = text.title || "Voice Order FastAPI Demo";
  updateControls();
}

async function fetchUiText(lang) {
  const res = await fetch(`/config/ui-text?lang=${encodeURIComponent(lang)}`);
  if (!res.ok) {
    throw new Error("UI 텍스트 로드 실패");
  }
  const data = await res.json();
  state.uiText = data.messages || {};
  applyUiText();
}

async function fetchLanguageInstruction(lang) {
  const res = await fetch(`/config/language-instruction?lang=${encodeURIComponent(lang)}`);
  if (!res.ok) return "";
  const data = await res.json();
  return data.instruction || "";
}

async function fetchModelInfo() {
  try {
    const res = await fetch("/config/model-info");
    if (!res.ok) return;
    const data = await res.json();
    // Build a compact display string
    const preset = data.preset || "-";
    const provider = data.provider || "-";
    const hfEndpoint = (data.hf && data.hf.endpoint) || "";
    const hfModel = (data.hf && data.hf.model) || "";
    const shortEndpoint = hfEndpoint.replace(/^https?:\/\//, "");
    const label = `preset=${preset} | provider=${provider} | hf=${hfModel} @ ${shortEndpoint}`;
    if (modelInfoEl) modelInfoEl.textContent = label;
    if (topModelInfoEl) topModelInfoEl.textContent = label;
  } catch (err) {
    console.warn("model-info load failed", err);
  }
}

async function initialize() {
  try {
    setStatus("시스템 프롬프트를 불러오고 있습니다...");
    await fetchUiText("ko-KR");
    const [promptRes, langRes, greetingRes, tokenRes, _modelInfo] = await Promise.all([
      fetch("/config/system-prompt").then((r) => r.json()),
      fetch("/config/initial-language").then((r) => r.json()),
      fetch(`/config/greeting?lang=ko-KR&name=${encodeURIComponent(state.customerName)}`).then((r) => r.json()),
      fetch("/config/order-token")
        .then((r) => (r.ok ? r.json() : { token: DEFAULT_ORDER_TOKEN }))
        .catch(() => ({ token: DEFAULT_ORDER_TOKEN })),
      fetchModelInfo(),
    ]);

    state.systemPrompt = promptRes.prompt;
    state.language = langRes.language || "ko-KR";
    state.orderToken = tokenRes.token || DEFAULT_ORDER_TOKEN;

    const greeting = greetingRes.greeting || "안녕하세요!";
    state.messages = [
      { role: "system", content: state.systemPrompt, internal: true },
      { role: "assistant", content: greeting },
    ];
    renderMessages();
    speakText(greeting);
    updateControls();
    inputEl.focus();
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("초기화 중 오류가 발생했습니다. 콘솔을 확인하세요.");
  }
}

async function detectLanguage(text) {
  const response = await fetch("/utils/detect-language", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error("언어 감지 실패");
  }
  const data = await response.json();
  return data.language || "ko-KR";
}

async function sendMessage(userText) {
  if (state.isConversationLocked || state.orderSaving || state.isConfirmed) {
    setStatus(state.uiText.statusConfirmed || "주문이 완료되었습니다.");
    return;
  }

  state.loading = true;
  updateControls();
  setStatus(state.uiText.statusProcessing || "응답을 생성하는 중입니다...");

  try {
    const detectedLanguage = await detectLanguage(userText);
    if (detectedLanguage !== state.language) {
      state.language = detectedLanguage;
      const instruction = await fetchLanguageInstruction(detectedLanguage);
      if (instruction) {
        state.messages.push({ role: "system", content: instruction, internal: true });
      }
      await fetchUiText(detectedLanguage);
    }

    state.messages.push({ role: "user", content: userText });
    renderMessages();

    const response = await fetch("/api/llm/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: serializeMessages() }),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.statusText}`);
    }

    const data = await response.json();
    const rawReply = data.message || "";
    const sanitizedReply = sanitizeAssistantReply(rawReply);
    const orderConfirmed = data.orderConfirmed || false;
    const orderId = data.orderId || "";

    state.messages.push({ role: "assistant", content: sanitizedReply });
    renderMessages();
    speakText(sanitizedReply);

    if (orderConfirmed) {
      state.isConfirmed = true;
      state.isConversationLocked = true;
      updateControls();

      // Display order confirmation with order ID
      const confirmMessage = orderId
        ? `주문이 완료되었습니다. 주문번호: ${orderId}`
        : getOrderConfirmedDisplay();
      state.messages.push({ role: "system", content: confirmMessage });
      renderMessages();

      setStatus(state.uiText.statusConfirmed || confirmMessage);
      inputEl.blur();
    } else {
      setStatus(state.uiText.idleStatus || "응답이 완료되었습니다.");
    }
  } catch (err) {
    console.error(err);
    setStatus("메시지를 전송하는 동안 오류가 발생했습니다.");
  } finally {
    state.loading = false;
    updateControls();
  }
}

async function submitCurrentInput() {
  const text = inputEl.value.trim();
  if (!text || state.loading || state.orderSaving || state.isConversationLocked || state.isConfirmed) {
    inputEl.value = "";
    updateControls();
    return;
  }
  inputEl.value = "";
  updateControls();
  await sendMessage(text);
  if (!state.isConversationLocked && !state.isConfirmed) {
    inputEl.focus();
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitCurrentInput();
});

async function stopRecording() {
  if (!state.mediaRecorder) return;
  state.mediaRecorder.stop();
}

async function startRecording() {
  if (state.loading || state.orderSaving || state.isConversationLocked || state.isConfirmed) {
    setStatus(state.uiText.statusConfirmed || "주문이 완료되었습니다.");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus("브라우저가 음성 입력을 지원하지 않습니다.");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    state.mediaRecorder = recorder;
    state.audioChunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        state.audioChunks.push(event.data);
      }
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      state.mediaRecorder = null;
      state.isRecording = false;
      micButton.textContent = "🎤";
      updateControls();
      if (!state.audioChunks.length) {
        setStatus(state.uiText.idleStatus || "");
        return;
      }
      const audioBlob = new Blob(state.audioChunks, { type: "audio/webm" });
      state.audioChunks = [];
      await transcribeAudio(audioBlob);
    };
    recorder.start();
    state.isRecording = true;
    micButton.textContent = "⏹";
    setStatus(state.uiText.placeholderListening || "음성을 녹음 중입니다...");
    updateControls();
  } catch (err) {
    console.error(err);
    setStatus("마이크 접근 권한이 필요합니다.");
    state.isRecording = false;
    state.mediaRecorder = null;
    micButton.textContent = "🎤";
    updateControls();
  }
}

async function transcribeAudio(audioBlob) {
  try {
    setStatus(state.uiText.statusProcessing || "음성을 텍스트로 변환 중입니다...");
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    const response = await fetch("/api/stt/transcribe", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`STT API 오류: ${response.statusText}`);
    }
    const data = await response.json();
    const transcript = data.transcript || data.text || "";
    if (transcript) {
      if (!state.orderSaving && !state.isConversationLocked && !state.isConfirmed) {
        await sendMessage(transcript);
      }
    } else {
      setStatus("음성을 인식하지 못했습니다.");
    }
  } catch (err) {
    console.error(err);
    setStatus("음성 인식 중 오류가 발생했습니다.");
  } finally {
    state.isRecording = false;
    micButton.textContent = "🎤";
    updateControls();
  }
}

micButton.addEventListener("click", async () => {
  if (state.loading || state.orderSaving || state.isConversationLocked || state.isConfirmed) {
    setStatus(state.uiText.statusConfirmed || "주문이 완료되었습니다.");
    return;
  }
  if (state.isRecording) {
    await stopRecording();
  } else {
    await startRecording();
  }
});

inputEl.addEventListener("input", updateControls);
function isPlainEnter(event) {
  if (!event) return false;
  if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }
  const key = event.key || "";
  const code = event.code || "";
  const keyCode = typeof event.keyCode === "number" ? event.keyCode : null;
  return (
    key === "Enter" ||
    key === "Return" ||
    code === "Enter" ||
    code === "NumpadEnter" ||
    keyCode === 13
  );
}

inputEl.addEventListener("keydown", (event) => {
  if (!isPlainEnter(event)) return;
  event.preventDefault();
  submitCurrentInput().catch((err) => console.error(err));
});

initialize();
