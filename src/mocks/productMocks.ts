import type {
    ProductResponseDto,
    CategoryResponseDto,
    BrandResponseDto,
} from '../types/product.types';

export const mockProducts: ProductResponseDto[] = [
    {
        productId: 1,
        sku: 'LEGO-001',
        name: 'LEGO Star Wars Millennium Falcon',
        price: 799.99,
        stockQuantity: 15,
        productType: 'Single',
        brand: { brandId: 1, name: 'LEGO' },
        primaryImage: 'https://picsum.photos/seed/lego1/400/400',
        categories: [{ categoryId: 1, name: 'Toys' }],
        inStock: true,
    },
    {
        productId: 2,
        sku: 'ARD-001',
        name: 'Arduino Uno R3 Starter Kit',
        price: 49.99,
        stockQuantity: 50,
        productType: 'Bundle',
        brand: { brandId: 2, name: 'Arduino' },
        primaryImage: 'https://picsum.photos/seed/arduino1/400/400',
        categories: [{ categoryId: 2, name: 'Electronics' }],
        inStock: true,
    },
    {
        productId: 3,
        sku: 'LEGO-002',
        name: 'LEGO Technic Bugatti Chiron',
        price: 349.99,
        stockQuantity: 0,
        productType: 'Single',
        brand: { brandId: 1, name: 'LEGO' },
        primaryImage: 'https://picsum.photos/seed/lego2/400/400',
        categories: [{ categoryId: 1, name: 'Toys' }],
        inStock: false,
    },
    {
        productId: 4,
        sku: 'RASP-001',
        name: 'Raspberry Pi 5 (8GB)',
        price: 89.99,
        stockQuantity: 25,
        productType: 'Single',
        brand: { brandId: 3, name: 'Raspberry Pi' },
        primaryImage: 'https://picsum.photos/seed/raspi/400/400',
        categories: [{ categoryId: 2, name: 'Electronics' }],
        inStock: true,
    },
];

export const mockCategories: CategoryResponseDto[] = [
    { categoryId: 1, name: 'Toys', productCount: 25 },
    { categoryId: 2, name: 'Electronics', productCount: 18 },
    { categoryId: 3, name: 'Games', productCount: 12 },
];

export const mockBrands: BrandResponseDto[] = [
    { brandId: 1, name: 'LEGO', logoUrl: 'https://picsum.photos/seed/lego/100/100', productCount: 30 },
    { brandId: 2, name: 'Arduino', logoUrl: 'https://picsum.photos/seed/arduino/100/100', productCount: 12 },
    { brandId: 3, name: 'Raspberry Pi', logoUrl: 'https://picsum.photos/seed/raspi/100/100', productCount: 8 },
];
