import api from './api';
import type {
    PaymentStatusResponseDto,
    PaymentStatusApiResponse,
} from '../types/order.types';

/**
 * Payment Service
 * Handles payment status polling and SePay redirect URL generation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

/**
 * Get payment status (used for polling)
 */
export const getPaymentStatus = async (
    orderId: number
): Promise<PaymentStatusResponseDto> => {
    const response = await api.get<PaymentStatusApiResponse>(
        `/Payment/${orderId}/status`
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get payment status');
    }

    return response.data.data;
};

/**
 * Generate redirect URL to SePay Payment Gateway
 * Backend renders a hidden HTML form and auto-submits POST to SePay
 *
 * @param orderId - Order ID
 * @param successUrl - Redirect URL on successful payment
 * @param errorUrl - Redirect URL on payment error
 * @param cancelUrl - Redirect URL when user cancels payment
 */
export const getSepayCheckoutUrl = (
    orderId: number,
    successUrl?: string,
    errorUrl?: string,
    cancelUrl?: string
): string => {
    const baseUrl = `${API_BASE_URL}/api/Payment/${orderId}/checkout`;
    const params = new URLSearchParams();

    if (successUrl) params.append('successUrl', successUrl);
    if (errorUrl) params.append('errorUrl', errorUrl);
    if (cancelUrl) params.append('cancelUrl', cancelUrl);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Redirect browser to SePay Payment Gateway
 * Uses window.location.href for full page redirect
 */
export const redirectToSepayCheckout = (orderId: number): void => {
    const currentOrigin = window.location.origin;

    const checkoutUrl = getSepayCheckoutUrl(
        orderId,
        `${currentOrigin}/payment/success`,
        `${currentOrigin}/payment/error`,
        `${currentOrigin}/payment/cancel`
    );

    window.location.href = checkoutUrl;
};

const paymentService = {
    getPaymentStatus,
    getSepayCheckoutUrl,
    redirectToSepayCheckout,
};

export default paymentService;
