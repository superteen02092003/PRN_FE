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
 * Lấy trạng thái thanh toán (dùng cho polling)
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
 * Tạo URL redirect đến SePay Payment Gateway
 * Backend sẽ render HTML form ẩn rồi auto-submit POST đến SePay
 *
 * @param orderId - ID đơn hàng
 * @param successUrl - URL redirect khi thanh toán thành công
 * @param errorUrl - URL redirect khi thanh toán lỗi
 * @param cancelUrl - URL redirect khi user hủy thanh toán
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
 * Redirect trình duyệt đến SePay Payment Gateway
 * Sử dụng window.location.href để full page redirect
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
