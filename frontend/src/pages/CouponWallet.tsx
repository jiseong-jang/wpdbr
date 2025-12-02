import { useEffect, useState } from 'react'
import { customerApi } from '../api/customer'
import { CustomerCoupon } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const CouponWallet = () => {
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await customerApi.getCoupons()
      if (response.success && response.data) {
        setCoupons(response.data)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || '쿠폰함 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onClose={() => setError('')} />

  const unusedCoupons = coupons.filter(c => !c.isUsed)
  const usedCoupons = coupons.filter(c => c.isUsed)

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 200px)' }}>
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
        쿠폰함
      </h2>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ 
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          사용 가능한 쿠폰 ({unusedCoupons.length})
        </h3>
        {unusedCoupons.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}>
            사용 가능한 쿠폰이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {unusedCoupons.map((customerCoupon) => (
              <div
                key={customerCoupon.id}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  color: 'white',
                  boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '150px',
                  height: '150px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: '0.875rem',
                    opacity: 0.9,
                    marginBottom: '0.5rem'
                  }}>
                    할인 쿠폰
                  </div>
                  <div style={{ 
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem'
                  }}>
                    {customerCoupon.coupon.discountAmount.toLocaleString()}원
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    opacity: 0.9
                  }}>
                    {customerCoupon.coupon.code}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    opacity: 0.8
                  }}>
                    받은 날짜: {new Date(customerCoupon.receivedAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 style={{ 
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          사용한 쿠폰 ({usedCoupons.length})
        </h3>
        {usedCoupons.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}>
            사용한 쿠폰이 없습니다.
          </div>
        ) : (
          <div style={{ 
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {usedCoupons.map((customerCoupon) => (
                <div
                  key={customerCoupon.id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: 0.6
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                      {customerCoupon.coupon.code}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {customerCoupon.coupon.discountAmount.toLocaleString()}원 할인
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {customerCoupon.usedAt 
                      ? new Date(customerCoupon.usedAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CouponWallet

