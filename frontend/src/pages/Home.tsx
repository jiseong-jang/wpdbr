import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Home = () => {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        padding: '3rem',
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '800',
          letterSpacing: '-1px'
        }}>
          미스터 대박 디너에 오신 것을 환영합니다!
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          marginBottom: '3rem',
          color: '#64748b',
          lineHeight: '1.8'
        }}>
          프리미엄 디너 서비스를 경험해보세요
        </p>
        {!isAuthenticated ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/menu" 
              style={{ 
                padding: '1rem 2.5rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '0.5rem',
                fontWeight: '600',
                boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.25s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(102, 126, 234, 0.3)'
              }}
            >
              메뉴 보기
            </Link>
            <Link 
              to="/login" 
              style={{ 
                padding: '1rem 2.5rem', 
                background: 'white',
                color: '#667eea', 
                textDecoration: 'none', 
                borderRadius: '0.5rem',
                fontWeight: '600',
                border: '2px solid #667eea',
                transition: 'all 0.25s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#667eea'
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = '#667eea'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              로그인
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#64748b' }}>
              안녕하세요, <strong style={{ color: '#667eea' }}>{user?.id}</strong>님!
            </p>
            <Link 
              to="/menu" 
              style={{ 
                padding: '1rem 2.5rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '0.5rem',
                fontWeight: '600',
                boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.25s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(102, 126, 234, 0.3)'
              }}
            >
              메뉴 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home

