import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header style={{ 
      padding: '1rem 2rem', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link to="/" style={{ 
        color: 'white', 
        textDecoration: 'none', 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        letterSpacing: '-0.5px',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}>
        미스터 대박 디너
      </Link>
      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {!isAuthenticated ? (
          <>
            <Link 
              to="/menu" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              메뉴
            </Link>
            <Link 
              to="/login" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              로그인
            </Link>
            <Link 
              to="/register" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              회원가입
            </Link>
          </>
        ) : (
          <>
            {user?.role === UserRole.CUSTOMER && (
              <>
                <Link 
                  to="/menu" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  메뉴
                </Link>
                <Link 
                  to="/cart" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  장바구니
                </Link>
                <Link 
                  to="/orders" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  주문 내역
                </Link>
                <Link 
                  to="/coupons" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  쿠폰함
                </Link>
                <Link 
                  to="/profile" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  프로필
                </Link>
              </>
            )}
            {user?.role === UserRole.KITCHEN_STAFF && (
              <Link 
                to="/kitchen" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                주방 대시보드
              </Link>
            )}
            {user?.role === UserRole.DELIVERY_STAFF && (
              <Link 
                to="/delivery" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                배달 대시보드
              </Link>
            )}
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              로그아웃
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header

