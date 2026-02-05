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
            const data = await getCart();
            setCart(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch cart');
            setCart(null);
        } finally {
            setLoading(false);
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
            const updatedCart = await updateCartItemApi(cartItemId, { quantity });
            setCart(updatedCart);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update quantity');
            return false;
        }
    }, []);

    const removeItem = useCallback(async (cartItemId: number): Promise<boolean> => {
        try {
            setError(null);
            const updatedCart = await removeCartItemApi(cartItemId);
            setCart(updatedCart);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove item');
            return false;
        }
    }, []);

    const clearCart = useCallback(async (): Promise<boolean> => {
        try {
            setError(null);
            await clearCartApi();
            setCart(null);
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
            const result = await validateCouponApi({ couponCode });
            if (result.isValid) {
                // Refetch cart to get updated totals
                await fetchCart();
            }
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to validate coupon');
            return null;
        }
    }, [fetchCart]);

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
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add to cart');
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
