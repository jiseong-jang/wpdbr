export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  KITCHEN_STAFF = 'KITCHEN_STAFF',
  DELIVERY_STAFF = 'DELIVERY_STAFF',
}

export enum MenuType {
  VALENTINE = 'VALENTINE',
  FRENCH = 'FRENCH',
  ENGLISH = 'ENGLISH',
  CHAMPAGNE_FESTIVAL = 'CHAMPAGNE_FESTIVAL',
}

export enum StyleType {
  SIMPLE = 'SIMPLE',
  GRAND = 'GRAND',
  DELUXE = 'DELUXE',
}

export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  COOKING = 'COOKING',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum DeliveryType {
  IMMEDIATE = 'IMMEDIATE',
  RESERVATION = 'RESERVATION',
}

export interface User {
  id: string
  role: UserRole
}

export interface LoginRequest {
  id: string
  password: string
  role: UserRole
}

export interface LoginResponse {
  token: string
  userId: string
  role: UserRole
  message: string
}

export interface RegisterRequest {
  name: string
  id: string
  password: string
  confirmPassword: string
  address: string
  cardNumber: string
  cardExpiry: string
  cardCVC: string
  cardHolderName: string
  privacyAgreed: boolean
}

export interface Item {
  id: number
  code: string
  label: string
  unitPrice: number
  defaultQuantity?: number
  stockQuantity?: number
}

export interface Menu {
  id: number
  type: MenuType
  basePrice: number
  items: Item[]
}

export interface CartItem {
  id: number
  menu: Menu
  selectedStyle: StyleType
  customizedQuantities: Record<string, number>
  quantity: number
  subTotal: number
}

export interface Cart {
  id: number
  items: CartItem[]
  totalPrice: number
}

export interface AddCartItemRequest {
  menuId: number
  styleType: StyleType
  customizedQuantities?: Record<string, number>
  quantity: number
}

export interface OrderItem {
  id: number
  menu: Menu
  styleType: StyleType
  customizedQuantities: Record<string, number>
  quantity: number
  subTotal: number
}

export interface Order {
  orderId: number
  status: OrderStatus
  deliveryType: DeliveryType
  reservationTime?: string
  finalPrice: number
  orderItems: OrderItem[]
  createdAt: string
  kitchenStaffId?: string
  deliveryStaffId?: string
  coupon?: Coupon
}

export interface CreateOrderRequest {
  deliveryType: DeliveryType
  reservationTime?: string
}

export interface UpdateOrderItemRequest {
  menuId: number
  styleType: StyleType
  customizedQuantities?: Record<string, number>
  quantity: number
}

export interface UpdateOrderRequest {
  orderItems: UpdateOrderItemRequest[]
}

export interface CustomerProfile {
  id: string
  name: string
  address: string
  cardNumber: string
  cardExpiry: string
  cardCVC: string
  cardHolderName: string
  isRegularCustomer?: boolean
}

export interface UpdateProfileRequest {
  currentPassword: string
  name?: string
  address?: string
  cardNumber?: string
  cardExpiry?: string
  cardCVC?: string
  cardHolderName?: string
  newPassword?: string
}

export interface Inventory {
  itemCode: string
  label: string
  quantity: number
  lastRestocked?: string
}

export interface Coupon {
  id: number
  code: string
  discountAmount: number
  isValid: boolean
}

export interface CreateCouponRequest {
  code: string
  discountAmount: number
}

export interface CustomerCoupon {
  id: number
  coupon: Coupon
  isUsed: boolean
  usedAt?: string
  receivedAt: string
}

export interface OrderModificationLog {
  id: number
  orderId: number
  modifiedAt: string
  previousOrderItems: string
  newOrderItems: string
  priceDifference: number
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// 음성인식 주문 관련 타입
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatResponse {
  message: string
  orderConfirmed: boolean
  orderId?: string
  order?: VoiceOrderSummary
}

export interface VoiceOrderSummary {
  customerName?: string | null
  customerAddress?: string | null
  menuName?: string | null
  menuStyle?: string | null
  menuItems?: string | null
  deliveryTime?: string | null
  orderId?: string | null
  orderTime?: string | null
  quantity?: number | null
  couponCode?: string | null
  useCoupon?: boolean | null
}

export interface OrderConfirmRequest {
  history: ChatMessage[]
  finalMessage?: string | null
}

export interface OrderConfirmResponse {
  orderId: string
  confirmedAt: string
  order: VoiceOrderSummary
}

