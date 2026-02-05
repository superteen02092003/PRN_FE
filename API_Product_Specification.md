# API Product Specification

Base URL: `/api/Product`

---

## 1. GET `/api/Product`

**Mô tả:** Lấy danh sách sản phẩm với bộ lọc và phân trang

### Query Parameters

| Parameter    | Type      | Required | Default | Description                          |
|-------------|-----------|----------|---------|--------------------------------------|
| `PageNumber` | `int`     | No       | 1       | Số trang                             |
| `PageSize`   | `int`     | No       | 10      | Số item mỗi trang (tối đa 50)        |
| `SearchTerm` | `string`  | No       | null    | Tìm kiếm theo tên sản phẩm           |
| `BrandId`    | `int`     | No       | null    | Lọc theo Brand ID                    |
| `CategoryId` | `int`     | No       | null    | Lọc theo Category ID                 |
| `MinPrice`   | `decimal` | No       | null    | Giá tối thiểu                        |
| `MaxPrice`   | `decimal` | No       | null    | Giá tối đa                           |

### Example Request

```
GET /api/Product?PageNumber=1&PageSize=10&CategoryId=2&MinPrice=50&MaxPrice=500
```

### Response Schema: `ProductResponseDto[]`

```json
[
  {
    "productId": 1,
    "sku": "SKU-001",
    "name": "Product Name",
    "price": 100.00,
    "stockQuantity": 50,
    "productType": "Single",
    "brand": {
      "brandId": 1,
      "name": "Brand Name"
    },
    "primaryImage": "https://example.com/image.jpg",
    "categories": [
      {
        "categoryId": 1,
        "name": "Category Name"
      }
    ],
    "inStock": true
  }
]
```

### Response Fields

| Field           | Type            | Description                           |
|-----------------|-----------------|---------------------------------------|
| `productId`     | `int`           | ID của sản phẩm                       |
| `sku`           | `string`        | Mã SKU sản phẩm                       |
| `name`          | `string`        | Tên sản phẩm                          |
| `price`         | `decimal`       | Giá sản phẩm                          |
| `stockQuantity` | `int`           | Số lượng tồn kho                      |
| `productType`   | `string`        | Loại sản phẩm (Single, Bundle, etc.)  |
| `brand`         | `BrandDto`      | Thông tin thương hiệu                 |
| `primaryImage`  | `string`        | URL ảnh chính                         |
| `categories`    | `CategoryDto[]` | Danh sách danh mục                    |
| `inStock`       | `boolean`       | Trạng thái còn hàng                   |

---

## 2. GET `/api/Product/categories`

**Mô tả:** Lấy tất cả danh mục sản phẩm

### Example Request

```
GET /api/Product/categories
```

### Response Schema: `CategoryResponseDto[]`

```json
[
  {
    "categoryId": 1,
    "name": "Electronics",
    "productCount": 25
  },
  {
    "categoryId": 2,
    "name": "Toys",
    "productCount": 15
  }
]
```

### Response Fields

| Field          | Type     | Description                    |
|----------------|----------|--------------------------------|
| `categoryId`   | `int`    | ID của danh mục                |
| `name`         | `string` | Tên danh mục                   |
| `productCount` | `int`    | Số lượng sản phẩm trong danh mục |

---

## 3. GET `/api/Product/brands`

**Mô tả:** Lấy tất cả thương hiệu sản phẩm

### Example Request

```
GET /api/Product/brands
```

### Response Schema: `BrandResponseDto[]`

```json
[
  {
    "brandId": 1,
    "name": "LEGO",
    "logoUrl": "https://example.com/logo.png",
    "productCount": 30
  },
  {
    "brandId": 2,
    "name": "Arduino",
    "logoUrl": "https://example.com/arduino.png",
    "productCount": 12
  }
]
```

### Response Fields

| Field          | Type     | Description                    |
|----------------|----------|--------------------------------|
| `brandId`      | `int`    | ID của thương hiệu             |
| `name`         | `string` | Tên thương hiệu                |
| `logoUrl`      | `string` | URL logo thương hiệu           |
| `productCount` | `int`    | Số lượng sản phẩm của thương hiệu |

---

## Frontend Fetch Examples

```javascript
const API_BASE = 'http://localhost:5000'; // Thay đổi theo môi trường

// Lấy sản phẩm với filter
const getProducts = async (filter = {}) => {
  const params = new URLSearchParams({
    PageNumber: filter.pageNumber || 1,
    PageSize: filter.pageSize || 10,
    ...(filter.searchTerm && { SearchTerm: filter.searchTerm }),
    ...(filter.brandId && { BrandId: filter.brandId }),
    ...(filter.categoryId && { CategoryId: filter.categoryId }),
    ...(filter.minPrice && { MinPrice: filter.minPrice }),
    ...(filter.maxPrice && { MaxPrice: filter.maxPrice }),
  });
  
  const response = await fetch(`${API_BASE}/api/Product?${params}`);
  return response.json();
};

// Lấy danh sách categories
const getCategories = async () => {
  const response = await fetch(`${API_BASE}/api/Product/categories`);
  return response.json();
};

// Lấy danh sách brands
const getBrands = async () => {
  const response = await fetch(`${API_BASE}/api/Product/brands`);
  return response.json();
};
```

---

*Generated: 2026-01-29*
