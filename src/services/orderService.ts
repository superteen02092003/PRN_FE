import api from './api';
import type { ApiResponse, PaginatedResponse } from '../types/product.types';
import type {
    CreateOrderRequest,
    CheckoutResponseDto,
    CheckoutApiResponse,
    OrderResponseDto,
    OrderDetailResponseDto,
    OrderDetailApiResponse,
    OrderListApiResponse,
    OrderFilterRequest,
    CancelOrderRequest,
} from '../types/order.types';

/**
 * Order Service
 * Handles order creation, history, details, and cancellation
 */

/**
 * Tạo đơn hàng từ giỏ hàng (Checkout)
 */
export const createOrder = async (
    data: CreateOrderRequest
): Promise<CheckoutResponseDto> => {
    const response = await api.post<CheckoutApiResponse>(
        '/Order/checkout',
        data
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create order');
    }

    return response.data.data;
};

/**
 * Lấy danh sách đơn hàng của user (Order History)
 */
export const getMyOrders = async (
    filter?: OrderFilterRequest
): Promise<PaginatedResponse<OrderResponseDto>> => {
    const params: Record<string, string | number> = {};

    if (filter?.pageNumber) params.pageNumber = filter.pageNumber;
    if (filter?.pageSize) params.pageSize = filter.pageSize;
    if (filter?.status) params.status = filter.status;
    if (filter?.searchTerm) params.searchTerm = filter.searchTerm;
    if (filter?.fromDate) params.fromDate = filter.fromDate;
    if (filter?.toDate) params.toDate = filter.toDate;

    const response = await api.get<OrderListApiResponse>(
        '/Order/my-orders',
        { params }
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch orders');
    }

    return response.data.data;
};

/**
 * Lấy chi tiết đơn hàng
 */
export const getOrderDetail = async (
    orderId: number
): Promise<OrderDetailResponseDto> => {
    const response = await api.get<OrderDetailApiResponse>(
        `/Order/${orderId}`
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch order detail');
    }

    return response.data.data;
};

/**
 * Hủy đơn hàng
 */
export const cancelOrder = async (
    orderId: number,
    cancelReason: string
): Promise<void> => {
    const data: CancelOrderRequest = { cancelReason };
    const response = await api.put<ApiResponse<null>>(
        `/Order/${orderId}/cancel`,
        data
    );

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel order');
    }
};

const orderService = {
    createOrder,
    getMyOrders,
    getOrderDetail,
    cancelOrder,
};

export default orderService;
