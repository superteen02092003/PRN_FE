import api from './api';
import type {
    DashboardResponse,
    DailyRevenueData,
    AdminProductResponse,
    AdminProductFilter,
    AdminOrderResponse,
    AdminOrderFilter,
    AdminOrderDetailResponse,
    UpdateOrderStatusRequest,
    UpdatePaymentStatusRequest,
    AdminUserDto,
    AdminApiResponse,
    AdminPaginatedResponse,
    AdminBrandResponse,
    CreateBrandRequest,
    UpdateBrandRequest,
    AdminCategoryResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from '../types/admin.types';

// ===== Dashboard =====

export const getDashboard = async (): Promise<DashboardResponse> => {
    const response = await api.get<AdminApiResponse<DashboardResponse>>('/admin/dashboard');
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch dashboard');
    }
    return response.data.data;
};

export const getRevenueChart = async (from: string, to: string, status?: string): Promise<DailyRevenueData[]> => {
    const params: Record<string, string> = { from, to };
    if (status) params.status = status;
    const response = await api.get<AdminApiResponse<DailyRevenueData[]>>('/admin/dashboard/revenue-chart', {
        params
    });
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch revenue chart');
    }
    return response.data.data;
};

// ===== Products =====

export const getAdminProducts = async (
    filter: AdminProductFilter = {}
): Promise<AdminPaginatedResponse<AdminProductResponse>> => {
    const params: Record<string, string | number | boolean> = {};
    if (filter.pageNumber) params.PageNumber = filter.pageNumber;
    if (filter.pageSize) params.PageSize = filter.pageSize;
    if (filter.search) params.Search = filter.search;
    if (filter.categoryId) params.CategoryId = filter.categoryId;
    if (filter.brandId) params.BrandId = filter.brandId;
    if (filter.productType) params.ProductType = filter.productType;
    if (filter.lowStock !== undefined) params.LowStock = filter.lowStock;

    const response = await api.get<AdminApiResponse<AdminPaginatedResponse<AdminProductResponse>>>(
        '/admin/products',
        { params }
    );
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch products');
    }
    return response.data.data;
};

export const createProduct = async (data: Record<string, unknown>): Promise<unknown> => {
    try {
        const response = await api.post<AdminApiResponse<unknown>>('/admin/products', data);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create product');
        }
        return response.data.data;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

export const updateProduct = async (id: number, data: Record<string, unknown>): Promise<unknown> => {
    try {
        const response = await api.put<AdminApiResponse<unknown>>(`/admin/products/${id}`, data);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update product');
        }
        return response.data.data;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

export const deleteProduct = async (id: number): Promise<void> => {
    try {
        const response = await api.delete<AdminApiResponse<unknown>>(`/admin/products/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete product');
        }
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

export const uploadProductImages = async (
    productId: number,
    files: File[],
    setPrimaryIndex?: number
): Promise<unknown> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (setPrimaryIndex !== undefined) {
        formData.append('setPrimaryIndex', String(setPrimaryIndex));
    }
    const response = await api.post<AdminApiResponse<unknown>>(
        `/admin/products/${productId}/images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload images');
    }
    return response.data.data;
};

export const deleteProductImage = async (productId: number, imageId: number): Promise<void> => {
    const response = await api.delete<AdminApiResponse<unknown>>(
        `/admin/products/${productId}/images/${imageId}`
    );
    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete image');
    }
};

// ===== Orders =====

export const getAdminOrders = async (
    filter: AdminOrderFilter = {}
): Promise<AdminPaginatedResponse<AdminOrderResponse>> => {
    const params: Record<string, string | number> = {};
    if (filter.pageNumber) params.PageNumber = filter.pageNumber;
    if (filter.pageSize) params.PageSize = filter.pageSize;
    if (filter.search) params.Search = filter.search;
    if (filter.status) params.Status = filter.status;
    if (filter.paymentMethod) params.PaymentMethod = filter.paymentMethod;
    if (filter.paymentStatus) params.PaymentStatus = filter.paymentStatus;
    if (filter.dateFrom) params.DateFrom = filter.dateFrom;
    if (filter.dateTo) params.DateTo = filter.dateTo;

    // Backend returns: { success, data: { orders, statusCounts, pagination: { currentPage, pageSize, totalItems, totalPages } } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<AdminApiResponse<any>>(
        '/admin/orders',
        { params }
    );
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch orders');
    }

    const raw = response.data.data;
    return {
        items: raw.orders ?? [],
        pageNumber: raw.pagination?.currentPage ?? 1,
        pageSize: raw.pagination?.pageSize ?? 15,
        totalCount: raw.pagination?.totalItems ?? 0,
        totalPages: raw.pagination?.totalPages ?? 0,
    };
};

export const getAdminOrderDetail = async (id: number): Promise<AdminOrderDetailResponse> => {
    const response = await api.get<AdminApiResponse<AdminOrderDetailResponse>>(`/admin/orders/${id}`);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch order detail');
    }
    return response.data.data;
};

export const updateOrderStatus = async (
    id: number,
    data: UpdateOrderStatusRequest
): Promise<unknown> => {
    try {
        const response = await api.put<AdminApiResponse<unknown>>(`/admin/orders/${id}/status`, data);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update order status');
        }
        return response.data.data;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

export const updatePaymentStatus = async (
    id: number,
    data: UpdatePaymentStatusRequest
): Promise<unknown> => {
    try {
        const response = await api.put<AdminApiResponse<unknown>>(`/admin/orders/${id}/payment-status`, data);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update payment status');
        }
        return response.data.data;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

// ===== Users =====

export const getUsers = async (): Promise<AdminUserDto[]> => {
    const response = await api.get<AdminUserDto[]>('/users');
    return response.data;
};

// ===== Brands =====

interface PagedResponse<T> {
    items: T[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

export const getAdminBrands = async (): Promise<AdminBrandResponse[]> => {
    const response = await api.get<PagedResponse<AdminBrandResponse>>('/brands?pageSize=200');
    return response.data.items || [];
};

export const createBrand = async (data: CreateBrandRequest): Promise<AdminBrandResponse> => {
    try {
        const response = await api.post<AdminApiResponse<AdminBrandResponse>>('/brands', data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to create brand');
        }
        return response.data.data;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

export const updateBrand = async (id: number, data: UpdateBrandRequest): Promise<AdminBrandResponse> => {
    try {
        const response = await api.put<AdminApiResponse<AdminBrandResponse>>(`/brands/${id}`, data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to update brand');
        }
        return response.data.data;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

export const deleteBrand = async (id: number): Promise<void> => {
    try {
        const response = await api.delete<AdminApiResponse<unknown>>(`/brands/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete brand');
        }
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

// ===== Categories =====

export const getAdminCategories = async (): Promise<AdminCategoryResponse[]> => {
    const response = await api.get<PagedResponse<AdminCategoryResponse>>('/categories?pageSize=200');
    return response.data.items || [];
};

export const createCategory = async (data: CreateCategoryRequest): Promise<AdminCategoryResponse> => {
    try {
        const response = await api.post<AdminApiResponse<AdminCategoryResponse>>('/categories', data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to create category');
        }
        return response.data.data;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

export const updateCategory = async (id: number, data: UpdateCategoryRequest): Promise<AdminCategoryResponse> => {
    try {
        const response = await api.put<AdminApiResponse<AdminCategoryResponse>>(`/categories/${id}`, data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to update category');
        }
        return response.data.data;
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

export const deleteCategory = async (id: number): Promise<void> => {
    try {
        const response = await api.delete<AdminApiResponse<unknown>>(`/categories/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete category');
        }
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};

// ===== Reviews =====

export const deleteReview = async (reviewId: number): Promise<void> => {
    try {
        const response = await api.delete<AdminApiResponse<unknown>>(`/admin/reviews/${reviewId}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete review');
        }
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosErr = err as any;
        if (axiosErr?.response?.data?.message) throw new Error(axiosErr.response.data.message);
        throw err;
    }
};
