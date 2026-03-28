import { useState, useEffect, useCallback } from 'react';
import {
    getCart,
    addToCart as addToCartApi,
    updateCartItem as updateCartItemApi,
    removeCartItem as removeCartItemApi,
    clearCart as clearCartApi,
    validateCoupon as validateCouponApi,
} from '../services/cartService';
import type {
    CartDto,
    AddToCartDto,
    CouponValidationResult,
} from '../types/cart.types';

// ===== useCart Hook =====

interface UseCartResult {
    cart: CartDto | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    addToCart: (data: AddToCartDto) => Promise<boolean>;
    updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
    removeItem: (cartItemId: number) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
    validateCoupon: (couponCode: string) => Promise<CouponValidationResult | null>;
    itemCount: number;
}

export const useCart = (): UseCartResult => {
    const [cart, setCart] = useState<CartDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('[useCart] Fetching cart...');
            const data = await getCart();
            console.log('[useCart] fetchCart received:', data);
            console.log('[useCart] fetchCart items count:', data?.items?.length);
            setCart(data);
        } catch (err) {
            console.error('[useCart] fetchCart error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch cart');
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Silent refetch - doesn't set loading state (prevents UI flash)
    const silentRefetch = useCallback(async () => {
        try {
            setError(null);
            console.log('[useCart] Silent refetching cart...');
            const data = await getCart();
            console.log('[useCart] silentRefetch received:', data);
            console.log('[useCart] silentRefetch items count:', data?.items?.length);
            setCart(data);
        } catch (err) {
            console.error('[useCart] silentRefetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch cart');
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = useCallback(async (data: AddToCartDto): Promise<boolean> => {
        try {
            setError(null);
            const updatedCart = await addToCartApi(data);
            setCart(updatedCart);
            window.dispatchEvent(new Event('cartUpdate'));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add to cart');
            return false;
        }
    }, []);

    const updateQuantity = useCallback(async (
        cartItemId: number,
        quantity: number
    ): Promise<boolean> => {
        try {
            setError(null);
            console.log('[useCart] Updating quantity:', { cartItemId, quantity });

            // Call update API
            await updateCartItemApi(cartItemId, { quantity });

            // Always refetch cart after update (API may return item, not full cart)
            console.log('[useCart] Update successful, refetching cart...');
            await silentRefetch();

            window.dispatchEvent(new Event('cartUpdate'));
            return true;
        } catch (err) {
            console.error('[useCart] Update quantity error:', err);
            setError(err instanceof Error ? err.message : 'Failed to update quantity');
            return false;
        }
    }, [silentRefetch]);

    const removeItem = useCallback(async (cartItemId: number): Promise<boolean> => {
        try {
            setError(null);
            console.log('[useCart] Removing item:', cartItemId);

            // Call remove API
            await removeCartItemApi(cartItemId);

            // Always refetch cart after remove (API may not return full cart)
            console.log('[useCart] Remove successful, refetching cart...');
            await silentRefetch();

            window.dispatchEvent(new Event('cartUpdate'));
            return true;
        } catch (err) {
            console.error('[useCart] Remove item error:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove item');
            return false;
        }
    }, [silentRefetch]);

    const clearCart = useCallback(async (): Promise<boolean> => {
        try {
            setError(null);
            await clearCartApi();
            setCart(null);
            window.dispatchEvent(new Event('cartUpdate'));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear cart');
            return false;
        }
    }, []);

    const validateCoupon = useCallback(async (
        couponCode: string
    ): Promise<CouponValidationResult | null> => {
        try {
            setError(null);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await validateCouponApi({ couponCode }) as any;
            if (result.isValid && result.coupon) {
                // Cập nhật cart state trực tiếp với discount từ response
                // KHÔNG gọi fetchCart() vì GET /api/Cart luôn trả về discount=0, appliedCoupon=null
                setCart(prev => {
                    if (!prev) return prev;
                    const discountAmount = result.coupon.discountAmount ?? 0;
                    const newTotal = result._newTotal ?? (prev.summary.subtotal + prev.summary.shippingFee - discountAmount);
                    return {
                        ...prev,
                        appliedCoupon: result.coupon,
                        summary: {
                            ...prev.summary,
                            discount: discountAmount,
                            total: newTotal,
                        },
                    };
                });
            }
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to validate coupon');
            return null;
        }
    }, []);

    const itemCount = cart?.summary.totalItems ?? 0;

    return {
        cart,
        loading,
        error,
        refetch: fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        validateCoupon,
        itemCount,
    };
};

// ===== useAddToCart Hook (Standalone for Product Detail page) =====

interface UseAddToCartResult {
    addToCart: (productId: number, quantity: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
    success: boolean;
    reset: () => void;
}

export const useAddToCart = (): UseAddToCartResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const addToCart = useCallback(async (
        productId: number,
        quantity: number
    ): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            await addToCartApi({ productId, quantity });
            setSuccess(true);
            window.dispatchEvent(new Event('cartUpdate'));
            return true;
        } catch (err: unknown) {
            // Extract error message from API response or Error object
            let errorMessage = 'Failed to add to cart';

            if (err instanceof Error) {
                errorMessage = err.message;
            }

            // Handle axios error with response data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosError = err as any;
            if (axiosError?.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
            }

            console.error('[useAddToCart] Error:', errorMessage, err);
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return { addToCart, loading, error, success, reset };
};
