import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOrderStore } from '../store/orderStore'
import { useCartStore } from '../store/cartStore'
import { OrderStatus, Order, AddCartItemRequest } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

type FilterType = 'all' | 'reservation' | 'immediate'

const Orders = () => {
  const { orders, reservationOrders, loading, error, fetchOrders, fetchReservationOrders } = useOrderStore()
  const { addItem } = useCartStore()
  const [filter, setFilter] = useState<FilterType>('all')
  const [reordering, setReordering] = useState<number | null>(null)
  const [reorderError, setReorderError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
    fetchReservationOrders()
  }, [fetchOrders, fetchReservationOrders])

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

  const getDisplayOrders = (): Order[] => {
    if (filter === 'reservation') {
      return reservationOrders
    } else if (filter === 'immediate') {
      return orders.filter(order => !order.reservationTime)
    } else {
      return orders
    }
  }

  const displayOrders = getDisplayOrders()

  const handleReorder = async (order: Order, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setReorderError('')
    setReordering(order.orderId)
    
    try {
      // 주문의 모든 아이템을 순차적으로 장바구니에 추가
      for (const item of order.orderItems) {
        const cartItemRequest: AddCartItemRequest = {
          menuId: item.menu.id,
          styleType: item.styleType,
          customizedQuantities: item.customizedQuantities,
          quantity: item.quantity,
        }
        await addItem(cartItemRequest)
      }
      
      // 성공 시 장바구니 페이지로 이동
      navigate('/cart')
    } catch (err: any) {
      setReorderError(err.message || '재주문에 실패했습니다')
      setReordering(null)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return { background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', color: 'white' }
      case OrderStatus.COOKING:
        return { background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: 'white' }
      case OrderStatus.DELIVERING:
        return { background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', color: 'white' }
      case OrderStatus.COMPLETED:
        return { background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white' }
      case OrderStatus.CANCELLED:
        return { background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', color: 'white' }
      case OrderStatus.REJECTED:
        return { background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', color: 'white' }
      default:
        return { background: '#e2e8f0', color: '#1e293b' }
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
        주문 내역
      </h2>
      
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.875rem 1.75rem',
            background: filter === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: filter === 'all' ? 'white' : '#1e293b',
            border: `2px solid ${filter === 'all' ? 'transparent' : '#e2e8f0'}`,
            cursor: 'pointer',
            borderRadius: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.25s ease',
            boxShadow: filter === 'all' ? '0 4px 6px -1px rgba(102, 126, 234, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.background = 'white'
            }
          }}
        >
          전체 주문
        </button>
        <button
          onClick={() => setFilter('reservation')}
          style={{
            padding: '0.875rem 1.75rem',
            background: filter === 'reservation' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: filter === 'reservation' ? 'white' : '#1e293b',
            border: `2px solid ${filter === 'reservation' ? 'transparent' : '#e2e8f0'}`,
            cursor: 'pointer',
            borderRadius: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.25s ease',
            boxShadow: filter === 'reservation' ? '0 4px 6px -1px rgba(102, 126, 234, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (filter !== 'reservation') {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'reservation') {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.background = 'white'
            }
          }}
        >
          예약 주문
        </button>
        <button
          onClick={() => setFilter('immediate')}
          style={{
            padding: '0.875rem 1.75rem',
            background: filter === 'immediate' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: filter === 'immediate' ? 'white' : '#1e293b',
            border: `2px solid ${filter === 'immediate' ? 'transparent' : '#e2e8f0'}`,
            cursor: 'pointer',
            borderRadius: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.25s ease',
            boxShadow: filter === 'immediate' ? '0 4px 6px -1px rgba(102, 126, 234, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (filter !== 'immediate') {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'immediate') {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.background = 'white'
            }
          }}
        >
          일반 주문
        </button>
      </div>

      {displayOrders.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <p style={{ fontSize: '1.25rem', color: '#64748b' }}>주문 내역이 없습니다</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {displayOrders.map((order) => {
            const badgeStyle = getStatusBadgeStyle(order.status)
            return (
              <Link
                key={order.orderId}
                to={`/orders/${order.orderId}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  display: 'block',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 style={{ 
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}>
                        주문 #{order.orderId}
                      </h3>
                      {order.reservationTime && (
                        <span style={{ 
                          background: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)',
                          color: '#000', 
                          padding: '0.375rem 0.75rem', 
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          예약 주문
                        </span>
                      )}
                      <span style={{ 
                        ...badgeStyle,
                        padding: '0.375rem 0.75rem', 
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {getStatusName(order.status)}
                      </span>
                    </div>
                    <p style={{ 
                      marginBottom: '0.5rem',
                      color: '#64748b',
                      fontSize: '0.95rem'
                    }}>
                      주문일: {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.reservationTime && (
                      <p style={{ 
                        color: '#667eea', 
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        예약 시간: {new Date(order.reservationTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <p style={{ 
                      fontSize: '2rem', 
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      margin: 0
                    }}>
                      {order.finalPrice.toLocaleString()}원
                    </p>
                    <button
                      onClick={(e) => handleReorder(order, e)}
                      disabled={reordering === order.orderId}
                      style={{
                        padding: '0.625rem 1.25rem',
                        background: reordering === order.orderId 
                          ? '#cbd5e1' 
                          : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: reordering === order.orderId ? 'not-allowed' : 'pointer',
                        boxShadow: reordering === order.orderId 
                          ? 'none' 
                          : '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.25s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (reordering !== order.orderId) {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (reordering !== order.orderId) {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                        }
                      }}
                    >
                      {reordering === order.orderId ? '재주문 중...' : '재주문'}
                    </button>
                  </div>
                </div>
                {reorderError && reordering === order.orderId && (
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    {reorderError}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Orders

