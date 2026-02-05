// ===== Enums =====

export type ProductType = 'MODULE' | 'KIT' | 'COMPONENT';

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
  primaryImage: string;
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
  logoUrl: string;
  productCount: number;
}

// ===== Filter Parameters =====

export interface ProductFilterParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  productType?: ProductType;
}
