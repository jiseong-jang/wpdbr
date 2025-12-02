import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrderStore } from '../store/orderStore'
import { useCartStore } from '../store/cartStore'
import { DeliveryType, CustomerCoupon } from '../types'
import { customerApi } from '../api/customer'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'

const Order = () => {
  const { cart, fetchCart, resetCart, clearCart } = useCartStore()
  const { createOrder, loading, applyCoupon } = useOrderStore()
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.IMMEDIATE)
  const [reservationTime, setReservationTime] = useState('')
  const [error, setError] = useState('')
  const [selectedCoupon, setSelectedCoupon] = useState<CustomerCoupon | null>(null)
  const [availableCoupons, setAvailableCoupons] = useState<CustomerCoupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
    fetchAvailableCoupons()
    
    // sessionStorage에서 쿠폰 ID를 읽어와서 쿠폰 정보 조회
    const pendingCouponId = sessionStorage.getItem('pendingCustomerCouponId')
    if (pendingCouponId) {
      const couponId = parseInt(pendingCouponId)
      customerApi.getCoupons()
        .then((response) => {
          if (response.success && response.data) {
            const coupon = response.data.find(c => c.id === couponId && !c.isUsed)
            if (coupon) {
              setSelectedCoupon(coupon)
            }
          }
        })
        .catch((e) => {
          console.error('쿠폰 조회 실패:', e)
          sessionStorage.removeItem('pendingCustomerCouponId')
        })
    }
  }, [fetchCart])

  const fetchAvailableCoupons = async () => {
    try {
      setLoadingCoupons(true)
      const response = await customerApi.getCoupons()
      if (response.success && response.data) {
        const unused = response.data.filter(c => !c.isUsed)
        setAvailableCoupons(unused)
      }
    } catch (err: any) {
      console.error('쿠폰 목록 조회 실패:', err)
    } finally {
      setLoadingCoupons(false)
    }
  }

  const calculateFinalPrice = () => {
    if (!cart) return 0
    const totalPrice = cart.totalPrice
    if (selectedCoupon) {
      return Math.max(0, totalPrice - selectedCoupon.coupon.discountAmount)
    }
    return totalPrice
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const order = await createOrder({
        deliveryType,
        reservationTime: deliveryType === DeliveryType.RESERVATION ? reservationTime : undefined,
      })
      
      // 주문이 성공적으로 생성되면 장바구니를 명시적으로 초기화
      try {
        await clearCart()
      } catch (cartError: any) {
        console.error('장바구니 초기화 실패:', cartError)
        // 장바구니 초기화 실패해도 주문은 생성되었으므로 계속 진행
        resetCart() // 최소한 로컬 상태는 초기화
      }
      
      // 쿠폰이 선택되어 있으면 주문 생성 후 즉시 적용
      const pendingCouponId = sessionStorage.getItem('pendingCustomerCouponId')
      if (pendingCouponId) {
        sessionStorage.removeItem('pendingCustomerCouponId')
        try {
          await applyCoupon(order.orderId, undefined, parseInt(pendingCouponId))
        } catch (couponError: any) {
          console.error('쿠폰 적용 실패:', couponError)
          // 쿠폰 적용 실패해도 주문은 생성되었으므로 주문 상세 페이지로 이동
        }
      }
      
      navigate(`/orders/${order.orderId}`)
    } catch (err: any) {
      setError(err.message || '주문 생성 실패')
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '3rem',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ 
            marginBottom: '1rem',
            fontSize: '2rem',
            color: '#1e293b'
          }}>
            장바구니가 비어있습니다
          </h2>
          <button 
            onClick={() => navigate('/menu')} 
            style={{ 
              marginTop: '1.5rem', 
              padding: '1rem 2.5rem', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '0.75rem', 
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.25s ease'
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
          </button>
        </div>
      </div>
    )
  }

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
        주문하기
      </h2>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      
      <div style={{ 
        marginBottom: '2rem', 
        padding: '2rem', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '1rem',
        border: '2px solid #e2e8f0',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ 
          marginBottom: '1rem',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          주문 요약
        </h3>
        <p style={{ 
          marginBottom: '0.75rem',
          color: '#64748b',
          fontSize: '1.1rem'
        }}>
          총 <strong style={{ color: '#1e293b' }}>{cart.items.length}</strong>개의 메뉴
        </p>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <strong style={{ fontSize: '1.25rem', color: '#64748b' }}>상품 금액:</strong>
            <strong style={{ fontSize: '1.25rem', color: '#1e293b' }}>
              {cart.totalPrice.toLocaleString()}원
            </strong>
          </div>
          {selectedCoupon && (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <strong style={{ fontSize: '1.25rem', color: '#0369a1' }}>
                  쿠폰 할인 ({selectedCoupon.coupon.code}):
                </strong>
                <strong style={{ fontSize: '1.25rem', color: '#0369a1' }}>
                  -{selectedCoupon.coupon.discountAmount.toLocaleString()}원
                </strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '2px solid #e2e8f0'
              }}>
                <strong style={{ fontSize: '1.5rem', color: '#1e293b' }}>최종 금액:</strong>
                <strong style={{ 
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '800'
                }}>
                  {calculateFinalPrice().toLocaleString()}원
                </strong>
              </div>
            </>
          )}
          {!selectedCoupon && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <strong style={{ fontSize: '1.5rem', color: '#1e293b' }}>총 금액:</strong>
              <strong style={{ 
                fontSize: '2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '800'
              }}>
                {cart.totalPrice.toLocaleString()}원
              </strong>
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e2e8f0' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.75rem',
            fontWeight: '600',
            color: '#1e293b',
            fontSize: '1.1rem'
          }}>
            보유 쿠폰
          </label>
          {loadingCoupons ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>쿠폰 목록을 불러오는 중...</div>
          ) : availableCoupons.length === 0 ? (
            <div style={{ 
              padding: '1rem', 
              background: '#f8fafc',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              color: '#64748b'
            }}>
              사용 가능한 쿠폰이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
              {availableCoupons.map((customerCoupon) => (
                <div
                  key={customerCoupon.id}
                  onClick={() => setSelectedCoupon(customerCoupon)}
                  style={{
                    padding: '1rem 1.5rem',
                    border: selectedCoupon?.id === customerCoupon.id 
                      ? '2px solid #667eea' 
                      : '2px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    background: selectedCoupon?.id === customerCoupon.id
                      ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCoupon?.id !== customerCoupon.id) {
                      e.currentTarget.style.borderColor = '#667eea'
                      e.currentTarget.style.background = '#f8fafc'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCoupon?.id !== customerCoupon.id) {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = 'white'
                    }
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '1rem' }}>
                      {customerCoupon.coupon.code}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {customerCoupon.coupon.discountAmount.toLocaleString()}원 할인
                    </div>
                  </div>
                  {selectedCoupon?.id === customerCoupon.id && (
                    <div style={{
                      padding: '0.375rem 0.75rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      선택됨
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {selectedCoupon && (
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem', 
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '0.75rem',
              border: '1px solid #bae6fd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ margin: 0, color: '#0369a1', fontWeight: '600', fontSize: '0.95rem' }}>
                  선택된 쿠폰: {selectedCoupon.coupon.code}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#0284c7', fontSize: '0.875rem' }}>
                  할인 금액: {selectedCoupon.coupon.discountAmount.toLocaleString()}원
                </p>
              </div>
              <button
                onClick={() => setSelectedCoupon(null)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: 'white',
                  color: '#ef4444', 
                  border: '1px solid #fca5a5', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2'
                  e.currentTarget.style.borderColor = '#ef4444'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = '#fca5a5'
                }}
              >
                제거
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ 
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem' 
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '1rem',
            fontWeight: '600',
            color: '#1e293b',
            fontSize: '1.1rem'
          }}>
            배달 타입
          </label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              border: `2px solid ${deliveryType === DeliveryType.IMMEDIATE ? '#667eea' : '#e2e8f0'}`,
              borderRadius: '0.75rem',
              background: deliveryType === DeliveryType.IMMEDIATE ? 'rgba(102, 126, 234, 0.1)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              fontWeight: '600',
              flex: 1,
              minWidth: '150px'
            }}>
              <input
                type="radio"
                value={DeliveryType.IMMEDIATE}
                checked={deliveryType === DeliveryType.IMMEDIATE}
                onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              바로 배달
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              border: `2px solid ${deliveryType === DeliveryType.RESERVATION ? '#667eea' : '#e2e8f0'}`,
              borderRadius: '0.75rem',
              background: deliveryType === DeliveryType.RESERVATION ? 'rgba(102, 126, 234, 0.1)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              fontWeight: '600',
              flex: 1,
              minWidth: '150px'
            }}>
              <input
                type="radio"
                value={DeliveryType.RESERVATION}
                checked={deliveryType === DeliveryType.RESERVATION}
                onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              예약 주문
            </label>
          </div>
        </div>

        {deliveryType === DeliveryType.RESERVATION && (
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '1.1rem'
            }}>
              예약 시간
            </label>
            <input
              type="datetime-local"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
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
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '1.25rem',
            background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1.25rem',
            fontWeight: '700',
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
          {loading ? '주문 중...' : '주문하기'}
        </button>
      </form>
      {loading && <LoadingSpinner />}
    </div>
  )
}

export default Order

