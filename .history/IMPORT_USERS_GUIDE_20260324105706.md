# 📚 User Import from Excel - Complete Guide

## 🎯 Tính Năng

- ✅ Import users từ file Excel (.xlsx)
- ✅ Random 16-character password cho mỗi user
- ✅ Tự động gửi email credential cho user
- ✅ Validation dữ liệu input
- ✅ Transaction support (rollback on error)
- ✅ Detailed error reporting

## 📋 API Endpoints

### 1. Download Sample Excel Template
```
GET /api/v1/upload/generate-sample-users-excel
```
**Response**: Excel file với format mẫu

---

### 2. Import Users from Excel
```
POST /api/v1/upload/import-users
Content-Type: multipart/form-data

Body:
- file: Excel file (.xlsx)
```

**Excel Format** (Required):
```
| Row | Column A (username)  | Column B (email)       |
|-----|----------------------|------------------------|
| 1   | username             | email                  | (Header)
| 2   | nguyen_tuan          | nguyen.tuan@gmail.com  |
| 3   | tran_hung            | hung.tran@gmail.com    |
| ... | ...                  | ...                    |
```

**Response**:
```json
{
  "total": 2,
  "results": [
    {
      "success": true,
      "row": 2,
      "data": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "nguyen_tuan",
        "email": "nguyen.tuan@gmail.com",
        "password": "aB#Cd_EfGhIj1234",
        "message": "Tài khoản đã được tạo và email đã được gửi"
      }
    },
    {
      "success": false,
      "row": 3,
      "data": "Email sai định dạng"
    }
  ]
}
```

---

## 🚀 Quick Start

### Step 1: Cấu hình Mailtrap (IMPORTANT! ⚠️)

1. Đăng nhập vào [mailtrap.io](https://mailtrap.io)
2. Chọn **Inbox** → **Integrations** → **Nodemailer**
3. Copy credentials:

```javascript
// utils/mailHandler.js - Configuration

auth: {
    user: "YOUR_USERNAME_HERE",      // e.g., "a1b2c3d4e5f6g7h8"
    pass: "YOUR_PASSWORD_HERE",      // e.g., "x9y8z7w6v5u4t3s2"
}
```

### Step 2: Create USER Role (if not exists)

```bash
# Option A: Using Postman/curl
POST http://localhost:3000/api/v1/roles
Content-Type: application/json

{
  "name": "USER",
  "description": "Regular user role"
}
```

```bash
# Option B: Using MongoDB directly
db.roles.insertOne({
  name: "USER",
  description: "Regular user role",
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Step 3: Download Sample Excel

**Method A: Browser**
```
http://localhost:3000/api/v1/upload/generate-sample-users-excel
```

**Method B: Terminal**
```bash
curl http://localhost:3000/api/v1/upload/generate-sample-users-excel -o users-sample.xlsx
```

**Method C: Create manually in Excel**
- Column A (Header): `username`
- Column B (Header): `email`
- Add user data from row 2 onwards

### Step 4: Import Users

**Using curl**:
```bash
curl -X POST http://localhost:3000/api/v1/upload/import-users \
  -F "file=@users-sample.xlsx"
```

**Using Postman**:
1. Method: **POST**
2. URL: `http://localhost:3000/api/v1/upload/import-users`
3. Tab: **Body** → **form-data**
4. Key: `file` (change type to **File**)
5. Value: Select your Excel file
6. Click **Send**

**Using Test Script**:
```bash
npm install axios form-data  # if not already installed
node test-import-users.js
```

---

## 🔒 Validation Rules

### Username
- ✅ Required
- ✅ Alphanumeric only (no special characters)
- ✅ Max length: depends on MongoDB schema

### Email
- ✅ Required
- ✅ Valid email format
- ✅ Must be unique
- ✅ Converted to lowercase

### Generated Password
- ✅ Length: exactly 16 characters
- ✅ Contains: uppercase, lowercase, numbers, special characters
- ✅ Example: `aB#Cd_EfGhIj1234`
- ✅ Hashed with bcrypt (salt: 10)

### Role
- ✅ Automatically assigned: USER role
- ✅ Queried from database

---

## 📧 Email Notification

### Email Template

```
From: Admin@ecommerce.com
Subject: Thông tin tài khoản e-commerce
To: user@example.com

Body (HTML):
Tài khoản của bạn đã được tạo.
Username: nguyen_tuan
Password: aB#Cd_EfGhIj1234
```

### View Emails in Mailtrap

1. Go to https://mailtrap.io/inbox
2. Select your project's inbox
3. Find emails from `Admin@ecommerce.com`
4. Click email to view full content

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Import
```
File: users-sample.xlsx
Rows: 4 valid users
Expected: All 4 users created successfully, 4 emails sent
```

### Scenario 2: Partial Success
```
File: mixed-data.xlsx
Row 2: valid ✓
Row 3: invalid email (missing @) ✗
Row 4: valid ✓
Expected: 2 created, 1 error message
```

### Scenario 3: Duplicate Username
```
Existing user: "nguyen_tuan"
Import data: second "nguyen_tuan"
Expected: Error - "Username already exists"
```

### Scenario 4: Validation Errors
```
Missing email header
Or: File type not .xlsx
Expected: Error - "Format không hợp lệ"
```

---

## 🔍 Database Verification

### Check Created Users
```javascript
// MongoDB
db.users.find({ role: ObjectId("USER_ROLE_ID") }, { username: 1, email: 1, password: 1 })
```

### Check Password Hashing
```javascript
// Password should be hashed (bcrypt), not plain text
// Example hashed password: $2b$10$abcdefghijklmnopqrstuvwxyz...
```

---

## ❌ Troubleshooting

### Issue: "Sent 0 emails"
**Cause**: Mailtrap credentials not configured
**Solution**: 
1. Check `utils/mailHandler.js` - verify `auth.user` and `auth.pass`
2. Update with correct credentials from Mailtrap

### Issue: "Role USER not found"
**Cause**: USER role not created in database
**Solution**:
```bash
# Create role via API
POST http://localhost:3000/api/v1/roles
{ "name": "USER", "description": "Regular user" }
```

### Issue: "Email already exists"
**Cause**: User with same email already in database
**Solution**: 
- Use unique emails in Excel file
- Or delete existing user first

### Issue: "Username invalid - alphanumeric only"
**Cause**: Username contains special characters
**Solution**: Use only letters and numbers (a-zA-Z0-9 and underscores)

### Issue: "File format not supported"
**Cause**: Uploaded file is not .xlsx
**Solution**: 
- Save Excel file as `.xlsx` format (not `.xls` or `.csv`)
- Verify file extension

---

## 📊 Response Examples

### ✅ Success Response

```json
{
  "total": 3,
  "results": [
    {
      "success": true,
      "row": 2,
      "data": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "nguyen_tuan",
        "email": "nguyen.tuan@gmail.com",
        "password": "Xy9$mP2@qL5&zW",
        "message": "Tài khoản đã được tạo và email đã được gửi"
      }
    },
    {
      "success": true,
      "row": 3,
      "data": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "tran_hung",
        "email": "hung.tran@gmail.com",
        "password": "aB#Cd_EfGhIj1234",
        "message": "Tài khoản đã được tạo và email đã được gửi"
      }
    },
    {
      "success": false,
      "row": 4,
      "data": "Email không hợp lệ"
    }
  ]
}
```

### ❌ Error Response

```json
{
  "message": "File không được để trống"
}
```

---

## 🔐 Security Notes

1. **Password**: Randomly generated, 16 characters, never hardcoded
2. **Email**: Validated as unique in database
3. **Role**: Always assigned as USER (no privilege escalation)
4. **Password Hashing**: bcrypt with salt 10, never stored in plain text
5. **Session**: Users need to change password on first login (recommended)

---

## 📌 API Reference Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/upload/generate-sample-users-excel` | GET | Download Excel template |
| `/api/v1/upload/import-users` | POST | Import users from Excel |
| `/api/v1/upload/an_image` | POST | Upload single image |
| `/api/v1/upload/multiple_images` | POST | Upload multiple images |
| `/api/v1/upload/excel` | POST | Import products from Excel |

---

## 🎓 Best Practices

1. ✅ Always download template first
2. ✅ Test with small dataset (3-5 users) before bulk import
3. ✅ Verify emails are sent by checking Mailtrap inbox
4. ✅ Check MongoDB for created users
5. ✅ Keep Excel file format consistent
6. ✅ Archive imported users with timestamps for audit trail
7. ✅ Implement rate limiting for large batch imports

---

## 📝 Examples

### Example 1: Import 3 Users
```bash
curl -X POST http://localhost:3000/api/v1/upload/import-users \
  -F "file=@users.xlsx"
```

Response shows 3 successful imports with random passwords.

### Example 2: Change Password on Login
Users can change their auto-generated password:
```
POST /api/v1/auth/changepassword
{ "email": "user@example.com", "oldpassword": "aB#Cd_EfGhIj1234", "newpassword": "NewPass@123" }
```

### Example 3: Reset Password (if forgotten)
```
POST /api/v1/auth/forgotpassword
{ "email": "user@example.com" }
```
User receives reset link via email.

---

**Last Updated**: March 24, 2026
**Version**: 1.0.0
