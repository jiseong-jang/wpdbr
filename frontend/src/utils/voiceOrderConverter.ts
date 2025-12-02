import { VoiceOrderSummary, AddCartItemRequest, MenuType, StyleType, DeliveryType, CustomerCoupon } from '../types'

/**
 * 음성인식 주문 결과(OrderSummary)를 AddCartItemRequest로 변환하는 유틸리티
 */

// 메뉴 이름 → MenuType 매핑
const menuNameToTypeMap: Record<string, MenuType> = {
  '발렌타인 디너': MenuType.VALENTINE,
  '프렌치 디너': MenuType.FRENCH,
  '잉글리시 디너': MenuType.ENGLISH,
  '샴페인 축제 디너': MenuType.CHAMPAGNE_FESTIVAL,
}

// 스타일 이름 → StyleType 매핑
const styleNameToTypeMap: Record<string, StyleType> = {
  '심플 스타일': StyleType.SIMPLE,
  '그랜드 스타일': StyleType.GRAND,
  '디럭스 스타일': StyleType.DELUXE,
}

// 구성 음식 한글 이름 → MenuItemCode 매핑
const itemNameToCodeMap: Record<string, string> = {
  '에그 스크램블': 'EGG_SCRAMBLE',
  '베이컨': 'BACON',
  '기본 빵': 'BREAD',
  '빵': 'BREAD',
  '스테이크': 'STEAK',
  '와인(병)': 'WINE_BOTTLE',
  '와인(잔)': 'WINE_GLASS',
  '커피': 'COFFEE',
  '샐러드': 'SALAD',
  '샴페인': 'CHAMPAGNE',
  '바게트빵': 'BAGUETTE',
  '커피 포트': 'COFFEE_POT',
}

/**
 * 메뉴 이름으로 MenuType 찾기
 */
export function getMenuTypeFromName(menuName: string | null | undefined): MenuType | null {
  if (!menuName) return null
  
  const normalizedName = menuName.trim()
  return menuNameToTypeMap[normalizedName] || null
}

/**
 * 스타일 이름으로 StyleType 찾기
 */
export function getStyleTypeFromName(styleName: string | null | undefined): StyleType {
  if (!styleName) return StyleType.SIMPLE // 기본값
  
  const normalizedName = styleName.trim()
  return styleNameToTypeMap[normalizedName] || StyleType.SIMPLE
}

/**
 * 구성 음식 문자열을 파싱하여 customizedQuantities Map으로 변환
 * 예: "에그 스크램블=1, 베이컨=2" → { "EGG_SCRAMBLE": 1, "BACON": 2 }
 */
export function parseMenuItems(menuItemsString: string | null | undefined): Record<string, number> {
  const quantities: Record<string, number> = {}
  
  if (!menuItemsString) return quantities
  
  // 쉼표로 구분된 항목들을 파싱
  const items = menuItemsString.split(',').map(item => item.trim())
  
  for (const item of items) {
    if (!item || !item.includes('=')) continue
    
    const [itemName, quantityStr] = item.split('=').map(s => s.trim())
    if (!itemName || !quantityStr) continue
    
    // "미확인" 등 잘못된 값은 스킵
    if (quantityStr === '미확인' || quantityStr.toLowerCase() === 'null') continue
    
    const quantity = parseInt(quantityStr, 10)
    if (isNaN(quantity) || quantity <= 0) continue
    
    // 한글 이름을 코드로 변환
    const itemCode = itemNameToCodeMap[itemName]
    if (itemCode) {
      quantities[itemCode] = quantity
    }
  }
  
  return quantities
}

/**
 * MenuType으로 메뉴 ID 찾기 (메뉴 목록에서 검색)
 */
export function findMenuIdByType(
  menuType: MenuType,
  menus: Array<{ id: number; type: MenuType }>
): number | null {
  const menu = menus.find(m => m.type === menuType)
  return menu?.id || null
}

/**
 * OrderSummary를 AddCartItemRequest로 변환
 */
export function convertOrderSummaryToCartItemRequest(
  summary: VoiceOrderSummary,
  menus: Array<{ id: number; type: MenuType }>
): AddCartItemRequest | null {
  // 필수 필드 확인
  if (!summary.menuName) {
    console.error('메뉴 이름이 없습니다.')
    return null
  }
  
  // MenuType 찾기
  const menuType = getMenuTypeFromName(summary.menuName)
  if (!menuType) {
    console.error(`알 수 없는 메뉴 이름: ${summary.menuName}`)
    return null
  }
  
  // 메뉴 ID 찾기
  const menuId = findMenuIdByType(menuType, menus)
  if (!menuId) {
    console.error(`메뉴 ID를 찾을 수 없습니다: ${menuType}`)
    return null
  }
  
  // StyleType 찾기
  const styleType = getStyleTypeFromName(summary.menuStyle)
  
  // 구성 음식 파싱
  const customizedQuantities = parseMenuItems(summary.menuItems)
  
  // 수량 처리
  const quantity = summary.quantity && summary.quantity > 0 ? summary.quantity : 1

  return {
    menuId,
    styleType,
    customizedQuantities: Object.keys(customizedQuantities).length > 0 ? customizedQuantities : undefined,
    quantity,
  }
}

/**
 * deliveryTime으로부터 DeliveryType 결정
 */
export function parseDeliveryType(deliveryTime: string | null | undefined): DeliveryType {
  if (!deliveryTime) {
    return DeliveryType.IMMEDIATE
  }

  try {
    const deliveryDate = new Date(deliveryTime)
    const now = new Date()
    
    // 미래 시간이면 예약 주문
    if (deliveryDate > now) {
      return DeliveryType.RESERVATION
    }
  } catch (error) {
    console.error('날짜 파싱 실패:', error)
  }

  return DeliveryType.IMMEDIATE
}

/**
 * 예약 시간 문자열 파싱
 */
export function parseReservationTime(deliveryTime: string | null | undefined): string | undefined {
  if (!deliveryTime) {
    return undefined
  }

  try {
    const date = new Date(deliveryTime)
    if (isNaN(date.getTime())) {
      return undefined
    }

    // ISO 8601 형식으로 변환 (YYYY-MM-DDTHH:mm:ss)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('예약 시간 파싱 실패:', error)
    return undefined
  }
}

/**
 * 쿠폰 코드 또는 이름으로 고객 쿠폰 찾기
 */
export function findCouponByCodeOrName(
  couponCode: string | null | undefined,
  customerCoupons: CustomerCoupon[]
): CustomerCoupon | null {
  if (!couponCode) {
    return null
  }

  const normalizedCode = couponCode.trim().toUpperCase()

  // 사용 가능한 쿠폰만 필터링
  const availableCoupons = customerCoupons.filter(c => !c.isUsed)

  // 정확한 코드 매칭
  let matchedCoupon = availableCoupons.find(
    c => c.coupon.code.toUpperCase() === normalizedCode
  )

  if (matchedCoupon) {
    return matchedCoupon
  }

  // 부분 매칭 (예: "REGULAR10000"에서 "REGULAR" 검색)
  matchedCoupon = availableCoupons.find(
    c => c.coupon.code.toUpperCase().includes(normalizedCode) ||
         normalizedCode.includes(c.coupon.code.toUpperCase())
  )

  if (matchedCoupon) {
    return matchedCoupon
  }

  // 한글 이름 매칭 (예: "단골 쿠폰", "REGULAR10000")
  const koreanNames: Record<string, string> = {
    '단골': 'REGULAR',
    '단골 쿠폰': 'REGULAR',
    '단골고객': 'REGULAR',
    '단골 고객': 'REGULAR',
  }

  const matchedKoreanName = koreanNames[normalizedCode] || koreanNames[couponCode.trim()]
  if (matchedKoreanName) {
    matchedCoupon = availableCoupons.find(
      c => c.coupon.code.toUpperCase().includes(matchedKoreanName)
    )
    if (matchedCoupon) {
      return matchedCoupon
    }
  }

  return null
}

