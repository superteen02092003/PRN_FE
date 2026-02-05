# Frontend Requirements - Shop Page

> **Tài liệu yêu cầu cho team Frontend**
> **Ngày tạo:** 05/02/2026
> **Module:** Trang Shop (Danh sách sản phẩm)

---

## Mục lục
1. [Tổng quan Layout](#1-tổng-quan-layout)
2. [API Endpoints cần sử dụng](#2-api-endpoints-cần-sử-dụng)
3. [Chi tiết từng API](#3-chi-tiết-từng-api)
4. [Hướng dẫn Fetch API](#4-hướng-dẫn-fetch-api)
5. [TypeScript Interfaces](#5-typescript-interfaces)
6. [Flow hoạt động](#6-flow-hoạt-động)
7. [UI Components cần thiết](#7-ui-components-cần-thiết)

---

## 1. Tổng quan Layout

### Wireframe đề xuất

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER (Navigation, Search, Cart)                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  BREADCRUMB: Home > Shop                                                │
├─────────────────┬───────────────────────────────────────────────────────┤
│                 │  TOOLBAR                                               │
│   SIDEBAR       │  ┌─────────────────────────────────────────────────┐  │
│   (280px)       │  │ Hiển thị X sản phẩm    |  Sắp xếp: [Dropdown ▼] │  │
│                 │  └─────────────────────────────────────────────────┘  │
│  ┌───────────┐  │                                                       │
│  │ SEARCH    │  │  PRODUCT GRID                                         │
│  │ [_______] │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  └───────────┘  │  │  IMG    │ │  IMG    │ │  IMG    │ │  IMG    │     │
│                 │  │ ─────── │ │ ─────── │ │ ─────── │ │ ─────── │     │
│  ┌───────────┐  │  │ Name    │ │ Name    │ │ Name    │ │ Name    │     │
│  │ CATEGORIES│  │  │ Price   │ │ Price   │ │ Price   │ │ Price   │     │
│  │ □ Arduino │  │  │ ★★★★☆  │ │ ★★★★☆  │ │ ★★★★☆  │ │ ★★★★☆  │     │
│  │ □ Sensors │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│  │ □ Modules │  │                                                       │
│  │ □ Kits    │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  └───────────┘  │  │  IMG    │ │  IMG    │ │  IMG    │ │  IMG    │     │
│                 │  │ ─────── │ │ ─────── │ │ ─────── │ │ ─────── │     │
│  ┌───────────┐  │  │ Name    │ │ Name    │ │ Name    │ │ Name    │     │
│  │ BRANDS    │  │  │ Price   │ │ Price   │ │ Price   │ │ Price   │     │
│  │ □ Arduino │  │  │ ★★★★☆  │ │ ★★★★☆  │ │ ★★★★☆  │ │ ★★★★☆  │     │
│  │ □ Raspber │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│  │ □ Adafrui │  │                                                       │
│  └───────────┘  │  ┌─────────────────────────────────────────────────┐  │
│                 │  │        ◄  1  2  3  4  5  ...  10  ►             │  │
│  ┌───────────┐  │  └─────────────────────────────────────────────────┘  │
│  │ PRICE     │  │                                                       │
│  │ [___] -   │  │                                                       │
│  │ [___]     │  │                                                       │
│  │ [Apply]   │  │                                                       │
│  └───────────┘  │                                                       │
└─────────────────┴───────────────────────────────────────────────────────┘
```

---

## 2. API Endpoints cần sử dụng

| API | Mục đích | Khi nào gọi |
|-----|----------|-------------|
| `GET /api/Product` | Lấy danh sách sản phẩm | Khi load trang, khi filter, khi phân trang |
| `GET /api/Product/categories` | Lấy danh sách Categories | Khi load trang lần đầu |
| `GET /api/Product/brands` | Lấy danh sách Brands | Khi load trang lần đầu |

**Base URL:** `{API_BASE_URL}/api/Product`

---

## 3. Chi tiết từng API

### 3.1. GET /api/Product - Lấy danh sách sản phẩm

**Mục đích:** Hiển thị Product Grid với filter và phân trang

#### Query Parameters

| Parameter | Type | Bắt buộc | Default | Mô tả |
|-----------|------|----------|---------|-------|
| `searchTerm` | string | Không | null | Tìm kiếm theo tên sản phẩm |
| `brandId` | int | Không | null | Filter theo thương hiệu |
| `categoryId` | int | Không | null | Filter theo danh mục |
| `minPrice` | decimal | Không | null | Giá tối thiểu (VND) |
| `maxPrice` | decimal | Không | null | Giá tối đa (VND) |
| `pageNumber` | int | Không | 1 | Trang hiện tại |
| `pageSize` | int | Không | 10 | Số sản phẩm/trang (max: 50) |

#### Response Example

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "productId": 1,
        "sku": "ARD-UNO-001",
        "name": "Arduino Uno R3",
        "price": 250000,
        "stockQuantity": 50,
        "productType": "MODULE",
        "brand": {
          "brandId": 1,
          "name": "Arduino"
        },
        "primaryImage": "https://example.com/images/arduino-uno.jpg",
        "categories": [
          {
            "categoryId": 1,
            "name": "Microcontrollers"
          }
        ],
        "inStock": true
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 100,
    "totalPages": 10
  }
}
```

---

### 3.2. GET /api/Product/categories - Lấy danh sách Categories

**Mục đích:** Hiển thị sidebar filter theo Category

#### Response Example

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "categoryId": 1,
      "name": "Microcontrollers",
      "productCount": 50
    },
    {
      "categoryId": 2,
      "name": "Sensors",
      "productCount": 120
    },
    {
      "categoryId": 3,
      "name": "Development Boards",
      "productCount": 35
    }
  ]
}
```

---

### 3.3. GET /api/Product/brands - Lấy danh sách Brands

**Mục đích:** Hiển thị sidebar filter theo Brand

#### Response Example

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "brandId": 1,
      "name": "Arduino",
      "productCount": 25
    },
    {
      "brandId": 2,
      "name": "Raspberry Pi",
      "productCount": 15
    },
    {
      "brandId": 3,
      "name": "Adafruit",
      "productCount": 40
    }
  ]
}
```

---

## 4. Hướng dẫn Fetch API

### 4.1. Sử dụng Fetch API (Vanilla JS)

```javascript
const API_BASE_URL = 'https://your-api-domain.com';

// Fetch Products với filter
async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();

  if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
  if (filters.brandId) params.append('brandId', filters.brandId);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  params.append('pageNumber', filters.pageNumber || 1);
  params.append('pageSize', filters.pageSize || 12);

  const response = await fetch(`${API_BASE_URL}/api/Product?${params}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
}

// Fetch Categories
async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/api/Product/categories`);
  const data = await response.json();
  return data.data;
}

// Fetch Brands
async function fetchBrands() {
  const response = await fetch(`${API_BASE_URL}/api/Product/brands`);
  const data = await response.json();
  return data.data;
}
```

### 4.2. Sử dụng Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api-domain.com/api',
});

// Fetch Products
export const getProducts = async (filters) => {
  const { data } = await api.get('/Product', { params: filters });
  return data.data;
};

// Fetch Categories
export const getCategories = async () => {
  const { data } = await api.get('/Product/categories');
  return data.data;
};

// Fetch Brands
export const getBrands = async () => {
  const { data } = await api.get('/Product/brands');
  return data.data;
};
```

### 4.3. React Custom Hook Example

```typescript
import { useState, useEffect } from 'react';

interface UseProductsParams {
  searchTerm?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  pageNumber?: number;
  pageSize?: number;
}

export function useProducts(params: UseProductsParams) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProducts(params);
        setProducts(data.items);
        setPagination({
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(params)]);

  return { products, pagination, loading, error };
}
```

---

## 5. TypeScript Interfaces

```typescript
// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// Paginated Response
interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Product Item (trong danh sách)
interface ProductListItem {
  productId: number;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  productType: 'MODULE' | 'KIT' | 'COMPONENT';
  brand: BrandDto;
  primaryImage: string | null;
  categories: CategoryDto[];
  inStock: boolean;
}

// Brand
interface BrandDto {
  brandId: number;
  name: string;
}

// Category
interface CategoryDto {
  categoryId: number;
  name: string;
}

// Category với số lượng sản phẩm (từ /categories)
interface CategoryWithCount {
  categoryId: number;
  name: string;
  productCount: number;
}

// Brand với số lượng sản phẩm (từ /brands)
interface BrandWithCount {
  brandId: number;
  name: string;
  productCount: number;
}

// Filter parameters
interface ProductFilter {
  searchTerm?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  pageNumber?: number;
  pageSize?: number;
}
```

---

## 6. Flow hoạt động

### 6.1. Khi load trang Shop lần đầu

```
┌─────────────────────────────────────────────────────────────┐
│                    PAGE LOAD                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   GET /Product      GET /categories    GET /brands
   (page=1)
         │                 │                 │
         ▼                 ▼                 ▼
  Render Grid       Render Sidebar    Render Sidebar
                    Categories        Brands
```

**Lưu ý:** 3 API này có thể gọi song song (Promise.all) để tối ưu performance.

```javascript
// Load trang lần đầu - gọi song song
const loadShopPage = async () => {
  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    getProducts({ pageNumber: 1, pageSize: 12 }),
    getCategories(),
    getBrands(),
  ]);

  // Render UI với data
};
```

### 6.2. Khi user filter hoặc phân trang

```
┌─────────────────────────────────────────────────────────────┐
│  User action: Chọn Category / Brand / Nhập Search / Đổi trang │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              Update filter state
                           │
                           ▼
              GET /api/Product?{filters}
                           │
                           ▼
              Re-render Product Grid + Pagination
```

**Lưu ý:** Khi filter thay đổi, chỉ cần gọi lại API `/api/Product`. Không cần gọi lại categories/brands.

---

## 7. UI Components cần thiết

### 7.1. Sidebar Components

| Component | Data source | Chức năng |
|-----------|-------------|-----------|
| `SearchInput` | - | Nhập searchTerm, debounce 300ms |
| `CategoryFilter` | `/categories` | Checkbox list, hiển thị productCount |
| `BrandFilter` | `/brands` | Checkbox list, hiển thị productCount |
| `PriceRangeFilter` | - | 2 input: minPrice, maxPrice |

### 7.2. Main Content Components

| Component | Data source | Chức năng |
|-----------|-------------|-----------|
| `ProductGrid` | `/Product` | Grid 4 cột, hiển thị product cards |
| `ProductCard` | item trong products | Ảnh, tên, giá, brand, inStock badge |
| `Pagination` | pagination info | Điều hướng trang |
| `ResultsToolbar` | totalCount | Hiển thị "Showing X of Y products" |

### 7.3. ProductCard Layout

```
┌─────────────────────────┐
│      [Product Image]    │
│                         │
├─────────────────────────┤
│ Brand Name              │
│ Product Name            │
│ ★★★★☆ (4.5)            │
│ 250.000 ₫              │
│                         │
│ [In Stock] / [Out]      │
│ [Add to Cart]           │
└─────────────────────────┘
```

---

## 8. Lưu ý quan trọng

### 8.1. Performance
- Categories và Brands chỉ cần fetch 1 lần khi load trang
- Sử dụng debounce cho search input (300-500ms)
- Consider caching categories/brands trong localStorage

### 8.2. UX
- Hiển thị loading state khi đang fetch products
- Reset về page 1 khi thay đổi filter
- Giữ filter state trong URL (query params) để user có thể share link

### 8.3. Error Handling
- Hiển thị thông báo lỗi nếu API fail
- Fallback UI khi không có sản phẩm nào

### 8.4. Responsive
- Desktop: Grid 4 cột, sidebar 280px
- Tablet: Grid 3 cột, sidebar collapse
- Mobile: Grid 2 cột, sidebar thành modal/drawer

---

## 9. Checklist cho FE Team

- [ ] Setup API service với base URL
- [ ] Tạo TypeScript interfaces
- [ ] Implement custom hooks (useProducts, useCategories, useBrands)
- [ ] Tạo Sidebar components
- [ ] Tạo ProductGrid + ProductCard
- [ ] Tạo Pagination component
- [ ] Xử lý filter logic
- [ ] URL sync với filter state
- [ ] Loading/Error states
- [ ] Responsive design
- [ ] Unit tests

---

**Liên hệ Backend team nếu có thắc mắc!**
