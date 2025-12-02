import { useEffect, useState } from 'react'
import { deliveryApi } from '../api/delivery'
import { Order, OrderStatus } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const DeliveryDashboard = () => {
  const [readyOrders, setReadyOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReadyOrders()
    fetchMyOrders()
    const interval = setInterval(() => {
      fetchReadyOrders()
      fetchMyOrders()
    }, 5000) // 5초마다 갱신
    return () => clearInterval(interval)
  }, [])

  const fetchReadyOrders = async () => {
    setLoading(true)
    try {
      const response = await deliveryApi.getReadyOrders()
      if (response.success && response.data) {
        setReadyOrders(response.data)
      }
    } catch (err: any) {
      setError(err.message || '주문 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyOrders = async () => {
    try {
      const response = await deliveryApi.getMyOrders()
      if (response.success && response.data) {
        setMyOrders(response.data)
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '내 주문 조회 실패')
    }
  }

  const handlePickup = async (orderId: number) => {
    try {
      await deliveryApi.pickupOrder(orderId)
      await fetchReadyOrders()
      await fetchMyOrders()
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '주문 픽업 실패')
    }
  }

  const handleComplete = async (orderId: number) => {
    try {
      await deliveryApi.completeDelivery(orderId)
      await fetchReadyOrders()
      await fetchMyOrders()
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '배달 완료 실패')
    }
  }

  const getStatusName = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED: return '접수 완료'
      case OrderStatus.COOKING: return '조리 중'
      case OrderStatus.DELIVERING: return '배달 중'
      case OrderStatus.COMPLETED: return '배달 완료'
      case OrderStatus.CANCELLED: return '취소됨'
      case OrderStatus.REJECTED: return '주방 거절'
      default: return status
    }
  }

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
        배달 대시보드
      </h2>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      
      <h3 style={{ marginBottom: '1rem' }}>배달 준비된 주문</h3>
      {loading ? (
        <LoadingSpinner />
      ) : readyOrders.length === 0 ? (
        <p>배달 준비된 주문이 없습니다</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {readyOrders.map((order) => (
            <div key={order.orderId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
              <h4>주문 #{order.orderId}</h4>
              <p>상태: {getStatusName(order.status)}</p>
              <p>가격: {order.finalPrice.toLocaleString()}원</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                {order.status === OrderStatus.DELIVERING && !order.deliveryStaffId && (
                  <button
                    onClick={() => handlePickup(order.orderId)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    주문 픽업
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ margin: '2rem 0 1rem' }}>내 배달 중인 주문</h3>
      {myOrders.length === 0 ? (
        <p>배달 중인 주문이 없습니다</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myOrders.map((order) => (
            <div key={order.orderId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
              <h4>주문 #{order.orderId}</h4>
              <p>상태: {getStatusName(order.status)}</p>
              <p>가격: {order.finalPrice.toLocaleString()}원</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                {order.status === OrderStatus.DELIVERING && order.deliveryStaffId && (
                  <button
                    onClick={() => handleComplete(order.orderId)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    배달 완료
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DeliveryDashboard

