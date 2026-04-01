import type { ApiResponse, PaginatedResponse } from './product.types';

// ===== Enums =====

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethodType = 'COD' | 'SEPAY';
export type PaymentStatusType = 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

// ===== Checkout DTOs =====

export interface CheckoutCartItemDto {
    cartItemId: number;
    productId: number;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    itemTotal: number;
    stockQuantity: number;
    isAvailable: boolean;
}

export interface CheckoutShippingInfoDto {
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
}

export interface CheckoutCouponDto {
    isApplied: boolean;
    code: string | null;
    discountAmount: number;
    // Legacy aliases (in case backend changes field name)
    couponCode?: string;
}

export interface CheckoutSummaryDto {
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    isFreeShipping?: boolean;
    freeShippingThreshold?: number;
}

export interface StockErrorDto {
    productId: number;
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
}

export interface ValidateCheckoutResponse {
    isValid: boolean;
    cartItems: CheckoutCartItemDto[];
    shippingInfo: CheckoutShippingInfoDto | null;
    coupon: CheckoutCouponDto | null;
    summary: CheckoutSummaryDto | null;
    stockErrors: StockErrorDto[] | null;
    /** Non-null if a coupon was provided but is invalid. Checkout still loads normally. */
    couponError?: string | null;
}

export interface ShippingInfoResponse {
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
}

export interface PaymentMethodDto {
    code: string;
    name: string;
    description: string;
    isActive: boolean;
}

// ===== Checkout Request =====

export interface ValidateCheckoutRequest {
    couponCode?: string;
    province?: string;
}

// ===== Order Request DTOs =====

export interface CreateOrderRequest {
    paymentMethod: PaymentMethodType;
    couponCode?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
    notes?: string;
}

export interface OrderFilterRequest {
    pageNumber?: number;
    pageSize?: number;
    status?: OrderStatus;
    searchTerm?: string;
    fromDate?: string;
    toDate?: string;
}

export interface CancelOrderRequest {
    cancelReason: string;
}

// ===== Order Response DTOs =====

export interface CheckoutResponseDto {
    orderId: number;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    paymentMethod: PaymentMethodType;
    paymentStatus: PaymentStatusType;
    paymentReference: string | null;
    qrCodeUrl: string | null;
    checkoutUrl: string | null;
    paymentExpiredAt: string | null;
    message: string;
}

export interface OrderResponseDto {
    orderId: number;
    orderNumber: string;
    status: OrderStatus;
    customerName: string | null;
    customerPhone: string | null;
    subtotalAmount: number;
    shippingFee: number | null;
    discountAmount: number | null;
    totalAmount: number;
    paymentMethod: string | null;
    paymentStatus: string | null;
    itemCount: number;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface OrderItemDto {
    orderItemId: number;
    productId: number;
    productName: string | null;
    productSku: string | null;
    productImageUrl: string | null;
    quantity: number;
    unitPrice: number;
    discountAmount: number | null;
    subtotal: number;
    serialNumbers: string[];
    hasSerialTracking: boolean;
}

export interface OrderPaymentDto {
    paymentId: number;
    paymentMethod: string;
    status: PaymentStatusType;
    amount: number;
    receivedAmount: number | null;
    paymentReference: string | null;
    transactionId: string | null;
    qrCodeUrl: string | null;
    paymentDate: string | null;
    expiredAt: string | null;
}

export interface OrderCouponDto {
    couponId: number;
    code: string;
    discountValue: number;
}

export interface OrderDetailResponseDto {
    orderId: number;
    orderNumber: string;
    status: OrderStatus;
    // Customer snapshot
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    province: string | null;
    district: string | null;
    ward: string | null;
    streetAddress: string | null;
    shippingAddress: string;
    // Amounts
    subtotalAmount: number;
    shippingFee: number | null;
    discountAmount: number | null;
    totalAmount: number;
    notes: string | null;
    // Lifecycle
    createdAt: string | null;
    updatedAt: string | null;
    confirmedAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;
    cancelReason: string | null;
    // Shipping
    trackingNumber: string | null;
    carrier: string | null;
    expectedDeliveryDate: string | null;
    // Nested
    items: OrderItemDto[];
    payment: OrderPaymentDto | null;
    coupon: OrderCouponDto | null;
}

// ===== Payment DTOs =====

export interface PaymentStatusResponseDto {
    orderId: number;
    orderNumber: string;
    paymentMethod: string;
    paymentStatus: PaymentStatusType;
    amount: number;
    receivedAmount: number | null;
    qrCodeUrl: string | null;
    paymentReference: string | null;
    expiredAt: string | null;
    isPaid: boolean;
    remainingSeconds: number;
}

// ===== Typed API Responses =====

export type ValidateCheckoutApiResponse = ApiResponse<ValidateCheckoutResponse>;
export type ShippingInfoApiResponse = ApiResponse<ShippingInfoResponse>;
export type PaymentMethodsApiResponse = ApiResponse<PaymentMethodDto[]>;
export type CheckoutApiResponse = ApiResponse<CheckoutResponseDto>;
export type OrderDetailApiResponse = ApiResponse<OrderDetailResponseDto>;
export type OrderListApiResponse = ApiResponse<PaginatedResponse<OrderResponseDto>>;
export type PaymentStatusApiResponse = ApiResponse<PaymentStatusResponseDto>;
