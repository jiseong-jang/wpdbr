import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerApi } from '../api/customer'
import { CustomerProfile, UpdateProfileRequest } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const Profile = () => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updateMode, setUpdateMode] = useState(false)
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    currentPassword: '',
    name: '',
    address: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardHolderName: '',
    newPassword: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await customerApi.getProfile()
      if (response.success && response.data) {
        setProfile(response.data)
        setFormData({
          currentPassword: '',
          name: response.data.name,
          address: response.data.address,
          cardNumber: response.data.cardNumber,
          cardExpiry: response.data.cardExpiry,
          cardCVC: response.data.cardCVC,
          cardHolderName: response.data.cardHolderName,
          newPassword: '',
        })
      }
    } catch (err: any) {
      setError(err.message || '프로필 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await customerApi.updateProfile(formData)
      if (response.success && response.data) {
        setProfile(response.data)
        setUpdateMode(false)
        setFormData({ ...formData, currentPassword: '', newPassword: '' })
      }
    } catch (err: any) {
      setError(err.message || '프로필 수정 실패')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 회원 탈퇴하시겠습니까?')) return
    const password = prompt('비밀번호를 입력하세요:')
    if (!password) return

    try {
      await customerApi.deleteAccount(password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '회원 탈퇴 실패')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!profile) return <div>프로필을 불러올 수 없습니다</div>

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '700px', margin: '0 auto', minHeight: 'calc(100vh - 200px)' }}>
      <h2 style={{ 
        marginBottom: '2.5rem',
        fontSize: '2.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: '800',
        letterSpacing: '-1px'
      }}>
        프로필
      </h2>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      
      {!updateMode ? (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ margin: 0 }}><strong>아이디:</strong> {profile.id}</p>
            {profile.isRegularCustomer && (
              <span style={{
                padding: '0.375rem 0.75rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                단골 고객
              </span>
            )}
          </div>
          <p><strong>이름:</strong> {profile.name}</p>
          <p><strong>주소:</strong> {profile.address}</p>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>카드번호:</strong> {profile.cardNumber}</p>
            <p><strong>유효기간:</strong> {profile.cardExpiry}</p>
            <p><strong>CVC:</strong> ***</p>
            <p><strong>카드소유자명:</strong> {profile.cardHolderName}</p>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setUpdateMode(true)}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              수정
            </button>
            <button
              onClick={handleDeleteAccount}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>현재 비밀번호 *</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>주소</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>카드번호</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => {
                const { value } = e.target
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
                setFormData({ ...formData, cardNumber: formatted })
              }}
              placeholder="1234-5678-9012-3456"
              maxLength={19}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>유효기간</label>
            <input
              type="text"
              name="cardExpiry"
              value={formData.cardExpiry}
              onChange={(e) => {
                const { value } = e.target
                const numbers = value.replace(/\D/g, '')
                let formatted = numbers
                if (numbers.length >= 2) {
                  formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4)
                }
                setFormData({ ...formData, cardExpiry: formatted })
              }}
              placeholder="MM/YY"
              maxLength={5}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>CVC</label>
            <input
              type="text"
              name="cardCVC"
              value={formData.cardCVC}
              onChange={(e) => {
                const numbers = e.target.value.replace(/\D/g, '').slice(0, 3)
                setFormData({ ...formData, cardCVC: numbers })
              }}
              placeholder="123"
              maxLength={3}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>카드소유자명</label>
            <input
              type="text"
              name="cardHolderName"
              value={formData.cardHolderName}
              onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
              placeholder="홍길동"
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>새 비밀번호 (선택)</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: 'white',
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{ flex: 1, padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => {
                setUpdateMode(false)
                fetchProfile()
              }}
              style={{ flex: 1, padding: '0.75rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Profile

