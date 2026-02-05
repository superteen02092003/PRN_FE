import api from './api';
import type {
    ProductResponseDto,
    CategoryResponseDto,
    BrandResponseDto,
    ProductFilterParams,
    ProductType,
    ApiResponse,
    PaginatedResponse,
} from '../types/product.types';

// ===== Response Types from API =====

type ProductsApiResponse = ApiResponse<PaginatedResponse<ProductResponseDto>>;
type CategoriesApiResponse = ApiResponse<CategoryResponseDto[]>;
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

    return response.data.data;
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
    const response = await api.get<CategoriesApiResponse>('/Product/categories');

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch categories');
    }

    return response.data.data;
};

/**
 * Lấy tất cả brands
 */
export const getBrands = async (): Promise<BrandResponseDto[]> => {
    const response = await api.get<BrandsApiResponse>('/Product/brands');

    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch brands');
    }

    return response.data.data;
};
