import { useEffect, useState } from 'react'
import { kitchenApi } from '../api/kitchen'
import { Order, Inventory, OrderStatus } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const KitchenDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [reservationOrders, setReservationOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders')

  useEffect(() => {
    fetchPendingOrders()
    fetchReservationOrders()
    fetchMyOrders()
    fetchInventory()
  }, [])

  const fetchPendingOrders = async () => {
    setLoading(true)
    try {
      const response = await kitchenApi.getPendingOrders()
      if (response.success && response.data) {
        setPendingOrders(response.data)
      }
    } catch (err: any) {
      setError(err.message || '주문 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  const fetchReservationOrders = async () => {
    try {
      const response = await kitchenApi.getReservationOrders()
      if (response.success && response.data) {
        setReservationOrders(response.data)
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '예약 주문 조회 실패')
    }
  }

  const fetchMyOrders = async () => {
    try {
      const response = await kitchenApi.getMyOrders()
      if (response.success && response.data) {
        setMyOrders(response.data)
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '내 주문 조회 실패')
    }
  }

  const fetchInventory = async () => {
    try {
      const response = await kitchenApi.getInventory()
      if (response.success && response.data) {
        setInventory(response.data)
      }
    } catch (err: any) {
      setError(err.message || '재고 조회 실패')
    }
  }

  const handleReceiveOrder = async (orderId: number) => {
    try {
      await kitchenApi.receiveOrder(orderId)
      await fetchPendingOrders()
      await fetchReservationOrders()
      await fetchMyOrders()
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '주문 수령 실패')
    }
  }

  const handleRejectOrder = async (orderId: number) => {
    try {
      await kitchenApi.rejectOrder(orderId)
      await fetchPendingOrders()
      await fetchReservationOrders()
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '주문 거절 실패')
    }
  }

  const handleStartCooking = async (orderId: number) => {
    try {
      await kitchenApi.startCooking(orderId)
      await fetchPendingOrders()
      await fetchMyOrders()
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '조리 시작 실패')
    }
  }

  const handleCompleteCooking = async (orderId: number) => {
    try {
      await kitchenApi.completeCooking(orderId)
      await fetchPendingOrders()
      await fetchMyOrders()
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(apiMessage || err.message || '조리 완료 실패')
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

  const getItemLabel = (code: string): string => {
    const labelMap: Record<string, string> = {
      'STEAK': '스테이크',
      'WINE_BOTTLE': '와인(병)',
      'CHAMPAGNE': '샴페인',
      'WINE_GLASS': '와인(잔)',
      'COFFEE': '커피',
      'SALAD': '샐러드',
      'EGG_SCRAMBLE': '에그 스크램블',
      'BACON': '베이컨',
      'BREAD': '빵',
      'BAGUETTE': '바게트빵',
      'COFFEE_POT': '커피 포트'
    }
    return labelMap[code] || code
  }

  const renderOrderItems = (order: Order) => {
    return (
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>주문 메뉴:</div>
        {order.orderItems.map((item) => (
          <div key={item.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#1e293b' }}>
                {item.menu.type === 'VALENTINE' ? '발렌타인 디너' :
                 item.menu.type === 'FRENCH' ? '프렌치 디너' :
                 item.menu.type === 'ENGLISH' ? '잉글리시 디너' :
                 item.menu.type === 'CHAMPAGNE_FESTIVAL' ? '샴페인 축제 디너' : item.menu.type}
              </strong>
              <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                - {item.styleType} x{item.quantity}
              </span>
            </div>
            {item.customizedQuantities && Object.keys(item.customizedQuantities).length > 0 && (
              <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>
                  구성 음식:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {Object.entries(item.customizedQuantities)
                    .filter(([, qty]) => qty > 0)
                    .map(([code, qty]) => (
                      <div key={code} style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        • {getItemLabel(code)}: {qty}개
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 200px)' }}>
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
        주방 대시보드
      </h2>
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.875rem 1.75rem',
            background: activeTab === 'orders' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: activeTab === 'orders' ? 'white' : '#1e293b',
            border: `2px solid ${activeTab === 'orders' ? 'transparent' : '#e2e8f0'}`,
            cursor: 'pointer',
            borderRadius: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.25s ease',
            boxShadow: activeTab === 'orders' ? '0 4px 6px -1px rgba(102, 126, 234, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'orders') {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'orders') {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.background = 'white'
            }
          }}
        >
          주문 관리
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '0.875rem 1.75rem',
            background: activeTab === 'inventory' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: activeTab === 'inventory' ? 'white' : '#1e293b',
            border: `2px solid ${activeTab === 'inventory' ? 'transparent' : '#e2e8f0'}`,
            cursor: 'pointer',
            borderRadius: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.25s ease',
            boxShadow: activeTab === 'inventory' ? '0 4px 6px -1px rgba(102, 126, 234, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'inventory') {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'inventory') {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.background = 'white'
            }
          }}
        >
          재고 관리
        </button>
      </div>

      {activeTab === 'orders' && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>대기 중인 주문</h3>
          {loading ? (
            <LoadingSpinner />
          ) : pendingOrders.length === 0 ? (
            <p>대기 중인 주문이 없습니다</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingOrders.map((order) => (
                <div key={order.orderId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
                  <h4>주문 #{order.orderId}</h4>
                  <p>상태: {getStatusName(order.status)}</p>
                  <p>가격: {order.finalPrice.toLocaleString()}원</p>
                  {renderOrderItems(order)}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {order.status === OrderStatus.RECEIVED && (
                      <>
                        <button
                          onClick={() => handleReceiveOrder(order.orderId)}
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          주문 수령
                        </button>
                        <button
                          onClick={() => handleRejectOrder(order.orderId)}
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          주문 거절
                        </button>
                      </>
                    )}
                    {order.status === OrderStatus.COOKING && (
                      <>
                        <button
                          onClick={() => handleStartCooking(order.orderId)}
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          조리 시작
                        </button>
                        <button
                          onClick={() => handleCompleteCooking(order.orderId)}
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          조리 완료
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ margin: '2rem 0 1rem' }}>예약 주문</h3>
          {reservationOrders.length === 0 ? (
            <p>예약 주문이 없습니다</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reservationOrders.map((order) => {
                const reservationTime = order.reservationTime ? new Date(order.reservationTime) : null
                const now = new Date()
                const oneHourBefore = reservationTime ? new Date(reservationTime.getTime() - 60 * 60 * 1000) : null
                const canCook = reservationTime && now >= oneHourBefore && now <= reservationTime
                
                return (
                  <div key={order.orderId} style={{ border: '1px solid #ffc107', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fffbf0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0 }}>주문 #{order.orderId}</h4>
                      <span style={{ 
                        backgroundColor: '#ffc107', 
                        color: '#000', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        예약 주문
                      </span>
                      {canCook && (
                        <span style={{ 
                          backgroundColor: '#28a745', 
                          color: 'white', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          조리 가능
                        </span>
                      )}
                      {!canCook && reservationTime && now < oneHourBefore && (
                        <span style={{ 
                          backgroundColor: '#6c757d', 
                          color: 'white', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          대기 중
                        </span>
                      )}
                    </div>
                    <p>상태: {getStatusName(order.status)}</p>
                    <p>가격: {order.finalPrice.toLocaleString()}원</p>
                    {renderOrderItems(order)}
                    {reservationTime && (
                      <p style={{ color: '#007bff', fontWeight: 'bold' }}>
                        예약 시간: {reservationTime.toLocaleString()}
                      </p>
                    )}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      {order.status === OrderStatus.RECEIVED && (
                        <>
                          <button
                            onClick={() => handleReceiveOrder(order.orderId)}
                            disabled={!canCook}
                            style={{ 
                              padding: '0.5rem 1rem', 
                              backgroundColor: canCook ? '#007bff' : '#6c757d', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: canCook ? 'pointer' : 'not-allowed',
                              opacity: canCook ? 1 : 0.6
                            }}
                          >
                            주문 수령
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.orderId)}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            주문 거절
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <h3 style={{ margin: '2rem 0 1rem' }}>내 조리 중인 주문</h3>
          {myOrders.length === 0 ? (
            <p>조리 중인 주문이 없습니다</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myOrders.map((order) => (
                <div key={order.orderId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
                  <h4>주문 #{order.orderId}</h4>
                  <p>상태: {getStatusName(order.status)}</p>
                  <p>가격: {order.finalPrice.toLocaleString()}원</p>
                  {renderOrderItems(order)}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {order.status === OrderStatus.COOKING && (
                      <button
                        onClick={() => handleCompleteCooking(order.orderId)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        조리 완료
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>재고 현황</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>재료</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>수량</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>마지막 보충일</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.itemCode}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{item.label}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={async () => {
                          try {
                            await kitchenApi.updateStock(item.itemCode, 1, 'add')
                            fetchInventory()
                          } catch (err: any) {
                            const apiMessage = err?.response?.data?.message
                            setError(apiMessage || err.message || '재고 수정 실패')
                          }
                        }}
                        style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                      >
                        +1
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await kitchenApi.updateStock(item.itemCode, 10, 'add')
                            fetchInventory()
                          } catch (err: any) {
                            const apiMessage = err?.response?.data?.message
                            setError(apiMessage || err.message || '재고 수정 실패')
                          }
                        }}
                        style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                      >
                        +10
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await kitchenApi.updateStock(item.itemCode, 1, 'reduce')
                            fetchInventory()
                          } catch (err: any) {
                            const apiMessage = err?.response?.data?.message
                            setError(apiMessage || err.message || '재고 수정 실패')
                          }
                        }}
                        style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                      >
                        -1
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await kitchenApi.updateStock(item.itemCode, 10, 'reduce')
                            fetchInventory()
                          } catch (err: any) {
                            const apiMessage = err?.response?.data?.message
                            setError(apiMessage || err.message || '재고 수정 실패')
                          }
                        }}
                        style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                      >
                        -10
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

export default KitchenDashboard

