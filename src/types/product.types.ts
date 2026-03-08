// ===== Enums =====

export type ProductType = 'MODULE' | 'KIT' | 'COMPONENT';

// ===== API Response Wrapper =====

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ===== Paginated Response =====

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ===== DTOs cơ bản =====

export interface BrandDto {
  brandId: number;
  name: string;
}

export interface CategoryDto {
  categoryId: number;
  name: string;
}

// ===== Response DTOs =====

export interface ProductResponseDto {
  productId: number;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  productType: ProductType;
  brand: BrandDto;
  primaryImage: string | null;
  categories: CategoryDto[];
  inStock: boolean;
}

export interface CategoryResponseDto {
  categoryId: number;
  name: string;
  productCount: number;
}

export interface BrandResponseDto {
  brandId: number;
  name: string;
  logoUrl?: string;
  productCount: number;
}

// ===== Filter Parameters =====

export interface ProductFilterParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  search?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  productType?: ProductType;
}

// ===== Pagination Info =====

export interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ===== Product Detail Types =====

export interface ProductImageDto {
  imageId: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface WarrantyPolicyDto {
  warrantyId: number;
  name: string;
  durationMonths: number;
  description: string;
}

export interface ProductDetailDto {
  productId: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  productType: ProductType;
  brand: BrandDto;
  categories: CategoryDto[];
  images: ProductImageDto[];
  warrantyPolicy: WarrantyPolicyDto | null;
  averageRating: number;
  totalReviews: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
  bundleComponents?: BundleItemDto[];
}

// ===== Review Types =====

export interface ReviewDto {
  reviewId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface ReviewSummaryDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution[];
}

export interface ReviewsResponse {
  summary: ReviewSummaryDto;
  reviews: PaginatedResponse<ReviewDto>;
}

export interface ReviewFilterParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
}

// ===== Bundle Types (for KIT products) =====

export interface BundleItemDto {
  productId: number;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  primaryImage: string | null;
  productType: ProductType;
}

export interface ProductBundleDto {
  kitProductId: number;
  kitName: string;
  totalComponents: number;
  components: BundleItemDto[];
}
