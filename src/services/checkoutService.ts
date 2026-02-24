import api from './api';
import type {
    ValidateCheckoutRequest,
    ValidateCheckoutResponse,
    ValidateCheckoutApiResponse,
    ShippingInfoResponse,
    ShippingInfoApiResponse,
    PaymentMethodDto,
    PaymentMethodsApiResponse,
} from '../types/order.types';

/**
 * Checkout Service
 * Handles cart validation, shipping info, and payment methods
 */

/**
 * Validate checkout - kiểm tra cart, stock, shipping, coupon
 */
export const validateCheckout = async (
    couponCode?: string
): Promise<ValidateCheckoutResponse> => {
    const request: ValidateCheckoutRequest = {};
    if (couponCode) {
        request.couponCode = couponCode;
    }

    const response = await api.post<ValidateCheckoutApiResponse>(
        '/Checkout/validate',
        request
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Checkout validation failed');
    }

    return response.data.data;
};

/**
 * Lấy thông tin giao hàng của user (pre-fill form)
 */
export const getShippingInfo = async (): Promise<ShippingInfoResponse> => {
    const response = await api.get<ShippingInfoApiResponse>(
        '/Checkout/shipping-info'
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get shipping info');
    }

    return response.data.data;
};

/**
 * Lấy danh sách phương thức thanh toán
 */
export const getPaymentMethods = async (): Promise<PaymentMethodDto[]> => {
    const response = await api.get<PaymentMethodsApiResponse>(
        '/Checkout/payment-methods'
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get payment methods');
    }

    return response.data.data;
};

const checkoutService = {
    validateCheckout,
    getShippingInfo,
    getPaymentMethods,
};

export default checkoutService;
