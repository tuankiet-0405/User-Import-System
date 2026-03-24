# Hướng dẫn TEST API trên Postman

## **Yêu cầu**
- MongoDB chạy ở `mongodb://localhost:27017/NNPTUD-S3`
- Server Node.js chạy ở `http://localhost:3000`
- Postman

## **Bước 1: Đăng Ký (Register)**

**Method:** POST  
**URL:** `http://localhost:3000/api/v1/auth/register`  
**Content-Type:** application/json

**Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@12345"
}
```

**Expected Response:** `201` - Trả về user object (không có password)

---

## **Bước 2: Đăng Nhập (Login)**

**Method:** POST  
**URL:** `http://localhost:3000/api/v1/auth/login`  
**Content-Type:** application/json

**Body:**
```json
{
  "username": "testuser",
  "password": "Test@12345"
}
```

**Expected Response:** `200` - Trả về JWT token (RS256)

**Lưu token:** Copy token từ response, sẽ dùng cho các request tiếp theo

---

## **Bước 3: Lấy Thông Tin Người Dùng (/me)**

**Method:** GET  
**URL:** `http://localhost:3000/api/v1/auth/me`  
**Content-Type:** application/json

**Headers:** Thêm Authorization header
```
Authorization: <token_from_login>
```

Hoặc đặt token trong Cookie:
```
Cookie: LOGIN_NNPTUD_S3=<token_from_login>
```

**Expected Response:** `200` - Trả về user object đầy đủ

---

## **Bước 4: Đổi Mật Khẩu (ChangePassword)**

**Method:** POST  
**URL:** `http://localhost:3000/api/v1/auth/changepassword`  
**Content-Type:** application/json

**Headers:**
```
Authorization: <token_from_login>
```

**Body:**
```json
{
  "oldPassword": "Test@12345",
  "newPassword": "NewPass@12345"
}
```

**Validation:**
- `oldPassword`: Bắt buộc
- `newPassword`: Bắt buộc + phải là mật khẩu mạnh
  - Tối thiểu 8 ký tự
  - Ít nhất 1 chữ hoa
  - Ít nhất 1 chữ thường
  - Ít nhất 1 số
  - Ít nhất 1 ký tự đặc biệt

**Expected Response:** `200` - { message: "doi mat khau thanh cong" }

---

## **Thông Tin JWT RS256**

- **Algorithm:** RS256 (RSASSA-PKCS1-v1_5 using SHA-256 and RSA)
- **Key Size:** 2048 bits
- **Private Key:** `private.pem` (dùng để sign)
- **Public Key:** `public.pem` (dùng để verify)
- **Duration:** 1 day (1d)

---

## **Các Lỗi Phổ Biến**

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|---------|
| "sai thong tin dang nhap" | Username/password sai | Kiểm tra lại thông tin login |
| "ban dang bi ban" | Account bị lock sau 3 lần sai | Đợi 24 giờ hoặc xoá account |
| "ban chua dang nhap" | Token không hợp lệ/hết hạn | Login lại để lấy token mới |
| Password validation error | Mật khẩu không đủ mạnh | Thêm chữ hoa, số, ký tự đặc biệt |
| "mat khau cu sai" | Old password không khớp | Nhập đúng mật khẩu hiện tại |

---

## **Script Test với cURL**

```bash
# 1. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test@12345"}'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@12345"}'

# 3. /me (thay TOKEN bằng token từ login)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: TOKEN"

# 4. Change Password
curl -X POST http://localhost:3000/api/v1/auth/changepassword \
  -H "Content-Type: application/json" \
  -H "Authorization: TOKEN" \
  -d '{"oldPassword":"Test@12345","newPassword":"NewPass@12345"}'
```
