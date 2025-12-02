import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMenuStore } from '../store/menuStore'
import { useCartStore } from '../store/cartStore'
import { useOrderStore } from '../store/orderStore'
import { useAuthStore } from '../store/authStore'
import { MenuType, ChatMessage, VoiceOrderSummary, DeliveryType, CustomerCoupon } from '../types'
import { voiceOrderApi } from '../api/voiceOrder'
import { customerApi } from '../api/customer'
import { 
  convertOrderSummaryToCartItemRequest,
  parseDeliveryType,
  parseReservationTime,
  findCouponByCodeOrName
} from '../utils/voiceOrderConverter'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const MenuList = () => {
  const { menus, loading, error, fetchMenus } = useMenuStore()
  const { addItem, clearCart } = useCartStore()
  const { createOrder, applyCoupon } = useOrderStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([])
  const [orderSummary, setOrderSummary] = useState<VoiceOrderSummary | null>(null)
  const [voiceError, setVoiceError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [textInput, setTextInput] = useState('')
  const [availableCoupons, setAvailableCoupons] = useState<CustomerCoupon[]>([])
  const [isServerConnected, setIsServerConnected] = useState<boolean | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // 음성인식 모드 진입 시 쿠폰 목록 조회 및 서버 연결 확인
  useEffect(() => {
    if (isVoiceMode && isAuthenticated) {
      fetchAvailableCoupons()
      checkServerConnection()
    }
  }, [isVoiceMode, isAuthenticated])

  // FastAPI 서버 연결 확인
  const checkServerConnection = async () => {
    try {
      await voiceOrderApi.checkHealth()
      setIsServerConnected(true)
      setVoiceError('')
    } catch (err: any) {
      setIsServerConnected(false)
      setVoiceError('FastAPI 서버에 연결할 수 없습니다. 서버를 실행해주세요.')
    }
  }

  // 음성인식 모드 종료 시 정리
  useEffect(() => {
    if (!isVoiceMode) {
      stopRecording()
      setConversationHistory([])
      setOrderSummary(null)
      setRecognizedText('')
      setVoiceError('')
      setStatusMessage('')
    }
  }, [isVoiceMode])

  // 고객 쿠폰 목록 조회
  const fetchAvailableCoupons = async () => {
    try {
      const response = await customerApi.getCoupons()
      if (response.success && response.data) {
        const unused = response.data.filter(c => !c.isUsed)
        setAvailableCoupons(unused)
      }
    } catch (err: any) {
      console.error('쿠폰 목록 조회 실패:', err)
    }
  }

  const getMenuName = (type: MenuType) => {
    switch (type) {
      case MenuType.VALENTINE:
        return '발렌타인 디너'
      case MenuType.FRENCH:
        return '프렌치 디너'
      case MenuType.ENGLISH:
        return '잉글리시 디너'
      case MenuType.CHAMPAGNE_FESTIVAL:
        return '샴페인 축제 디너'
      default:
        return type
    }
  }

  const getMenuImage = (type: MenuType) => {
    switch (type) {
      case MenuType.VALENTINE:
        return '/menuimage/발렌타인디너.png'
      case MenuType.FRENCH:
        return '/menuimage/프렌치디너.png'
      case MenuType.ENGLISH:
        return '/menuimage/잉글리쉬디너.png'
      case MenuType.CHAMPAGNE_FESTIVAL:
        return '/menuimage/샴페인축제디너.png'
      default:
        return ''
    }
  }

  // 음성 녹음 시작
  const startRecording = async () => {
    if (!isAuthenticated) {
      setVoiceError('로그인이 필요합니다.')
      navigate('/login')
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError('브라우저가 음성 입력을 지원하지 않습니다.')
      return
    }

    try {
      setVoiceError('')
      setStatusMessage('마이크 권한을 요청하는 중...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setIsListening(false)

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          audioChunksRef.current = []
          await transcribeAudio(audioBlob)
        }
      }

      recorder.start()
      setIsListening(true)
      setStatusMessage('음성을 녹음 중입니다...')
    } catch (err: any) {
      console.error('음성 녹음 시작 실패:', err)
      setVoiceError('마이크 접근 권한이 필요합니다.')
      setIsListening(false)
      setStatusMessage('')
    }
  }

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsListening(false)
    setStatusMessage('')
  }

  // 음성을 텍스트로 변환
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setStatusMessage('음성을 텍스트로 변환 중입니다...')
      setIsProcessing(true)
      
      const transcript = await voiceOrderApi.transcribeAudio(audioBlob)
      
      if (transcript) {
        setRecognizedText(prev => prev ? `${prev}\n${transcript}` : transcript)
        await sendMessage(transcript)
      } else {
        setVoiceError('음성을 인식하지 못했습니다.')
        setIsProcessing(false)
        setStatusMessage('')
      }
    } catch (err: any) {
      console.error('음성 인식 실패:', err)
      let errorMessage = '음성 인식 중 오류가 발생했습니다.'
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('CONNECTION_REFUSED') || err.message?.includes('Network Error')) {
        errorMessage = 'FastAPI 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (http://localhost:5001)'
      } else if (err.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      
      setVoiceError(errorMessage)
      setIsProcessing(false)
      setStatusMessage('')
    }
  }

  // LLM으로 메시지 전송
  const sendMessage = async (userText: string) => {
    if (!userText.trim()) return

    try {
      setStatusMessage('응답을 생성하는 중입니다...')
      setIsProcessing(true)
      setVoiceError('')

      // 사용자 메시지를 히스토리에 추가
      const userMessage: ChatMessage = { role: 'user', content: userText }
      const updatedHistory = [...conversationHistory, userMessage]
      setConversationHistory(updatedHistory)

      // LLM에 전송
      const response = await voiceOrderApi.generateChat(updatedHistory)

      // 어시스턴트 응답을 히스토리에 추가
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.message }
      setConversationHistory([...updatedHistory, assistantMessage])

      // 주문 확정 감지
      if (response.orderConfirmed && response.order) {
        setOrderSummary(response.order)
        setStatusMessage('주문이 확정되었습니다. 처리 중...')
        await handleOrderConfirmed(response.order, [...updatedHistory, assistantMessage])
      } else {
        setIsProcessing(false)
        setStatusMessage('')
      }
    } catch (err: any) {
      console.error('메시지 전송 실패:', err)
      let errorMessage = '메시지 전송 중 오류가 발생했습니다.'
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('CONNECTION_REFUSED') || err.message?.includes('Network Error')) {
        errorMessage = 'FastAPI 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (http://localhost:5001)'
      } else if (err.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      
      setVoiceError(errorMessage)
      setIsProcessing(false)
      setStatusMessage('')
    }
  }

  // 주문 확정 처리
  const handleOrderConfirmed = async (summary: VoiceOrderSummary, finalHistory: ChatMessage[]) => {
    try {
      if (!isAuthenticated) {
        setVoiceError('로그인이 필요합니다.')
        navigate('/login')
        return
      }

      // 1. 배달 타입 결정
      const deliveryType = parseDeliveryType(summary.deliveryTime)
      const reservationTime = deliveryType === DeliveryType.RESERVATION 
        ? parseReservationTime(summary.deliveryTime)
        : undefined

      // 2. 쿠폰 정보 처리
      let matchedCoupon: CustomerCoupon | null = null
      if (summary.useCoupon === true && summary.couponCode) {
        // 쿠폰 목록이 아직 로드되지 않았으면 조회
        if (availableCoupons.length === 0) {
          await fetchAvailableCoupons()
        }
        matchedCoupon = findCouponByCodeOrName(summary.couponCode, availableCoupons)
        if (!matchedCoupon) {
          console.warn(`쿠폰을 찾을 수 없습니다: ${summary.couponCode}`)
          // 쿠폰을 찾지 못해도 주문은 진행
        }
      }

      // 3. OrderSummary를 AddCartItemRequest로 변환
      const cartItemRequest = convertOrderSummaryToCartItemRequest(summary, menus)
      
      if (!cartItemRequest) {
        setVoiceError('주문 정보 변환에 실패했습니다.')
        setIsProcessing(false)
        setStatusMessage('')
        return
      }

      setStatusMessage('장바구니에 추가하는 중...')

      // 4. 기존 장바구니 비우기
      try {
        await clearCart()
      } catch (err) {
        console.error('장바구니 초기화 실패:', err)
      }

      // 5. 장바구니에 추가
      await addItem(cartItemRequest)

      setStatusMessage('주문을 생성하는 중...')

      // 6. 주문 생성 (배달 타입, 예약 시간 반영)
      const order = await createOrder({
        deliveryType,
        reservationTime,
      })

      // 7. 쿠폰 적용 (매칭된 쿠폰이 있는 경우)
      if (matchedCoupon) {
        setStatusMessage('쿠폰을 적용하는 중...')
        try {
          await applyCoupon(order.orderId, undefined, matchedCoupon.id)
        } catch (couponError: any) {
          console.error('쿠폰 적용 실패:', couponError)
          // 쿠폰 적용 실패해도 주문은 생성되었으므로 계속 진행
        }
      }

      setStatusMessage('주문이 완료되었습니다!')

      // 8. 주문 내역 페이지로 이동
      setTimeout(() => {
        navigate(`/orders/${order.orderId}`)
      }, 1000)
    } catch (err: any) {
      console.error('주문 처리 실패:', err)
      setVoiceError(err.message || '주문 처리 중 오류가 발생했습니다.')
      setIsProcessing(false)
      setStatusMessage('')
    }
  }

  // 음성 녹음 버튼 클릭 핸들러
  const handleMicClick = () => {
    if (isListening) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // 텍스트 입력 전송 핸들러
  const handleTextSubmit = async () => {
    if (!textInput.trim() || isProcessing || isListening) return

    const text = textInput.trim()
    setTextInput('')
    await sendMessage(text)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '3rem'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '800',
          letterSpacing: '-1px',
          margin: 0
        }}>
          메뉴
        </h2>
        <button
          onClick={() => setIsVoiceMode(!isVoiceMode)}
          style={{
            padding: '0.75rem 1.5rem',
            background: isVoiceMode 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            color: isVoiceMode ? 'white' : '#1e293b',
            border: `2px solid ${isVoiceMode ? '#667eea' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!isVoiceMode) {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.background = '#f8fafc'
            }
          }}
          onMouseLeave={(e) => {
            if (!isVoiceMode) {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
            }
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>🎤</span>
          음성 주문
        </button>
      </div>

      {/* 음성인식 섹션 */}
      {isVoiceMode && (
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          border: '2px solid #e2e8f0',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            음성으로 메뉴 주문하기
          </h3>
          
          {/* 상태 메시지 */}
          {statusMessage && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '0.5rem',
              color: '#667eea',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              {statusMessage}
            </div>
          )}

          {/* 서버 연결 상태 표시 */}
          {isServerConnected === false && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: '#fef3c7',
              borderRadius: '0.75rem',
              border: '2px solid #fbbf24',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <strong style={{ color: '#92400e', fontSize: '1rem' }}>
                  FastAPI 서버가 실행되지 않았습니다
                </strong>
              </div>
              <div style={{ color: '#78350f', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  서버를 실행하려면:
                </p>
                <ol style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.5rem' }}>
                  <li><code style={{ background: '#fef3c7', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>voice-order-fastapi</code> 폴더로 이동</li>
                  <li><code style={{ background: '#fef3c7', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>start.bat</code> 파일 실행 (또는 CMD에서 명령어 실행)</li>
                </ol>
                <p style={{ margin: '0' }}>
                  자세한 내용은 <code style={{ background: '#fef3c7', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>voice-order-fastapi/README.md</code>를 참고하세요.
                </p>
              </div>
              <button
                onClick={checkServerConnection}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1rem',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔄 연결 재확인
              </button>
            </div>
          )}

          {/* 에러 메시지 */}
          {voiceError && isServerConnected !== false && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: '#fee2e2',
              borderRadius: '0.5rem',
              color: '#dc2626',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              {voiceError}
            </div>
          )}
          
          {/* 음성인식 버튼 및 상태 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={handleMicClick}
              disabled={isProcessing}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: isListening
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isListening
                  ? '0 0 0 0 rgba(239, 68, 68, 0.7), 0 0 0 0 rgba(239, 68, 68, 0.7)'
                  : '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                animation: isListening ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                opacity: isProcessing ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isListening && !isProcessing) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isListening) {
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              <span style={{ fontSize: '3rem' }}>{isListening ? '⏹' : '🎤'}</span>
            </button>
            <p style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: isListening ? '#ef4444' : '#64748b',
              margin: 0
            }}>
              {isListening ? '음성 인식 중...' : isProcessing ? '처리 중...' : '마이크를 눌러 주문하세요'}
            </p>
          </div>

          {/* 음성 인식 텍스트 표시 영역 */}
          {recognizedText && (
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '2px solid #e2e8f0',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <p style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.9rem',
                color: '#64748b',
                fontWeight: '600'
              }}>
                🎤 인식된 텍스트:
              </p>
              <p style={{
                margin: 0,
                fontSize: '1rem',
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}>
                {recognizedText}
              </p>
            </div>
          )}

          {/* 텍스트 입력 필드 */}
          <div style={{
            marginBottom: '2rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#64748b'
              }}>
                또는 텍스트로 입력:
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleTextSubmit()
                  }
                }}
                placeholder="예: 발렌타인 디너 1개 주문하고 싶어요"
                disabled={isProcessing || isListening}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  background: (isProcessing || isListening) ? '#f1f5f9' : 'white',
                  color: (isProcessing || isListening) ? '#94a3b8' : '#1e293b',
                  transition: 'all 0.25s ease'
                }}
                onFocus={(e) => {
                  if (!isProcessing && !isListening) {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing || isListening}
              style={{
                padding: '1rem 1.5rem',
                background: (!textInput.trim() || isProcessing || isListening)
                  ? '#cbd5e1'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (!textInput.trim() || isProcessing || isListening) ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap',
                opacity: (!textInput.trim() || isProcessing || isListening) ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (textInput.trim() && !isProcessing && !isListening) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (textInput.trim() && !isProcessing && !isListening) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              전송
            </button>
          </div>

          {/* 대화 히스토리 - 채팅 형식 */}
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '2px solid #e2e8f0',
            maxHeight: '400px',
            overflowY: 'auto',
            minHeight: '200px'
          }}>
            <p style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              color: '#1e293b',
              fontWeight: '700'
            }}>
              💬 대화 내역
            </p>
            {conversationHistory.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '150px',
                color: '#94a3b8',
                fontStyle: 'italic'
              }}>
                대화를 시작하려면 마이크 버튼을 누르거나 아래 텍스트 입력창을 사용해주세요
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: msg.role === 'user' ? '#667eea' : '#10b981'
                      }}>
                        {msg.role === 'user' ? '👤 고객' : '🤖 AI 어시스턴트'}
                      </span>
                    </div>
                    <div style={{
                      maxWidth: '80%',
                      padding: '0.875rem 1rem',
                      borderRadius: msg.role === 'user' 
                        ? '1rem 1rem 0.25rem 1rem' 
                        : '1rem 1rem 1rem 0.25rem',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#f0fdf4',
                      color: msg.role === 'user' ? 'white' : '#1e293b',
                      boxShadow: msg.role === 'user'
                        ? '0 2px 4px rgba(102, 126, 234, 0.2)'
                        : '0 2px 4px rgba(0, 0, 0, 0.1)',
                      wordBreak: 'break-word'
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '1rem',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6'
                      }}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 주문 정보 표시 */}
          {orderSummary && (
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '2px solid #e2e8f0',
            }}>
              <p style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                color: '#1e293b',
                fontWeight: '600'
              }}>
                주문 정보:
              </p>
              <div style={{ color: '#64748b' }}>
                {orderSummary.menuName && <p>메뉴: {orderSummary.menuName}</p>}
                {orderSummary.menuStyle && <p>스타일: {orderSummary.menuStyle}</p>}
                {orderSummary.menuItems && <p>구성 음식: {orderSummary.menuItems}</p>}
              </div>
            </div>
          )}

          {isProcessing && <LoadingSpinner />}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {menus.map((menu) => (
          <Link
            key={menu.id}
            to={`/menu/${menu.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              background: 'white',
              borderRadius: '1rem',
              padding: 0,
              transition: 'all 0.3s ease',
              display: 'block',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <img
              src={getMenuImage(menu.type)}
              alt={getMenuName(menu.type)}
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ 
                marginBottom: '0.75rem', 
                color: '#1e293b',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                {getMenuName(menu.type)}
              </h3>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                {menu.basePrice.toLocaleString()}원
              </p>
              <p style={{ 
                marginTop: '0.5rem', 
                color: '#64748b',
                fontSize: '0.9rem'
              }}>
                {menu.items.length}개의 구성 음식
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default MenuList
