# NNPTUD-S3 Inventory System Documentation

## 📋 Overview
Inventory Management System para sa NNPTUD-S3 e-commerce platform. Sumusuporta ang sistem ng:
- Automatic inventory creation kapag lumilikha ng bagong produkto
- Stock management (add, remove)
- Reservation system
- Product sales tracking

---

## 🗂️ New Files Created

### 1. Schema: `schemas/inventory.js`
```
Model: Inventory
- product: ObjectId (ref: product) - UNIQUE, REQUIRED
- stock: Number (default: 0, min: 0)
- reserved: Number (default: 0, min: 0)
- soldCount: Number (default: 0, min: 0)
- isDeleted: Boolean (default: false)
- timestamps: createdAt, updatedAt
```

### 2. Controller: `controllers/inventory.js`
Naglalaman ng mga business logic functions:
- `CreateInventory(productId)` - Lumilikha ng inventory para sa product
- `GetAllInventories()` - Kunin lahat ng inventories
- `GetInventoryById(id)` - Kunin inventory by ID with product details
- `AddStock(productId, quantity)` - Dagdagan ang stock
- `RemoveStock(productId, quantity)` - Bawasan ang stock
- `Reservation(productId, quantity)` - I-reserve ang produkto (stock ↓, reserved ↑)
- `Sold(productId, quantity)` - I-mark bilang sold (reserved ↓, soldCount ↑)

### 3. Routes: `routes/inventory.js`
REST API endpoints para sa inventory management

### 4. Updated Files
- `app.js` - Added route: `/api/v1/inventory`
- `routes/products.js` - Auto-create inventory kapag lumilikha ng product

---

## 🔌 API Endpoints

### Base URL: `http://localhost:3000/api/v1/inventory`

#### 1. GET All Inventories
```
GET /api/v1/inventory
Response: [
  {
    _id: "...",
    product: {
      _id: "...",
      title: "...",
      price: 100,
      description: "..."
    },
    stock: 50,
    reserved: 10,
    soldCount: 5,
    createdAt: "..."
  }
]
```

#### 2. GET Inventory by ID
```
GET /api/v1/inventory/:id
Response: {
  _id: "...",
  product: { ... },
  stock: 50,
  reserved: 10,
  soldCount: 5
}
```

#### 3. Add Stock
```
POST /api/v1/inventory/add-stock
Body: {
  "product": "66000000000000000000001a",
  "quantity": 100
}
Response: {
  "message": "Stock added successfully",
  "inventory": { ... }
}
```

#### 4. Remove Stock
```
POST /api/v1/inventory/remove-stock
Body: {
  "product": "66000000000000000000001a",
  "quantity": 20
}
Response: {
  "message": "Stock removed successfully",
  "inventory": { ... }
}
```

#### 5. Reservation (Decrease Stock, Increase Reserved)
```
POST /api/v1/inventory/reservation
Body: {
  "product": "66000000000000000000001a",
  "quantity": 5
}
Response: {
  "message": "Product reserved successfully",
  "inventory": {
    stock: 25,    // 30 - 5
    reserved: 5   // 0 + 5
  }
}
```

#### 6. Sold (Decrease Reserved, Increase SoldCount)
```
POST /api/v1/inventory/sold
Body: {
  "product": "66000000000000000000001a",
  "quantity": 3
}
Response: {
  "message": "Product marked as sold successfully",
  "inventory": {
    reserved: 2,   // 5 - 3
    soldCount: 3   // 0 + 3
  }
}
```

---

## 🧪 Testing on Postman

### Step 1: Create a Category (if not exists)
```
POST http://localhost:3000/api/v1/categories
Body:
{
  "name": "Electronics",
  "image": "https://i.imgur.com/example.jpg"
}
Response: Get category ID
```

### Step 2: Create a Product (This will auto-create inventory)
```
POST http://localhost:3000/api/v1/products
Body:
{
  "title": "Laptop Dell XPS 13",
  "description": "High-performance laptop",
  "category": "CATEGORY_ID_HERE",
  "price": 1200,
  "images": ["https://i.imgur.com/image1.jpg"]
}
Response: Get product ID and inventory is created automatically
```

### Step 3: Get All Inventories (with product details)
```
GET http://localhost:3000/api/v1/inventory
Expected: See the product you just created with stock: 0
```

### Step 4: Add Stock (100 units)
```
POST http://localhost:3000/api/v1/inventory/add-stock
Body:
{
  "product": "PRODUCT_ID_HERE",
  "quantity": 100
}
Result: stock = 100
```

### Step 5: Make a Reservation (10 units)
```
POST http://localhost:3000/api/v1/inventory/reservation
Body:
{
  "product": "PRODUCT_ID_HERE",
  "quantity": 10
}
Result: stock = 90, reserved = 10
```

### Step 6: Add More Stock (50 units)
```
POST http://localhost:3000/api/v1/inventory/add-stock
Body:
{
  "product": "PRODUCT_ID_HERE",
  "quantity": 50
}
Result: stock = 140
```

### Step 7: Make Another Reservation (30 units)
```
POST http://localhost:3000/api/v1/inventory/reservation
Body:
{
  "product": "PRODUCT_ID_HERE",
  "quantity": 30
}
Result: stock = 110, reserved = 40
```

### Step 8: Remove Stock (25 units)
```
POST http://localhost:3000/api/v1/inventory/remove-stock
Body:
{
  "product": "PRODUCT_ID_HERE",
  "quantity": 25
}
Result: stock = 85
```

### Step 9: Mark as Sold (20 units)
```
POST http://localhost:3000/api/v1/inventory/sold
Body:
{
  "product": "PRODUCT_ID_HERE",
  "quantity": 20
}
Result: reserved = 20, soldCount = 20
```

### Step 10: Get Final Inventory Status
```
GET http://localhost:3000/api/v1/inventory/:id
Result: 
{
  stock: 85,
  reserved: 20,
  soldCount: 20
}
```

---

## 📊 Flow Example

Scenario: Quản lý laptop inventory

| Operation | Stock | Reserved | SoldCount | Notes |
|-----------|-------|----------|-----------|-------|
| Initial State | 0 | 0 | 0 | Auto-created |
| Add 100 stock | 100 | 0 | 0 | - |
| Reserve 10 | 90 | 10 | 0 | Customer orders 10 |
| Add 50 stock | 140 | 10 | 0 | Restock |
| Reserve 30 | 110 | 40 | 0 | More orders |
| Remove 25 | 85 | 40 | 0 | Damaged goods |
| Sold 20 | 85 | 20 | 20 | 20 out of 40 reserved completed |
| Sold 10 | 85 | 10 | 30 | More orders completed |
| Sold 10 | 85 | 0 | 40 | All reserved orders completed |

---

## ✅ Validation Rules

### Add Stock
- Quantity must be > 0
- Inventory must exist

### Remove Stock
- Quantity must be > 0
- Available stock >= requested quantity
- Inventory must exist

### Reservation
- Quantity must be > 0
- Available stock >= requested quantity
- Inventory must exist

### Sold
- Quantity must be > 0
- Reserved quantity >= requested quantity
- Inventory must exist

---

## 🐛 Error Handling

All endpoints return proper error messages:
```json
{
  "message": "Error description"
}
```

Common errors:
- "Inventory not found" - Product ID does not have inventory
- "Insufficient stock" - Not enough stock for the operation
- "Insufficient reserved quantity" - Not enough reserved for sold operation
- "Product ID and quantity are required" - Missing request body fields

---

## 🔧 Git Commit

```
Commit: feat: Add Inventory system with CRUD operations and stock management
Files changed:
  - controllers/inventory.js (NEW)
  - routes/inventory.js (NEW)
  - schemas/inventory.js (NEW)
  - app.js (UPDATED)
  - routes/products.js (UPDATED)
```

---

## 📝 Notes

1. **Auto-Create Inventory**: Khi lumilikha ng product via POST `/api/v1/products`, automatic na lumilikha rin ng inventory record
2. **Populate Product**: Lahat ng inventory queries ay may included product details (title, price, description)
3. **Soft Delete**: Inventories ay may isDeleted flag, hindi permanent delete
4. **Unique Product**: Bawat product ay may isang inventory record lang (unique constraint)
5. **Timestamps**: Lahat ng inventory records ay may createdAt at updatedAt fields

---

## 🚀 Next Steps (Optional)

1. Add email notifications for low stock alerts
2. Add warehouse location tracking
3. Add batch/serial number support
4. Add inventory audit trail
5. Add real-time inventory sync with frontend
