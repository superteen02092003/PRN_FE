import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getMyOrders, getOrderDetail, cancelOrder } from '../services/orderService';
import type {
    OrderResponseDto,
    OrderDetailResponseDto,
    OrderFilterRequest,
} from '../types/order.types';

interface UseOrdersReturn {
    orders: OrderResponseDto[];
    totalPages: number;
    totalCount: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    filter: OrderFilterRequest;
    setFilter: (filter: Partial<OrderFilterRequest>) => void;
    fetchOrders: () => Promise<void>;
}

interface UseOrderDetailReturn {
    order: OrderDetailResponseDto | null;
    isLoading: boolean;
    error: string | null;
    isCancelling: boolean;
    handleCancelOrder: (reason: string) => Promise<boolean>;
    refetch: () => Promise<void>;
}

/**
 * Hook for managing order list (Order History)
 */
export const useOrders = (initialFilter?: Partial<OrderFilterRequest>): UseOrdersReturn => {
    const [orders, setOrders] = useState<OrderResponseDto[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilterState] = useState<OrderFilterRequest>({
        pageNumber: 1,
        pageSize: 10,
        ...initialFilter,
    });

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getMyOrders(filter);
            setOrders(result.items);
            setTotalPages(result.totalPages);
            setTotalCount(result.totalCount);
            setCurrentPage(result.pageNumber);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load orders';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const setFilter = useCallback((partial: Partial<OrderFilterRequest>) => {
        setFilterState(prev => ({ ...prev, ...partial }));
    }, []);

    return {
        orders,
        totalPages,
        totalCount,
        currentPage,
        isLoading,
        error,
        filter,
        setFilter,
        fetchOrders,
    };
};

/**
 * Hook for managing order detail
 */
export const useOrderDetail = (orderId: number | undefined): UseOrderDetailReturn => {
    const [order, setOrder] = useState<OrderDetailResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!orderId) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getOrderDetail(orderId);
            setOrder(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load order details';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleCancelOrder = useCallback(async (reason: string): Promise<boolean> => {
        if (!orderId) return false;
        setIsCancelling(true);
        try {
            await cancelOrder(orderId, reason);
            toast.success('Order cancelled successfully');
            await fetchDetail(); // Refetch to get updated status
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to cancel order';
            toast.error(message);
            return false;
        } finally {
            setIsCancelling(false);
        }
    }, [orderId, fetchDetail]);

    return {
        order,
        isLoading,
        error,
        isCancelling,
        handleCancelOrder,
        refetch: fetchDetail,
    };
};
