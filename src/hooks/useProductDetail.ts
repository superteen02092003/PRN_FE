import { useState, useEffect, useCallback } from 'react';
import {
    getProductDetail,
    getProductReviews,
    getProductBundle,
    createProductReview,
} from '../services/productService';
import type {
    ProductDetailDto,
    ReviewsResponse,
    ReviewFilterParams,
    ProductBundleDto,
    CreateReviewDto,
    ReviewDto,
    PaginationInfo,
} from '../types/product.types';

// ===== useProductDetail Hook =====

interface UseProductDetailResult {
    product: ProductDetailDto | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useProductDetail = (productId: number | null): UseProductDetailResult => {
    const [product, setProduct] = useState<ProductDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async () => {
        if (!productId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getProductDetail(productId);
            setProduct(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch product detail');
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return { product, loading, error, refetch: fetchProduct };
};

// ===== useProductReviews Hook =====

interface UseProductReviewsResult {
    reviews: ReviewsResponse | null;
    pagination: PaginationInfo | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useProductReviews = (
    productId: number | null,
    params: ReviewFilterParams = {}
): UseProductReviewsResult => {
    const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        if (!productId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getProductReviews(productId, params);
            setReviews(data);
            setPagination({
                pageNumber: data.reviews.pageNumber,
                pageSize: data.reviews.pageSize,
                totalCount: data.reviews.totalCount,
                totalPages: data.reviews.totalPages,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
            setReviews(null);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [productId, JSON.stringify(params)]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { reviews, pagination, loading, error, refetch: fetchReviews };
};

// ===== useProductBundle Hook =====

interface UseProductBundleResult {
    bundle: ProductBundleDto | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useProductBundle = (
    productId: number | null,
    isKit: boolean = false
): UseProductBundleResult => {
    const [bundle, setBundle] = useState<ProductBundleDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBundle = useCallback(async () => {
        // Only fetch bundle if the product is a KIT
        if (!productId || !isKit) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getProductBundle(productId);
            setBundle(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch bundle');
            setBundle(null);
        } finally {
            setLoading(false);
        }
    }, [productId, isKit]);

    useEffect(() => {
        fetchBundle();
    }, [fetchBundle]);

    return { bundle, loading, error, refetch: fetchBundle };
};

// ===== useCreateReview Hook =====

interface UseCreateReviewResult {
    createReview: (review: CreateReviewDto) => Promise<ReviewDto | null>;
    loading: boolean;
    error: string | null;
    success: boolean;
    reset: () => void;
}

export const useCreateReview = (productId: number | null): UseCreateReviewResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createReview = useCallback(async (review: CreateReviewDto): Promise<ReviewDto | null> => {
        if (!productId) {
            setError('Product ID is required');
            return null;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            const data = await createProductReview(productId, review);
            setSuccess(true);
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create review';
            setError(message);
            // Re-throw so ReviewForm can catch and display the error
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return { createReview, loading, error, success, reset };
};
