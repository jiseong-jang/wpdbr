import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { UserRole, LoginRequest } from '../types'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  // 아이디 입력 시 역할 자동 감지
  const handleIdChange = (value: string) => {
    setId(value)
    if (value.startsWith('kitchen')) {
      setRole(UserRole.KITCHEN_STAFF)
    } else if (value.startsWith('delivery')) {
      setRole(UserRole.DELIVERY_STAFF)
    } else if (value && role !== UserRole.CUSTOMER) {
      // 일반 사용자 아이디인 경우에만 CUSTOMER로 변경
      // (직원 아이디가 아닌 경우)
      const isStaffId = value.startsWith('kitchen') || value.startsWith('delivery')
      if (!isStaffId) {
        setRole(UserRole.CUSTOMER)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loginData: LoginRequest = { id, password, role }
      await login(loginData)
      
      // 역할에 따라 리다이렉트
      if (role === UserRole.CUSTOMER) {
        navigate('/menu')
      } else if (role === UserRole.KITCHEN_STAFF) {
        navigate('/kitchen')
      } else if (role === UserRole.DELIVERY_STAFF) {
        navigate('/delivery')
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다')
    } finally {
      setLoading(false)
    }
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
        maxWidth: '450px',
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
          로그인
        </h2>
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              역할
            </label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#1e293b',
                transition: 'all 0.25s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value={UserRole.CUSTOMER}>고객</option>
              <option value={UserRole.KITCHEN_STAFF}>주방 직원</option>
              <option value={UserRole.DELIVERY_STAFF}>배달 직원</option>
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              아이디
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => handleIdChange(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#1e293b',
                transition: 'all 0.25s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
                color: '#1e293b',
                transition: 'all 0.25s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.875rem', 
              background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
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
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        {loading && <LoadingSpinner />}
        <p style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          color: '#64748b'
        }}>
          계정이 없으신가요? <a href="/register" style={{ color: '#667eea', fontWeight: '600' }}>회원가입</a>
        </p>
      </div>
    </div>
  )
}

export default Login

