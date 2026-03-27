import api from './api';
import type {
    ProductResponseDto,
    ProductDetailDto,
    CategoryResponseDto,
    BrandResponseDto,
    ProductFilterParams,
    ProductType,
    ApiResponse,
    PaginatedResponse,
    ReviewsResponse,
    ReviewFilterParams,
    ReviewDto,
    CreateReviewDto,
    ProductBundleDto,
} from '../types/product.types';

// ===== Response Types from API =====

type ProductsApiResponse = ApiResponse<PaginatedResponse<ProductResponseDto>>;
type BrandsApiResponse = ApiResponse<BrandResponseDto[]>;

// ===== Products Result with Pagination =====

export interface ProductsResult {
    items: ProductResponseDto[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

/**
 * Lấy danh sách sản phẩm với filter và phân trang
 */
export const getProducts = async (
    filter: ProductFilterParams = {}
): Promise<ProductsResult> => {
    try {
        const params: Record<string, string | number> = {};

        // Set defaults
        params.PageNumber = filter.pageNumber || 1;
        params.PageSize = filter.pageSize || 12;

        if (filter.searchTerm) params.SearchTerm = filter.searchTerm;
        if (filter.brandId) params.BrandId = filter.brandId;
        if (filter.categoryId) params.CategoryId = filter.categoryId;
        if (filter.minPrice !== undefined) params.MinPrice = filter.minPrice;
        if (filter.maxPrice !== undefined) params.MaxPrice = filter.maxPrice;
        if (filter.productType) params.ProductType = filter.productType;

        const response = await api.get<ProductsApiResponse>('/Product', { params });

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to fetch products');
        }

        const raw = response.data.data;
        // API may return nested pagination object or flat structure
        const pagination = (raw as any).pagination;
        const result = {
            items: raw.items,
            pageNumber: pagination?.currentPage ?? raw.pageNumber ?? 1,
            pageSize: pagination?.pageSize ?? raw.pageSize ?? 12,
            totalCount: pagination?.totalItems ?? raw.totalCount ?? raw.items.length,
            totalPages: pagination?.totalPages ?? raw.totalPages ?? 1,
        };
        return result;
    } catch (err) {
        console.error('[ProductService] API unavailable:', err);
        return {
            items: [],
            pageNumber: 1,
            pageSize: 12,
            totalCount: 0,
            totalPages: 0,
        };
    }
};

/**
 * Lấy danh sách sản phẩm theo productType
 */
export const getProductsByType = async (
    productType: ProductType,
    filter: Omit<ProductFilterParams, 'productType'> = {}
): Promise<ProductsResult> => {
    return getProducts({ ...filter, productType });
};

/**
 * Lấy danh sách Modules
 */
export const getModules = async (
    filter: Omit<ProductFilterParams, 'productType'> = {}
): Promise<ProductsResult> => {
    return getProductsByType('MODULE', filter);
};

/**
 * Lấy danh sách Kits
 */
export const getKits = async (
    filter: Omit<ProductFilterParams, 'productType'> = {}
): Promise<ProductsResult> => {
    return getProductsByType('KIT', filter);
};

/**
 * Lấy danh sách Components
 */
export const getComponents = async (
    filter: Omit<ProductFilterParams, 'productType'> = {}
): Promise<ProductsResult> => {
    return getProductsByType('COMPONENT', filter);
};

/**
 * Lấy tất cả categories
 */
export const getCategories = async (): Promise<CategoryResponseDto[]> => {
    try {
        const response = await api.get<any>('/categories', {
            params: { pageNumber: 1, pageSize: 100 }
        });
        const data = response.data;
        // Handle both wrapped (ApiResponse) and direct response formats
        if (data.success && data.data) {
            return data.data.items || [];
        }
        if (data.items) {
            return data.items;
        }
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (err) {
        console.error('[ProductService] Categories API unavailable:', err);
        return [];
    }
};

/**
 * Lấy tất cả brands
 */
export const getBrands = async (): Promise<BrandResponseDto[]> => {
    try {
        const response = await api.get<BrandsApiResponse>('/Product/brands');

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to fetch brands');
        }

        return response.data.data;
    } catch {
        console.error('[ProductService] Brands API unavailable');
        return [];
    }
};

// ===== Product Detail APIs =====

type ReviewApiResponse = ApiResponse<ReviewDto>;

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const getProductDetail = async (productId: number): Promise<ProductDetailDto> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<ApiResponse<any>>(`/Product/${productId}`);

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch product detail');
    }

    const data = response.data.data;

    // Normalize data: handle case where API returns primaryImage instead of images array
    const normalizedData: ProductDetailDto = {
        ...data,
        // Tính inStock từ stockQuantity nếu không có
        inStock: data.inStock ?? (data.stockQuantity > 0),
        // Nếu không có images array, tạo từ primaryImage
        images: data.images ?? (data.primaryImage ? [{
            imageId: 1,
            imageUrl: data.primaryImage,
            isPrimary: true,
            sortOrder: 0,
        }] : []),
        // Default values
        averageRating: data.averageRating ?? 0,
        totalReviews: data.totalReviews ?? 0,
        categories: data.categories ?? [],
        description: data.description ?? '',
    };

    return normalizedData;
};

/**
 * Lấy danh sách reviews của sản phẩm
 */
export const getProductReviews = async (
    productId: number,
    params: ReviewFilterParams = {}
): Promise<ReviewsResponse> => {
    const queryParams: Record<string, string | number> = {};

    queryParams.PageNumber = params.pageNumber || 1;
    queryParams.PageSize = params.pageSize || 10;
    if (params.sortBy) queryParams.SortBy = params.sortBy;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<ApiResponse<any>>(
        `/Product/${productId}/reviews`,
        { params: queryParams }
    );

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch reviews');
    }

    // Transform flat BE response into nested FE ReviewsResponse structure
    const raw = response.data.data;

    // Map ratingDistribution from { "5": 1, "4": 0, ... } to [{ rating, count, percentage }]
    const totalReviews = raw.totalReviews ?? 0;
    const ratingDistribution = Object.entries(raw.ratingDistribution ?? {}).map(
        ([rating, count]) => ({
            rating: parseInt(rating),
            count: count as number,
            percentage: totalReviews > 0 ? Math.round(((count as number) / totalReviews) * 100) : 0,
        })
    ).sort((a, b) => b.rating - a.rating);

    // Map reviews array — BE uses "reviewer" field, FE expects "userName"
    const reviewItems = (raw.reviews ?? []).map((r: Record<string, unknown>) => ({
        reviewId: r.reviewId,
        userId: r.userId ?? 0,
        userName: r.reviewer ?? r.userName ?? 'Anonymous',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt ?? null,
    }));

    const result: ReviewsResponse = {
        summary: {
            averageRating: raw.averageRating ?? 0,
            totalReviews: totalReviews,
            ratingDistribution,
        },
        reviews: {
            items: reviewItems,
            pageNumber: raw.page ?? 1,
            pageSize: raw.pageSize ?? 10,
            totalCount: totalReviews,
            totalPages: raw.totalPages ?? 0,
        },
    };

    return result;
};

/**
 * Lấy danh sách components trong bundle (cho KIT products)
 */
export const getProductBundle = async (productId: number): Promise<ProductBundleDto> => {
    const response = await api.get<any>(`/Product/${productId}/bundle`);

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch bundle');
    }

    // Backend returns an array of items (IEnumerable<ProductBundleResponse>)
    const data = response.data.data;
    
    if (!Array.isArray(data) || data.length === 0) {
        return {
            kitProductId: productId,
            kitName: 'Kit Product',
            totalComponents: 0,
            components: []
        };
    }

    const kitName = data[0].parentProductName || 'Kit Product';
    
    const components = data.map((item: any) => ({
        productId: item.childProductId,
        sku: item.childProductSku || 'N/A',
        name: item.childProductName,
        quantity: item.quantity,
        price: item.childProductPrice,
        primaryImage: item.childProductImage || null,
        productType: item.childProductType || 'COMPONENT' // Fallback to COMPONENT since it's not present in DTO
    }));

    return {
        kitProductId: productId,
        kitName: kitName,
        totalComponents: components.length,
        components: components
    };
};

/**
 * Tạo review mới cho sản phẩm (cần đăng nhập và đã mua sản phẩm)
 */
export const createProductReview = async (
    productId: number,
    review: CreateReviewDto
): Promise<ReviewDto> => {
    try {
        const response = await api.post<ReviewApiResponse>(
            `/Product/${productId}/reviews`,
            review
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to create review');
        }

        return response.data.data;
    } catch (err) {
        // Extract BE error message from Axios error response (400/403)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = err as any;
        if (axiosError?.response?.data?.message) {
            throw new Error(axiosError.response.data.message);
        }
        throw err;
    }
};
