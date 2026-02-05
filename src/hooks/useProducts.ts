import { useState, useEffect, useCallback } from 'react';
import {
    getProducts,
    getCategories,
    getBrands,
} from '../services/productService';
import type {
    ProductResponseDto,
    CategoryResponseDto,
    BrandResponseDto,
    ProductFilterParams,
} from '../types/product.types';

// ===== useProducts Hook =====

interface UseProductsResult {
    products: ProductResponseDto[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useProducts = (
    filter: ProductFilterParams = {}
): UseProductsResult => {
    const [products, setProducts] = useState<ProductResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProducts(filter);
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filter)]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, refetch: fetchProducts };
};

// ===== useCategories Hook =====

interface UseCategoriesResult {
    categories: CategoryResponseDto[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useCategories = (): UseCategoriesResult => {
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, loading, error, refetch: fetchCategories };
};

// ===== useBrands Hook =====

interface UseBrandsResult {
    brands: BrandResponseDto[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useBrands = (): UseBrandsResult => {
    const [brands, setBrands] = useState<BrandResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBrands = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBrands();
            setBrands(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch brands');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    return { brands, loading, error, refetch: fetchBrands };
};
