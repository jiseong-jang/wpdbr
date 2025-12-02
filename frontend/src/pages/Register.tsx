import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { RegisterRequest } from '../types'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    id: '',
    password: '',
    confirmPassword: '',
    address: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardHolderName: '',
    privacyAgreed: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [idCheckMessage, setIdCheckMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'cardNumber') {
      // 카드번호: 숫자만 입력, 4자리마다 하이픈 추가
      const numbers = value.replace(/\D/g, '')
      let formatted = numbers
      if (numbers.length > 4) {
        formatted = numbers.slice(0, 4) + '-' + numbers.slice(4, 8)
      }
      if (numbers.length > 8) {
        formatted = numbers.slice(0, 4) + '-' + numbers.slice(4, 8) + '-' + numbers.slice(8, 12)
      }
      if (numbers.length > 12) {
        formatted = numbers.slice(0, 4) + '-' + numbers.slice(4, 8) + '-' + numbers.slice(8, 12) + '-' + numbers.slice(12, 16)
      }
      setFormData({ ...formData, [name]: formatted })
    } else if (name === 'cardExpiry') {
      // 유효기간: MM/YY 형식
      const numbers = value.replace(/\D/g, '')
      let formatted = numbers
      if (numbers.length >= 2) {
        formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4)
      }
      setFormData({ ...formData, [name]: formatted })
    } else if (name === 'cardCVC') {
      // CVC: 숫자만, 최대 3자리
      const numbers = value.replace(/\D/g, '').slice(0, 3)
      setFormData({ ...formData, [name]: numbers })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const checkIdDuplicate = async () => {
    if (!formData.id) {
      setIdCheckMessage('아이디를 입력해주세요')
      return
    }
    try {
      const response = await authApi.checkId(formData.id)
      setIdCheckMessage(response.message)
    } catch (err: any) {
      setIdCheckMessage(err.message || '아이디 확인 실패')
    }
  }

  const validatePassword = async () => {
    if (formData.password && formData.confirmPassword) {
      try {
        const response = await authApi.validatePassword(formData.password, formData.confirmPassword)
        setError('')
      } catch (err: any) {
        setError(err.message || '비밀번호가 일치하지 않습니다')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.password || formData.password.length < 8) {
      setError('비밀번호는 8자리 이상이어야 합니다')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (!formData.privacyAgreed) {
      setError('개인정보 활용 동의는 필수입니다')
      return
    }

    setLoading(true)
    try {
      const response = await authApi.register(formData)
      if (response.success) {
        navigate('/login')
      } else {
        setError(response.message || '회원가입에 실패했습니다')
      }
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: 'white',
    color: '#1e293b',
    transition: 'all 0.25s ease'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#1e293b'
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#667eea'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '3rem',
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{ 
          marginBottom: '2rem', 
          textAlign: 'center',
          fontSize: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '700'
        }}>
          회원가입
        </h2>
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={labelStyle}>아이디</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
                style={{ ...inputStyle, flex: 1 }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <button 
                type="button" 
                onClick={checkIdDuplicate}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  background: '#64748b',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#475569'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#64748b'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                중복 확인
              </button>
            </div>
            {idCheckMessage && (
              <p style={{ 
                fontSize: '0.875rem', 
                color: idCheckMessage.includes('사용 가능') ? '#10b981' : '#ef4444', 
                marginTop: '0.5rem',
                fontWeight: '500'
              }}>
                {idCheckMessage}
              </p>
            )}
          </div>
          <div>
            <label style={labelStyle}>비밀번호 (8자리 이상)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            {formData.password && formData.password.length < 8 && (
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#ef4444', 
                marginTop: '0.5rem',
                fontWeight: '500'
              }}>
                비밀번호는 8자리 이상이어야 합니다
              </p>
            )}
          </div>
          <div>
            <label style={labelStyle}>비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={validatePassword}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={labelStyle}>주소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={labelStyle}>카드번호</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="1234-5678-9012-3456"
              maxLength={19}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={labelStyle}>유효기간</label>
            <input
              type="text"
              name="cardExpiry"
              value={formData.cardExpiry}
              onChange={handleChange}
              placeholder="MM/YY"
              maxLength={5}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={labelStyle}>CVC</label>
            <input
              type="text"
              name="cardCVC"
              value={formData.cardCVC}
              onChange={handleChange}
              placeholder="123"
              maxLength={3}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={labelStyle}>카드소유자명</label>
            <input
              type="text"
              name="cardHolderName"
              value={formData.cardHolderName}
              onChange={handleChange}
              placeholder="홍길동"
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}>
              <input
                type="checkbox"
                checked={formData.privacyAgreed}
                onChange={(e) => setFormData({ ...formData, privacyAgreed: e.target.checked })}
                style={{ 
                  width: '1.25rem', 
                  height: '1.25rem', 
                  cursor: 'pointer',
                  accentColor: '#667eea'
                }}
              />
              <span style={{ color: '#1e293b' }}>
                개인정보 수집 및 활용에 동의합니다. (필수)
              </span>
            </label>
          </div>
          <button 
            type="submit" 
            disabled={loading || !formData.privacyAgreed}
            style={{ 
              padding: '0.875rem', 
              background: (loading || !formData.privacyAgreed) ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (loading || !formData.privacyAgreed) ? 'not-allowed' : 'pointer',
              boxShadow: (loading || !formData.privacyAgreed) ? 'none' : '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(102, 126, 234, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        {loading && <LoadingSpinner />}
        <p style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          color: '#64748b'
        }}>
          이미 계정이 있으신가요? <a href="/login" style={{ color: '#667eea', fontWeight: '600' }}>로그인</a>
        </p>
      </div>
    </div>
  )
}

export default Register

