/**
 * Mock data for demo purposes when backend is unavailable.
 * Remove or disable once backend is stable.
 */
import type { ProductResponseDto, CategoryResponseDto, BrandResponseDto } from '@/types/product.types';

// ===== Mock Brands =====
export const MOCK_BRANDS: BrandResponseDto[] = [
    { brandId: 1, name: 'Arduino', productCount: 12 },
    { brandId: 2, name: 'Raspberry Pi', productCount: 8 },
    { brandId: 3, name: 'Adafruit', productCount: 6 },
    { brandId: 4, name: 'SparkFun', productCount: 5 },
    { brandId: 5, name: 'Seeed Studio', productCount: 7 },
    { brandId: 6, name: 'Texas Instruments', productCount: 4 },
    { brandId: 7, name: 'STMicroelectronics', productCount: 9 },
    { brandId: 8, name: 'Espressif', productCount: 6 },
];

// ===== Mock Categories =====
export const MOCK_CATEGORIES: CategoryResponseDto[] = [
    { categoryId: 1, name: 'Microcontrollers', productCount: 12 },
    { categoryId: 2, name: 'Sensors', productCount: 9 },
    { categoryId: 3, name: 'Displays', productCount: 5 },
    { categoryId: 4, name: 'Robotics', productCount: 7 },
    { categoryId: 5, name: 'Power Supply', productCount: 6 },
    { categoryId: 6, name: 'Communication Modules', productCount: 4 },
    { categoryId: 7, name: 'Development Kits', productCount: 10 },
    { categoryId: 8, name: 'Tools & Accessories', productCount: 8 },
    { categoryId: 9, name: 'Actuators', productCount: 5 },
    { categoryId: 10, name: 'Storage', productCount: 3 },
];

// ===== Category Images (map category name → real photo) =====
export const CATEGORY_IMAGES: Record<string, string> = {
    'microcontrollers': 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=300&h=300&fit=crop&q=80',
    'sensors': 'https://images.unsplash.com/photo-1580584126903-c17d41830450?w=300&h=300&fit=crop&q=80',
    'displays': 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=300&h=300&fit=crop&q=80',
    'robotics': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=300&fit=crop&q=80',
    'power supply': 'https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?w=300&h=300&fit=crop&q=80',
    'communication modules': 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=300&h=300&fit=crop&q=80',
    'development kits': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop&q=80',
    'tools & accessories': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop&q=80',
    'actuators': 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=300&h=300&fit=crop&q=80',
    'storage': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=300&h=300&fit=crop&q=80',
};

// ===== Mock Products =====
export const MOCK_PRODUCTS: ProductResponseDto[] = [
    {
        productId: 1001,
        sku: 'ARD-UNO-R4',
        name: 'Arduino Uno R4 WiFi',
        price: 650000,
        stockQuantity: 45,
        productType: 'MODULE',
        brand: { brandId: 1, name: 'Arduino' },
        primaryImage: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=400&fit=crop&q=80',
        categories: [{ categoryId: 1, name: 'Microcontrollers' }],
        inStock: true,
    },
    {
        productId: 1002,
        sku: 'RPI-5-8GB',
        name: 'Raspberry Pi 5 - 8GB RAM',
        price: 1850000,
        stockQuantity: 20,
        productType: 'MODULE',
        brand: { brandId: 2, name: 'Raspberry Pi' },
        primaryImage: 'https://images.unsplash.com/photo-1640955014216-75201056c829?w=400&h=400&fit=crop&q=80',
        categories: [{ categoryId: 1, name: 'Microcontrollers' }],
        inStock: true,
    },
    {
        productId: 1003,
        sku: 'ESP32-DEVKIT',
        name: 'ESP32-S3 DevKitC-1 WiFi + BLE',
        price: 185000,
        stockQuantity: 120,
        productType: 'MODULE',
        brand: { brandId: 3, name: 'Adafruit' },
        primaryImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop&q=80',
        categories: [{ categoryId: 1, name: 'Microcontrollers' }],
        inStock: true,
    },
    {
        productId: 1004,
        sku: 'SEN-DHT22',
        name: 'DHT22 Temperature & Humidity Sensor',
        price: 85000,
        stockQuantity: 200,
        productType: 'COMPONENT',
        brand: { brandId: 3, name: 'Adafruit' },
        primaryImage: 'https://images.unsplash.com/photo-1580584126903-c17d41830450?w=400&h=400&fit=crop&q=80',
        categories: [{ categoryId: 2, name: 'Sensors' }],
        inStock: true,
    },
    {
        productId: 1005,
        sku: 'KIT-ROBOT-ARM',
        name: '6-DOF Robot Arm Kit with Servo Motors',
        price: 1250000,
        stockQuantity: 15,
        productType: 'KIT',
        brand: { brandId: 4, name: 'SparkFun' },
        primaryImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop&q=80',
        categories: [{ categoryId: 4, name: 'Robotics' }],
        inStock: true,
    },
    {
        productId: 1006,
        sku: 'OLED-128X64',
        name: 'OLED Display 1.3" 128x64 I2C',
        price: 65000,
        stockQuantity: 150,
        productType: 'COMPONENT',
        brand: { brandId: 3, name: 'Adafruit' },
        primaryImage: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=400&h=400&fit=crop&q=80',
        categories: [{ categoryId: 3, name: 'Displays' }],
        inStock: true,
    },
    {
        productId: 1007,
        sku: 'KIT-SMART-CAR',
        name: 'Smart Car Robot Kit 4WD with Camera',
        price: 950000,
        stockQuantity: 30,
        productType: 'KIT',
        brand: { brandId: 1, name: 'Arduino' },
        primaryImage: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=400&h=400&fit=crop&q=80',
        categories: [{ categoryId: 4, name: 'Robotics' }],
        inStock: true,
    },
    {
        productId: 1008,
        sku: 'SEN-ULTRA-HC',
        name: 'HC-SR04 Ultrasonic Distance Sensor',
        price: 35000,
        stockQuantity: 300,
        productType: 'COMPONENT',
        brand: { brandId: 4, name: 'SparkFun' },
        primaryImage: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&h=400&fit=crop&q=80',
        categories: [{ categoryId: 2, name: 'Sensors' }],
        inStock: true,
    },
];
