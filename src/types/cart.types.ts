import type { ApiResponse } from './product.types';

// ===== Cart Item Types =====

export interface CartItemDto {
  cartItemId: number;
  productId: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  primaryImage: string | null;
  itemTotal: number;
  inStock: boolean;
  stockQuantity: number;
}

// ===== Cart Summary Types =====

export interface CartSummaryDto {
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

// ===== Cart Types =====

export interface CartDto {
  cartId: number;
  userId: number;
  items: CartItemDto[];
  summary: CartSummaryDto;
  appliedCoupon: AppliedCouponDto | null;
}

// ===== Coupon Types =====

export interface AppliedCouponDto {
  couponCode: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  coupon: AppliedCouponDto | null;
}

// ===== Request DTOs =====

export interface AddToCartDto {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface ValidateCouponDto {
  couponCode: string;
}

// ===== Response Types =====

export type CartApiResponse = ApiResponse<CartDto>;
export type CouponApiResponse = ApiResponse<CouponValidationResult>;

// ===== Add to Cart Response =====

export interface AddToCartResult {
  success: boolean;
  message: string;
  availableQuantity?: number;
}
