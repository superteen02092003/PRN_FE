import api from './api';
import type {
    CartDto,
    CartApiResponse,
    AddToCartDto,
    UpdateCartItemDto,
    CouponValidationResult,
    ValidateCouponDto,
    CartItemDto,
} from '../types/cart.types';
import type { ApiResponse } from '../types/product.types';

// Transform API response to match frontend types
// Backend might use different field names or nested objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformCartItem = (item: any): CartItemDto => {
    console.log('[cartService] Raw cart item:', item);

    // Handle nested Product object if exists
    const product = item.product || item.Product || {};

    return {
        cartItemId: item.cartItemId ?? item.CartItemId ?? item.id ?? item.Id ?? 0,
        productId: item.productId ?? item.ProductId ?? product.productId ?? product.ProductId ?? product.id ?? 0,
        name: item.name ?? item.Name ?? item.productName ?? item.ProductName ?? product.name ?? product.Name ?? product.productName ?? 'Unknown Product',
        sku: item.sku ?? item.Sku ?? item.SKU ?? item.productSku ?? product.sku ?? product.Sku ?? product.SKU ?? 'N/A',
        price: item.price ?? item.Price ?? item.unitPrice ?? item.UnitPrice ?? product.price ?? product.Price ?? 0,
        quantity: item.quantity ?? item.Quantity ?? 0,
        primaryImage: item.primaryImage ?? item.PrimaryImage ?? item.imageUrl ?? item.ImageUrl ?? item.image ?? product.primaryImage ?? product.PrimaryImage ?? product.imageUrl ?? null,
        itemTotal: item.itemTotal ?? item.ItemTotal ?? item.total ?? item.Total ?? item.subTotal ?? item.SubTotal ?? 0,
        inStock: item.inStock ?? item.InStock ?? item.isInStock ?? item.IsInStock ?? product.inStock ?? product.InStock ?? true,
        stockQuantity: item.stockQuantity ?? item.StockQuantity ?? item.stock ?? item.Stock ?? product.stockQuantity ?? product.StockQuantity ?? 99,
    };
};

// Transform entire cart response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformCart = (data: any): CartDto => {
    console.log('[cartService] Raw API response:', data);

    // Handle nested items array
    const items = data.items ?? data.Items ?? data.cartItems ?? data.CartItems ?? [];

    return {
        cartId: data.cartId ?? data.CartId ?? data.id ?? data.Id ?? 0,
        userId: data.userId ?? data.UserId ?? 0,
        items: items.map(transformCartItem),
        summary: {
            totalItems: data.summary?.totalItems ?? data.Summary?.TotalItems ?? data.totalItems ?? data.TotalItems ?? items.length,
            subtotal: data.summary?.subtotal ?? data.Summary?.Subtotal ?? data.subtotal ?? data.Subtotal ?? 0,
            shippingFee: data.summary?.shippingFee ?? data.Summary?.ShippingFee ?? data.shippingFee ?? data.ShippingFee ?? 0,
            discount: data.summary?.discount ?? data.Summary?.Discount ?? data.discount ?? data.Discount ?? 0,
            total: data.summary?.total ?? data.Summary?.Total ?? data.total ?? data.Total ?? 0,
        },
        appliedCoupon: data.appliedCoupon ?? data.AppliedCoupon ?? null,
    };
};

/**
 * Get current user's cart
 */
export const getCart = async (): Promise<CartDto> => {
    const response = await api.get<CartApiResponse>('/Cart');

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch cart');
    }

    return transformCart(response.data.data);
};

/**
 * Add product to cart
 */
export const addToCart = async (data: AddToCartDto): Promise<CartDto> => {
    const response = await api.post<CartApiResponse>('/Cart/items', data);

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to add item to cart');
    }

    return transformCart(response.data.data);
};

/**
 * Update product quantity in cart
 */
export const updateCartItem = async (
    cartItemId: number,
    data: UpdateCartItemDto
): Promise<CartDto | null> => {
    const response = await api.put<CartApiResponse>(`/Cart/items/${cartItemId}`, data);
    console.log('[cartService] updateCartItem response:', response.data);

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update cart item');
    }

    // If API returns cart data, transform and return it
    // Otherwise return null to signal caller to refetch
    if (response.data.data) {
        return transformCart(response.data.data);
    }
    return null;
};

/**
 * Remove a product from cart
 */
export const removeCartItem = async (cartItemId: number): Promise<CartDto | null> => {
    const response = await api.delete<CartApiResponse>(`/Cart/items/${cartItemId}`);
    console.log('[cartService] removeCartItem response:', response.data);

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove cart item');
    }

    // If API returns cart data, transform and return it
    // Otherwise return null to signal caller to refetch
    if (response.data.data) {
        return transformCart(response.data.data);
    }
    return null;
};

/**
 * Clear entire cart
 */
export const clearCart = async (): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>('/Cart');

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to clear cart');
    }
};

/**
 * Validate and apply coupon code
 * Backend returns ValidateCouponResponseDto, transformed to CouponValidationResult.
 * Always returns CouponValidationResult (NEVER throws) — 4xx errors are caught and returned as isValid: false.
 */
export const validateCoupon = async (
    data: ValidateCouponDto
): Promise<CouponValidationResult> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.post<any>('/Cart/validate-coupon', data);

        if (!response.data.success || !response.data.data) {
            // Backend returns success:false with HTTP 200 (rare, but handled safely)
            return {
                isValid: false,
                message: response.data.message || 'Invalid coupon code',
                coupon: null,
            };
        }

        // Transform backend ValidateCouponResponseDto → CouponValidationResult
        const raw = response.data.data;
        return {
            isValid: true,
            message: raw.message ?? 'Coupon applied successfully',
            coupon: {
                couponCode: raw.code ?? '',
                discountType: (raw.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED') as 'PERCENTAGE' | 'FIXED',
                discountValue: raw.discountValue ?? 0,
                discountAmount: raw.calculatedDiscount ?? 0,
            },
            // Pass newTotal so useCart can update the summary
            _newTotal: raw.newTotal ?? 0,
            _cartSubtotal: raw.cartSubtotal ?? 0,
        } as CouponValidationResult & { _newTotal: number; _cartSubtotal: number };
    } catch (err: unknown) {
        // Axios throws when backend returns HTTP 4xx (e.g. 400 "You have already used this coupon code.")
        // Catch the error and return isValid: false instead of letting the exception propagate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        const message: string =
            axiosErr?.response?.data?.message ||
            axiosErr?.message ||
            'Invalid coupon code';
        console.warn('[cartService] validateCoupon 4xx:', message);
        return {
            isValid: false,
            message,
            coupon: null,
        };
    }
};
