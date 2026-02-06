**MILESTONE 2**

**LUONG HOAT DONG CHO FRONTEND**

Product Catalog & Shopping Cart

*Tai lieu huong dan cho Frontend Team*

1\. Tong Quan Cac Luong Chinh

Milestone 2 bao gom 3 luong chinh ma Frontend can xu ly:

  -------- ------------------ ------------------------------------------------
  **\#**   **Luong**          **Mo ta**

  1        Product Browsing   User xem danh sach san pham, tim kiem, loc, sap
                              xep

  2        Product Detail     User xem chi tiet san pham, hinh anh, reviews,
                              bundle

  3        Shopping Cart      User them/sua/xoa san pham trong gio hang, ap
                              dung coupon
  -------- ------------------ ------------------------------------------------

1.1 Phan Biet User Roles

  --------------- ------------------------------- ------------------------
  **Role**        **Co the lam**                  **Khong the lam**

  Visitor (chua   Xem products, search, filter,   Add to cart, checkout
  login)          sort                            

  Customer (da    Tat ca cua Visitor + Cart +     Quan ly san pham
  login)          Checkout + Review               
  --------------- ------------------------------- ------------------------

2\. Luong 1: Product Browsing (Duyet San Pham)

2.1 User Story

*Khi user vao trang Product List, ho co the:*

-   Xem danh sach san pham (grid hoac list view)

-   Tim kiem san pham theo ten

-   Loc san pham theo Category, Brand, Loai san pham, Khoang gia

-   Sap xep theo gia (tang/giam)

-   Chuyen trang (pagination)

2.2 Flow Diagram

┌─────────────────────────────────────────────────────────────────┐

│ PRODUCT BROWSING FLOW │

└─────────────────────────────────────────────────────────────────┘

\[User vao trang Product List\]

│

▼

┌─────────────────────┐

│ GET /api/products │ ← Load san pham lan dau (page=1, pageSize=12)

│ GET /api/categories │ ← Load danh sach category cho filter

│ GET /api/brands │ ← Load danh sach brand cho filter

└─────────────────────┘

│

▼

\[Hien thi Product Grid + Filter Sidebar + Pagination\]

│

┌───────┼───────┬───────────┬──────────────┐

│ │ │ │ │

▼ ▼ ▼ ▼ ▼

\[Search\] \[Filter\] \[Sort\] \[Change Page\] \[Click Product\]

│ │ │ │ │

└───────┴───────┴───────────┘ │

│ │

▼ ▼

┌─────────────────────┐ ┌─────────────────────┐

│ GET /api/products │ │ Navigate to │

│ ?search=\... │ │ Product Detail Page │

│ &categoryId=\... │ └─────────────────────┘

│ &brandId=\... │

│ &sortBy=price │

│ &page=2 │

└─────────────────────┘

2.3 API Calls Chi Tiet

Buoc 1: Load trang lan dau

Frontend goi 3 API song song:

// Goi dong thoi 3 API

Promise.all(\[

fetch(\'/api/products?page=1&pageSize=12\'),

fetch(\'/api/categories\'),

fetch(\'/api/brands\')

\])

Buoc 2: User thuc hien Filter/Search/Sort

Khi user thay doi bat ky filter nao, Frontend goi lai API products voi
params moi:

// Vi du: User chon Category = \'Sensors\', Sort = \'Price Low to High\'

GET
/api/products?page=1&pageSize=12&categoryId=2&sortBy=price&sortOrder=asc

// Vi du: User search \'arduino\'

GET /api/products?page=1&pageSize=12&search=arduino

// Vi du: User loc theo khoang gia 100k - 500k

GET /api/products?page=1&pageSize=12&minPrice=100000&maxPrice=500000

Buoc 3: Pagination

Khi user click sang trang khac:

// Chuyen sang trang 2, giu nguyen cac filter hien tai

GET
/api/products?page=2&pageSize=12&categoryId=2&sortBy=price&sortOrder=asc

Buoc 4: Search Autocomplete (Optional)

Khi user go vao Search box, Frontend co the goi API search de hien thi
goi y:

// Goi khi user go \>= 2 ky tu, debounce 300ms

GET /api/products/search?q=ard&limit=5

// Response tra ve danh sach goi y

\[

{ \"productId\": 1, \"name\": \"Arduino Uno R3\", \"price\": 350000 },

{ \"productId\": 2, \"name\": \"Arduino Nano\", \"price\": 150000 }

\]

2.4 UI Components Can Co

  ---------------------- ------------------------------------------------
  **Component**          **Chuc nang**

  ProductGrid            Hien thi danh sach san pham dang grid

  ProductCard            Card hien thi 1 san pham (hinh, ten, gia, stock
                         status)

  SearchBox              Input tim kiem voi autocomplete

  CategoryFilter         Dropdown chon category

  BrandFilter            Dropdown chon brand

  PriceRangeFilter       Slider hoac input min/max price

  SortDropdown           Dropdown chon cach sap xep

  Pagination             Component phan trang

  ProductTypeBadge       Badge hien thi MODULE/KIT/COMPONENT

  StockStatus            Hien thi \'In Stock\' hoac \'Out of Stock\'
  ---------------------- ------------------------------------------------

3\. Luong 2: Product Detail (Chi Tiet San Pham)

3.1 User Story

*Khi user click vao 1 san pham, ho co the:*

-   Xem thong tin chi tiet san pham

-   Xem nhieu hinh anh (image gallery)

-   Xem danh gia tu nguoi mua khac

-   Xem cac thanh phan trong KIT (neu san pham la KIT)

-   Them san pham vao gio hang

-   Viet danh gia (neu da mua san pham)

3.2 Flow Diagram

┌─────────────────────────────────────────────────────────────────┐

│ PRODUCT DETAIL FLOW │

└─────────────────────────────────────────────────────────────────┘

\[User click vao 1 san pham\]

│

▼

┌──────────────────────────────┐

│ GET /api/products/{id} │ ← Load chi tiet san pham

└──────────────────────────────┘

│

▼

\[Hien thi Product Detail Page\]

│

┌───────┴────────┬─────────────────┬──────────────────┐

│ │ │ │

▼ ▼ ▼ ▼

\[Load Reviews\] \[Load Bundle\] \[Add to Cart\] \[Write Review\]

│ (neu la KIT) │ │

▼ │ │ │

┌────────────┐ ▼ │ │

│GET /api/ │ ┌────────────┐ │ │

│products/ │ │GET /api/ │ │ │

│{id}/reviews│ │products/ │ │ │

└────────────┘ │{id}/bundle │ │ │

└────────────┘ │ │

▼ ▼

┌──────────────┐ ┌──────────────┐

│ Chuyen sang │ │ POST /api/ │

│ CART FLOW │ │ products/ │

└──────────────┘ │ {id}/reviews │

└──────────────┘

3.3 API Calls Chi Tiet

Buoc 1: Load Product Detail

Khi vao trang, Frontend goi API lay chi tiet san pham:

GET /api/products/1

// Response chua day du thong tin:

// - Thong tin san pham (name, price, description, stock\...)

// - Brand info

// - Categories

// - Images (tat ca hinh anh)

// - Warranty Policy

// - Average rating & total reviews

Buoc 2: Load Reviews (Lazy Load)

Reviews co the load lazy khi user scroll xuong hoac click tab
\'Reviews\':

GET /api/products/1/reviews?page=1&pageSize=10

// Response chua:

// - Summary (averageRating, totalReviews, ratingDistribution)

// - List reviews voi pagination

Buoc 3: Load Bundle (Chi voi KIT)

Neu productType = \'KIT\', Frontend goi them API lay danh sach
components:

// Check trong response cua product detail

if (product.productType === \"KIT\") {

GET /api/products/10/bundle

}

// Response chua danh sach cac san pham con trong KIT

Buoc 4: Add to Cart

Khi user click \'Add to Cart\':

// Kiem tra user da login chua

if (!isLoggedIn) {

// Hien thi thong bao \"Vui long dang nhap de mua hang\"

// Hoac redirect den trang Login

return;

}

// Neu da login, goi API add to cart

POST /api/cart/items

Body: { \"productId\": 1, \"quantity\": 2 }

Buoc 5: Write Review

Khi user click \'Write Review\' (chi hien thi neu da mua san pham):

POST /api/products/1/reviews

Body: { \"rating\": 5, \"comment\": \"San pham tot!\" }

// Luu y: Backend se check user da mua san pham chua

// Neu chua mua -\> tra ve loi 403

3.4 UI Components Can Co

  ---------------------- ------------------------------------------------
  **Component**          **Chuc nang**

  ImageGallery           Hien thi nhieu hinh anh, click de zoom

  ProductInfo            Hien thi ten, gia, SKU, brand, stock

  QuantitySelector       Input chon so luong (+/- buttons)

  AddToCartButton        Button them vao gio (disable neu het hang hoac
                         chua login)

  CategoryTags           Hien thi cac category cua san pham

  WarrantyInfo           Hien thi thong tin bao hanh

  ReviewSummary          Hien thi average rating, rating distribution

  ReviewList             Danh sach reviews voi pagination

  ReviewForm             Form viet review (rating stars + comment)

  BundleComponents       Danh sach san pham trong KIT
  ---------------------- ------------------------------------------------

4\. Luong 3: Shopping Cart (Gio Hang)

4.1 User Story

*Khi user vao trang Cart, ho co the:*

-   Xem danh sach san pham trong gio hang

-   Thay doi so luong san pham

-   Xoa san pham khoi gio

-   Xoa toan bo gio hang

-   Ap dung ma giam gia (coupon)

-   Xem tong tien (subtotal, shipping, discount, total)

-   Chuyen sang trang Checkout

4.2 Flow Diagram

┌─────────────────────────────────────────────────────────────────┐

│ SHOPPING CART FLOW │

└─────────────────────────────────────────────────────────────────┘

\[User click Cart Icon hoac vao trang Cart\]

│

▼

┌─────────────────────┐

│ GET /api/cart │ ← Load gio hang

└─────────────────────┘

│

▼

\[Hien thi Cart Page\]

│

┌───────┼───────┬──────────────┬──────────────┬──────────────┐

│ │ │ │ │ │

▼ ▼ ▼ ▼ ▼ ▼

\[Change\] \[Remove\] \[Clear\] \[Apply Coupon\] \[Remove Coupon\]
\[Checkout\]

\[Qty\] \[Item\] \[All\] │ │ │

│ │ │ │ │ │

▼ ▼ ▼ ▼ ▼ │

┌──────┐ ┌──────┐ ┌──────┐ ┌───────────┐ \[Clear coupon │

│PUT │ │DELETE│ │DELETE│ │POST /api/ │ from state\] │

│/api/ │ │/api/ │ │/api/ │ │cart/ │ │

│cart/ │ │cart/ │ │cart │ │validate- │ │

│items/│ │items/│ │ │ │coupon │ │

│{id} │ │{id} │ │ │ └───────────┘ │

└──────┘ └──────┘ └──────┘ │

│ │ │ │ │

└───────┴───────┴──────────────┘ │

│ │

▼ ▼

\[Reload GET /api/cart\] \[Navigate to Checkout\]

\[Update UI\] (Milestone 3)

4.3 API Calls Chi Tiet

Buoc 1: Load Cart

Khi vao trang Cart:

GET /api/cart

// Response tra ve:

// - cartId

// - items\[\] (productId, name, price, quantity, image, itemTotal)

// - summary (totalItems, subtotal, shippingFee, discount, total)

Buoc 2: Change Quantity

Khi user thay doi so luong:

PUT /api/cart/items/5

Body: { \"quantity\": 3 }

// Sau do reload cart hoac update local state

// Luu y: Neu quantity = 0 -\> backend se xoa item

Buoc 3: Remove Item

Khi user click nut xoa 1 item:

DELETE /api/cart/items/5

// Sau do reload cart hoac update local state

Buoc 4: Clear All

Khi user click \'Clear Cart\':

DELETE /api/cart

// Gio hang se trong rong

Buoc 5: Apply Coupon

Khi user nhap ma giam gia va click \'Apply\':

POST /api/cart/validate-coupon

Body: { \"couponCode\": \"SALE10\" }

// Neu thanh cong:

// - Luu coupon vao state

// - Hien thi discount amount

// - Cap nhat total

// Neu that bai:

// - Hien thi error message (het han, khong du gia tri don hang, \...)

4.4 Xu Ly Dac Biet

4.4.1 Add to Cart tu Product Page

Khi user add to cart tu trang Product Detail:

POST /api/cart/items

Body: { \"productId\": 1, \"quantity\": 2 }

// Cac truong hop can xu ly:

// 1. Thanh cong -\> Hien thi thong bao, cap nhat cart icon

// 2. San pham het hang (stock = 0)

// Response: { \"success\": false, \"message\": \"Product out of stock\"
}

// -\> Hien thi thong bao loi

// 3. So luong vuot qua stock

// Response: { \"success\": false, \"message\": \"Exceeds stock\",
\"availableQuantity\": 5 }

// -\> Hien thi thong bao va so luong con lai

// 4. San pham da co trong cart

// Backend se cong them quantity (khong tao moi)

// -\> Hien thi thong bao thanh cong

4.4.2 Cart Icon trong Header

Cart icon can hien thi so luong items. Co 2 cach xu ly:

// Cach 1: Goi API khi component mount (neu da login)

useEffect(() =\> {

if (isLoggedIn) {

fetchCart(); // GET /api/cart

}

}, \[isLoggedIn\]);

// Cach 2: Dung global state (Redux/Context)

// Khi add/remove/update cart, cap nhat global state

// Cart icon subscribe vao global state

4.4.3 User Chua Login

Neu user chua login:

-   Khong hien thi cart page (redirect ve Login)

-   Button \'Add to Cart\' hien thi \'Login to Purchase\'

-   Click button -\> Redirect ve trang Login

4.5 UI Components Can Co

  ---------------------- ------------------------------------------------
  **Component**          **Chuc nang**

  CartIcon               Icon gio hang trong header voi badge so luong

  CartPage               Trang gio hang chinh

  CartItemList           Danh sach cac san pham trong gio

  CartItem               1 dong san pham (hinh, ten, gia, quantity,
                         subtotal)

  QuantityInput          Input thay doi so luong (+/- buttons)

  RemoveButton           Button xoa 1 item

  ClearCartButton        Button xoa toan bo gio hang

  CouponInput            Input nhap ma giam gia + button Apply

  CartSummary            Hien thi subtotal, shipping, discount, total

  CheckoutButton         Button chuyen sang Checkout

  EmptyCart              Hien thi khi gio hang trong
  ---------------------- ------------------------------------------------

5\. Tong Hop API Endpoints

5.1 Public APIs (Khong can Login)

  ------------ ------------------------------------ -------------------------
  **Method**   **Endpoint**                         **Muc dich**

  GET          /api/products                        Lay danh sach san pham

  GET          /api/products/search?q=\...          Tim kiem san pham

  GET          /api/products/{id}                   Lay chi tiet san pham

  GET          /api/products/{id}/images            Lay hinh anh san pham

  GET          /api/products/{id}/reviews           Lay danh gia san pham

  GET          /api/products/{id}/bundle            Lay components cua KIT

  GET          /api/categories                      Lay danh sach danh muc

  GET          /api/categories/{id}/products        Lay san pham theo danh
                                                    muc

  GET          /api/brands                          Lay danh sach thuong hieu
  ------------ ------------------------------------ -------------------------

5.2 Protected APIs (Can Login - Customer)

  ------------ ------------------------------------ -------------------------
  **Method**   **Endpoint**                         **Muc dich**

  GET          /api/cart                            Lay gio hang

  POST         /api/cart/items                      Them san pham vao gio

  PUT          /api/cart/items/{id}                 Cap nhat so luong

  DELETE       /api/cart/items/{id}                 Xoa 1 san pham

  DELETE       /api/cart                            Xoa toan bo gio hang

  POST         /api/cart/validate-coupon            Kiem tra ma giam gia

  POST         /api/products/{id}/reviews           Viet danh gia
  ------------ ------------------------------------ -------------------------

5.3 Luu Y Quan Trong

-   Protected APIs can gui JWT token trong header: Authorization: Bearer
    {token}

-   Neu token het han hoac khong hop le -\> Response 401 Unauthorized

-   Neu user khong co quyen -\> Response 403 Forbidden

-   Tat ca price deu la VND (so nguyen, vi du: 350000)

-   Shipping fee co dinh: 30,000 VND

-   Pagination mac dinh: page=1, pageSize=12

*\-\-- END OF DOCUMENT \-\--*
