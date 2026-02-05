import api from './api';
import type {
    ProductResponseDto,
    CategoryResponseDto,
    BrandResponseDto,
    ProductFilterParams,
    ProductType,
} from '../types/product.types';

/**
 * Lấy danh sách sản phẩm với filter và phân trang
 */
export const getProducts = async (
    filter: ProductFilterParams = {}
): Promise<ProductResponseDto[]> => {
    const params: Record<string, string | number> = {};

    if (filter.pageNumber) params.PageNumber = filter.pageNumber;
    if (filter.pageSize) params.PageSize = filter.pageSize;
    if (filter.searchTerm) params.SearchTerm = filter.searchTerm;
    if (filter.brandId) params.BrandId = filter.brandId;
    if (filter.categoryId) params.CategoryId = filter.categoryId;
    if (filter.minPrice) params.MinPrice = filter.minPrice;
    if (filter.maxPrice) params.MaxPrice = filter.maxPrice;
    if (filter.productType) params.ProductType = filter.productType;

    const response = await api.get<ProductResponseDto[]>('/Product', { params });
    return response.data;
};

/**
 * Lấy danh sách sản phẩm theo productType
 */
export const getProductsByType = async (
    productType: ProductType,
    filter: Omit<ProductFilterParams, 'productType'> = {}
): Promise<ProductResponseDto[]> => {
    return getProducts({ ...filter, productType });
};

/**
 * Lấy danh sách Modules
 */
export const getModules = async (
    filter: Omit<ProductFilterParams, 'productType'> = {}
): Promise<ProductResponseDto[]> => {
    return getProductsByType('MODULE', filter);
};

/**
 * Lấy danh sách Kits
 */
export const getKits = async (
    filter: Omit<ProductFilterParams, 'productType'> = {}
): Promise<ProductResponseDto[]> => {
    return getProductsByType('KIT', filter);
};

/**
 * Lấy danh sách Components
 */
export const getComponents = async (
    filter: Omit<ProductFilterParams, 'productType'> = {}
): Promise<ProductResponseDto[]> => {
    return getProductsByType('COMPONENT', filter);
};

/**
 * Lấy tất cả categories
 */
export const getCategories = async (): Promise<CategoryResponseDto[]> => {
    const response = await api.get<CategoryResponseDto[]>('/Product/categories');
    return response.data;
};

/**
 * Lấy tất cả brands
 */
export const getBrands = async (): Promise<BrandResponseDto[]> => {
    const response = await api.get<BrandResponseDto[]>('/Product/brands');
    return response.data;
};
