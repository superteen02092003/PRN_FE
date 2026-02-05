import api from './api';
import type {
    CartDto,
    CartApiResponse,
    AddToCartDto,
    UpdateCartItemDto,
    CouponValidationResult,
    CouponApiResponse,
    ValidateCouponDto,
} from '../types/cart.types';
import type { ApiResponse } from '../types/product.types';

/**
 * Lấy giỏ hàng của user hiện tại
 */
export const getCart = async (): Promise<CartDto> => {
    const response = await api.get<CartApiResponse>('/Cart');

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch cart');
    }

    return response.data.data;
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export const addToCart = async (data: AddToCartDto): Promise<CartDto> => {
    const response = await api.post<CartApiResponse>('/Cart/items', data);

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to add item to cart');
    }

    return response.data.data;
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ
 */
export const updateCartItem = async (
    cartItemId: number,
    data: UpdateCartItemDto
): Promise<CartDto> => {
    const response = await api.put<CartApiResponse>(`/Cart/items/${cartItemId}`, data);

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update cart item');
    }

    return response.data.data;
};

/**
 * Xóa 1 sản phẩm khỏi giỏ hàng
 */
export const removeCartItem = async (cartItemId: number): Promise<CartDto> => {
    const response = await api.delete<CartApiResponse>(`/Cart/items/${cartItemId}`);

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to remove cart item');
    }

    return response.data.data;
};

/**
 * Xóa toàn bộ giỏ hàng
 */
export const clearCart = async (): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>('/Cart');

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to clear cart');
    }
};

/**
 * Validate và áp dụng mã giảm giá
 */
export const validateCoupon = async (
    data: ValidateCouponDto
): Promise<CouponValidationResult> => {
    const response = await api.post<CouponApiResponse>('/Cart/validate-coupon', data);

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to validate coupon');
    }

    return response.data.data;
};
