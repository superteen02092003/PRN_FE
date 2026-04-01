// ===== Dashboard Types =====

export interface DashboardResponse {
    orders: OrderStats;
    products: ProductStats;
    customers: CustomerStats;
    recentOrders: RecentOrderDto[];
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
}

export interface ProductStats {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
}

export interface CustomerStats {
    totalCustomers: number;
    newCustomersThisMonth: number;
}

export interface RecentOrderDto {
    orderId: number;
    orderNumber: string;
    customerName: string | null;
    totalAmount: number;
    status: string | null;
    paymentMethod: string | null;
    createdAt: string | null;
}

export interface DailyRevenueData {
    date: string;
    revenue: number;
    orderCount: number;
}

// ===== Admin Product Types =====

export interface AdminProductResponse {
    productId: number;
    name: string;
    sku: string;
    productType: string;
    price: number;
    stockQuantity: number;
    isActive: boolean;
    brandName: string | null;
    categories: string[];
    primaryImage: string | null;
    lowStock: boolean;
}

export interface AdminProductFilter {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    brandId?: number;
    productType?: string;
    lowStock?: boolean;
}

// ===== Admin Order Types =====

export interface AdminOrderResponse {
    orderId: number;
    orderNumber: string;
    status: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    totalAmount: number;
    paymentMethod: string | null;
    paymentStatus: string | null;
    itemCount: number;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface AdminOrderFilter {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface AdminOrderDetailResponse {
    orderId: number;
    userId: number;
    orderNumber: string;
    status: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    shippingAddress: string | null;
    province: string | null;
    district: string | null;
    ward: string | null;
    streetAddress: string | null;
    subtotalAmount: number;
    shippingFee: number | null;
    discountAmount: number | null;
    totalAmount: number;
    createdAt: string | null;
    updatedAt: string | null;
    confirmedAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;
    cancelReason: string | null;
    trackingNumber: string | null;
    carrier: string | null;
    expectedDeliveryDate: string | null;
    notes: string | null;
    payment: AdminPaymentInfo | null;
    items: AdminOrderItemResponse[];
    allowedStatusTransitions: string[];
}

export interface AdminPaymentInfo {
    paymentId: number;
    paymentMethod: string | null;
    paymentStatus: string | null;
    amount: number;
    receivedAmount: number | null;
    paymentReference: string | null;
    transactionId: string | null;
    paymentDate: string | null;
    expiredAt: string | null;
    notes: string | null;
}

export interface AdminOrderItemResponse {
    orderItemId: number;
    productId: number;
    productName: string | null;
    productSku: string | null;
    productImageUrl: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discountAmount: number | null;
    serialNumbers: string[];
    hasSerialTracking: boolean;
}

export interface UpdateOrderStatusRequest {
    newStatus: string;
    note?: string;
    trackingNumber?: string;
    carrier?: string;
}

export interface UpdatePaymentStatusRequest {
    newPaymentStatus: string;
    note?: string;
}

// ===== Admin User Types =====

export interface AdminUserDto {
    userId: number;
    username: string;
    email: string;
    roleName: string;
    phone: string | null;
    address: string | null;
    isActive: boolean | null;
    createdAt: string | null;
}

// ===== Paginated Response =====

export interface AdminPaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// ===== API Wrapper =====

export interface AdminApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
}

// ===== Admin Brand Types =====

export interface AdminBrandResponse {
    brandId: number;
    name: string;
    logoUrl: string | null;
    productCount: number;
}

export interface CreateBrandRequest {
    name: string;
    logoUrl?: string;
}

export interface UpdateBrandRequest {
    name: string;
    logoUrl?: string;
}

// ===== Admin Category Types =====

export interface AdminCategoryResponse {
    categoryId: number;
    name: string;
    imageUrl: string | null;
    productCount: number;
}

export interface CreateCategoryRequest {
    name: string;
    imageUrl?: string;
}

export interface UpdateCategoryRequest {
    name: string;
    imageUrl?: string;
}

// ===== Admin Coupon Types =====

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface AdminCouponResponse {
    couponId: number;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number | null;
    maxDiscountAmount: number | null;
    startDate: string;
    endDate: string;
    usageLimit: number | null;
    usedCount: number;
    createdAt: string | null;
    orderCount: number;
    isActive: boolean;
}

export interface CreateCouponRequest {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate: string;
    endDate: string;
    usageLimit?: number;
}

export interface UpdateCouponRequest {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate: string;
    endDate: string;
    usageLimit?: number;
}
