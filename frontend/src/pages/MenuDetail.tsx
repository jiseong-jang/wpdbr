import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMenuStore } from '../store/menuStore'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { StyleType, MenuType, Item } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const MenuDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedMenu, loading, error, getMenuById } = useMenuStore()
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [styleType, setStyleType] = useState<StyleType>(StyleType.SIMPLE)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [menuQuantity, setMenuQuantity] = useState(1)
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (id) {
      getMenuById(parseInt(id))
    }
  }, [id, getMenuById])

  useEffect(() => {
    if (selectedMenu) {
      const initial: Record<string, number> = {}
      selectedMenu.items.forEach((item) => {
        initial[item.code] = item.defaultQuantity ?? 1
      })
      setQuantities(initial)
      setMenuQuantity(1)
      if (selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL) {
        setStyleType((prev) =>
          prev === StyleType.GRAND || prev === StyleType.DELUXE ? prev : StyleType.GRAND,
        )
      } else {
        setStyleType(StyleType.SIMPLE)
      }
    }
  }, [selectedMenu])

  const getMenuName = (type: MenuType) => {
    switch (type) {
      case MenuType.VALENTINE:
        return '발렌타인 디너'
      case MenuType.FRENCH:
        return '프렌치 디너'
      case MenuType.ENGLISH:
        return '잉글리시 디너'
      case MenuType.CHAMPAGNE_FESTIVAL:
        return '샴페인 축제 디너'
      default:
        return type
    }
  }

  const calculatePrice = () => {
    if (!selectedMenu) return 0
    
    // 스타일 추가 금액
    let stylePrice = 0
    if (styleType === StyleType.GRAND) stylePrice = 10000
    else if (styleType === StyleType.DELUXE) stylePrice = 20000
    
    let customizationPrice = 0
    selectedMenu.items.forEach(item => {
      const defaultQty = item.defaultQuantity ?? 1
      const currentQty = quantities[item.code] ?? defaultQty
      customizationPrice += (currentQty - defaultQty) * item.unitPrice
    })

    return (selectedMenu.basePrice + stylePrice + customizationPrice) * menuQuantity
  }

  const handleQuantityChange = (item: Item, delta: number) => {
    const defaultQty = item.defaultQuantity ?? 1
    setQuantities(prev => {
      const current = prev[item.code] ?? defaultQty
      const next = Math.max(0, current + delta)
      return { ...prev, [item.code]: next }
    })
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!selectedMenu) return

    // 샴페인 축제 디너는 그랜드/디럭스만 가능
    if (selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL && styleType === StyleType.SIMPLE) {
      setAddError('샴페인 축제 디너는 그랜드 또는 디럭스 스타일만 선택 가능합니다')
      return
    }

    setAdding(true)
    setAddError('')
    try {
      await addItem({
        menuId: selectedMenu.id,
        styleType,
        customizedQuantities: quantities,
        quantity: menuQuantity,
      })
      navigate('/cart')
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setAddError(apiMessage || err.message || '장바구니 추가 실패')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!selectedMenu) return <div>메뉴를 찾을 수 없습니다</div>

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto', minHeight: 'calc(100vh - 200px)' }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          marginBottom: '1rem',
          fontSize: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '800'
        }}>
          {getMenuName(selectedMenu.type)}
        </h2>
        <p style={{ 
          fontSize: '1.25rem', 
          marginBottom: '2rem', 
          color: '#64748b',
          fontWeight: '500'
        }}>
          기본 가격: <span style={{ 
            color: '#667eea',
            fontWeight: '700',
            fontSize: '1.5rem'
          }}>{selectedMenu.basePrice.toLocaleString()}원</span>
        </p>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          스타일 선택
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            border: `2px solid ${styleType === StyleType.SIMPLE ? '#667eea' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            background: styleType === StyleType.SIMPLE ? 'rgba(102, 126, 234, 0.1)' : 'white',
            cursor: selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL ? 'not-allowed' : 'pointer',
            opacity: selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL ? 0.5 : 1,
            transition: 'all 0.25s ease',
            fontWeight: '600'
          }}>
            <input
              type="radio"
              value={StyleType.SIMPLE}
              checked={styleType === StyleType.SIMPLE}
              onChange={(e) => setStyleType(e.target.value as StyleType)}
              disabled={selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            심플 (+0원)
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            border: `2px solid ${styleType === StyleType.GRAND ? '#667eea' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            background: styleType === StyleType.GRAND ? 'rgba(102, 126, 234, 0.1)' : 'white',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            fontWeight: '600'
          }}>
            <input
              type="radio"
              value={StyleType.GRAND}
              checked={styleType === StyleType.GRAND}
              onChange={(e) => setStyleType(e.target.value as StyleType)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            그랜드 (+10,000원)
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            border: `2px solid ${styleType === StyleType.DELUXE ? '#667eea' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            background: styleType === StyleType.DELUXE ? 'rgba(102, 126, 234, 0.1)' : 'white',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            fontWeight: '600'
          }}>
            <input
              type="radio"
              value={StyleType.DELUXE}
              checked={styleType === StyleType.DELUXE}
              onChange={(e) => setStyleType(e.target.value as StyleType)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            디럭스 (+20,000원)
          </label>
        </div>
        {selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL && styleType === StyleType.SIMPLE && (
          <p style={{ 
            color: '#ef4444', 
            fontSize: '0.9rem',
            padding: '0.75rem',
            background: '#fef2f2',
            borderRadius: '0.5rem',
            border: '1px solid #fecaca',
            fontWeight: '500'
          }}>
            샴페인 축제 디너는 그랜드 또는 디럭스 스타일만 선택 가능합니다
          </p>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          구성 음식 수량 조절
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedMenu.items.map((item) => {
            const defaultQty = item.defaultQuantity ?? 1
            const currentQty = quantities[item.code] ?? defaultQty
            return (
              <div 
                key={item.code} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem 1.5rem', 
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div>
                  <strong style={{ 
                    fontSize: '1.1rem', 
                    fontFamily: "'Malgun Gothic', '맑은 고딕', sans-serif",
                    color: '#1e293b',
                    fontWeight: '600'
                  }}>
                    {item.label}
                  </strong>
                  <span style={{ marginLeft: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                    ({item.unitPrice.toLocaleString()}원)
                  </span>
                  {currentQty !== defaultQty && (
                    <span style={{ 
                      marginLeft: '0.75rem', 
                      color: '#667eea', 
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      (기본: {defaultQty}개)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleQuantityChange(item, -1)}
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      cursor: 'pointer', 
                      fontSize: '1.25rem',
                      background: '#f1f5f9',
                      border: '2px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      color: '#1e293b',
                      fontWeight: '600',
                      minWidth: '40px',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e2e8f0'
                      e.currentTarget.style.borderColor = '#cbd5e1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f1f5f9'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                  >
                    -
                  </button>
                  <span style={{ 
                    minWidth: '40px', 
                    textAlign: 'center', 
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1e293b'
                  }}>
                    {currentQty}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item, 1)}
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      cursor: 'pointer', 
                      fontSize: '1.25rem',
                      background: '#f1f5f9',
                      border: '2px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      color: '#1e293b',
                      fontWeight: '600',
                      minWidth: '40px',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e2e8f0'
                      e.currentTarget.style.borderColor = '#cbd5e1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f1f5f9'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          marginBottom: '1rem',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          메뉴 수량
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          padding: '1rem 1.5rem',
          background: 'white',
          border: '2px solid #e2e8f0',
          borderRadius: '0.75rem',
          width: 'fit-content'
        }}>
          <button
            onClick={() => setMenuQuantity(Math.max(1, menuQuantity - 1))}
            style={{ 
              padding: '0.5rem 0.75rem', 
              cursor: 'pointer',
              fontSize: '1.25rem',
              background: '#f1f5f9',
              border: '2px solid #e2e8f0',
              borderRadius: '0.5rem',
              color: '#1e293b',
              fontWeight: '600',
              minWidth: '40px',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0'
              e.currentTarget.style.borderColor = '#cbd5e1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            -
          </button>
          <span style={{ 
            minWidth: '50px', 
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            {menuQuantity}
          </span>
          <button
            onClick={() => setMenuQuantity(menuQuantity + 1)}
            style={{ 
              padding: '0.5rem 0.75rem', 
              cursor: 'pointer',
              fontSize: '1.25rem',
              background: '#f1f5f9',
              border: '2px solid #e2e8f0',
              borderRadius: '0.5rem',
              color: '#1e293b',
              fontWeight: '600',
              minWidth: '40px',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0'
              e.currentTarget.style.borderColor = '#cbd5e1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            +
          </button>
        </div>
      </div>

      <div style={{ 
        marginBottom: '2rem', 
        padding: '2rem', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '1rem',
        border: '2px solid #e2e8f0'
      }}>
        <h3 style={{ 
          marginBottom: '1rem',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#64748b'
        }}>
          예상 가격
        </h3>
        <p style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0
        }}>
          {calculatePrice().toLocaleString()}원
        </p>
      </div>

      {addError && <ErrorMessage message={addError} onClose={() => setAddError('')} />}

      <button
        onClick={handleAddToCart}
        disabled={adding || (selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL && styleType === StyleType.SIMPLE)}
        style={{
          width: '100%',
          padding: '1.25rem',
          background: (adding || (selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL && styleType === StyleType.SIMPLE)) 
            ? '#cbd5e1' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          fontSize: '1.25rem',
          fontWeight: '700',
          cursor: (adding || (selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL && styleType === StyleType.SIMPLE)) ? 'not-allowed' : 'pointer',
          boxShadow: (adding || (selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL && styleType === StyleType.SIMPLE))
            ? 'none'
            : '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={(e) => {
          if (!adding && !(selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL && styleType === StyleType.SIMPLE)) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(102, 126, 234, 0.4)'
          }
        }}
        onMouseLeave={(e) => {
          if (!adding && !(selectedMenu.type === MenuType.CHAMPAGNE_FESTIVAL && styleType === StyleType.SIMPLE)) {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(102, 126, 234, 0.3)'
          }
        }}
      >
        {adding ? '장바구니에 추가 중...' : '장바구니에 추가'}
      </button>
      </div>
    </div>
  )
}

export default MenuDetail

