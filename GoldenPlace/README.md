# GoldenPlace Hotel Booking System

GoldenPlace là hệ thống đặt phòng khách sạn gồm:

- Backend: FastAPI, SQLAlchemy async, SQL Server.
- Frontend: React, Vite, TypeScript, Tailwind CSS.
- Database: Microsoft SQL Server, kết nối qua ODBC Driver.

## Yêu Cầu Môi Trường

Cài trước các phần sau:

- Python 3.11 trở lên.
- Node.js 18 trở lên.
- Microsoft SQL Server, ví dụ SQL Server Developer hoặc Express.
- ODBC Driver 17 for SQL Server hoặc ODBC Driver 18 for SQL Server.
- Git nếu chạy từ source mới clone.

Kiểm tra nhanh:

```powershell
python --version
node --version
npm --version
```

Nếu chưa có ODBC Driver, tải từ Microsoft:

- ODBC Driver 17 for SQL Server: https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server

## Cấu Trúc Thư Mục

```text
GoldenPlace/
  backend/       FastAPI API, models, seed data, SQL Server config
  frontend/      React/Vite UI
  Đặt phòng KS/  Figma export/reference images
```

## 1. Setup Backend

Mở terminal tại thư mục root dự án:

```powershell
cd \GoldenPlace
```

Tạo virtual environment:

```powershell
python -m venv .venv
```

Kích hoạt môi trường:

```powershell
.\.venv\Scripts\Activate.ps1
```

Cài dependencies backend:

```powershell
pip install -r backend\requirements.txt
```

## 2. Cấu Hình SQL Server

File cấu hình backend nằm ở:

```text
backend\.env
```

Mặc định dự án dùng Windows Authentication:

```env
DATABASE_URL=mssql+aioodbc://@localhost:1433/GoldenPlace?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes&TrustServerCertificate=yes
```

Nếu máy dùng SQL Server Authentication, ví dụ tài khoản `sa`, đổi thành:

```env
DATABASE_URL=mssql+aioodbc://sa:YourStrong%21Passw0rd@localhost:1433/GoldenPlace?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes
```

Lưu ý:

- `YourStrong%21Passw0rd` là mật khẩu đã URL-encode. Ký tự `!` phải viết là `%21`.
- Nếu dùng ODBC Driver 18, đổi `ODBC+Driver+17+for+SQL+Server` thành `ODBC+Driver+18+for+SQL+Server`.
- Nếu SQL Server chạy instance khác, ví dụ `localhost\SQLEXPRESS`, cần chỉnh server trong URL theo máy đó.

## 3. Tạo Database Và Seed Data

Chạy các lệnh sau từ thư mục `backend`:

```powershell
cd backend
```

Tạo database `GoldenPlace` nếu chưa có:

```powershell
..\.venv\Scripts\python.exe scripts\create_db.py
```

Tạo bảng và seed dữ liệu mẫu:

```powershell
..\.venv\Scripts\python.exe scripts\seed_data.py
```

Sau seed, tài khoản mặc định:

| Loại | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@goldenplace.com` | `password123` |
| Customer | `customer1@gmail.com` | `password123` |
| Customer | `customer2@gmail.com` | `password123` |
| Customer | `customer3@gmail.com` | `password123` |
| Customer | `customer4@gmail.com` | `password123` |
| Customer | `customer5@gmail.com` | `password123` |

## 4. Chạy Backend

Từ thư mục `backend`:

```powershell
..\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend chạy tại:

```text
http://127.0.0.1:8000
```

Kiểm tra health:

```text
http://127.0.0.1:8000/api/health
```

API docs:

```text
http://127.0.0.1:8000/api/docs
```

## 5. Setup Frontend

Mở terminal mới tại thư mục root dự án:

```powershell
cd D:\SUPPORT_FULL\SP_Python_BookingHotel\GoldenPlace\frontend
```

Cài dependencies:

```powershell
npm install
```

Chạy frontend:

```powershell
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## 6. Luồng Chạy Dự Án Mỗi Lần Mở Máy

Terminal 1, chạy backend:

```powershell
cd D:\SUPPORT_FULL\SP_Python_BookingHotel\GoldenPlace\backend
..\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2, chạy frontend:

```powershell
cd D:\SUPPORT_FULL\SP_Python_BookingHotel\GoldenPlace\frontend
npm run dev
```

Mở trình duyệt:

```text
http://localhost:5173
```

Trang admin:

```text
http://localhost:5173/admin/login
```

Đăng nhập admin:

```text
Email: admin@goldenplace.com
Password: password123
```

## 7. Build Kiểm Tra Trước Khi Nộp

Frontend:

```powershell
cd frontend
npm run build
```

Backend compile:

```powershell
cd ..
.\.venv\Scripts\python.exe -m compileall backend\app backend\scripts
```

## 8. Lỗi Thường Gặp

### Không kết nối được SQL Server

Kiểm tra:

- SQL Server service đã chạy chưa.
- `DATABASE_URL` đúng server, port, database, driver chưa.
- Máy có ODBC Driver chưa.
- Nếu dùng SQL Authentication, SQL Server đã bật mixed mode chưa.

### Lỗi ODBC driver not found

Kiểm tra driver đang có:

```powershell
.\.venv\Scripts\python.exe -c "import pyodbc; print(pyodbc.drivers())"
```

Nếu chỉ có Driver 18, đổi trong `.env`:

```env
driver=ODBC+Driver+18+for+SQL+Server
```

### Backend chạy nhưng frontend gọi API lỗi

Kiểm tra backend có chạy chưa:

```text
http://127.0.0.1:8000/api/health
```

Frontend mặc định gọi API ở:

```text
http://127.0.0.1:8000/api/v1
```

### Port 5173 hoặc 8000 bị chiếm

Đổi port backend:

```powershell
..\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8001 --reload
```

Nếu đổi backend port, cần chỉnh base URL frontend trong cấu hình axios.

### Muốn reset data demo

Chạy lại:

```powershell
cd backend
..\.venv\Scripts\python.exe scripts\seed_data.py
```

Lệnh này xóa dữ liệu demo cũ và seed lại user, phòng, dịch vụ, khuyến mãi mẫu.

## 9. Ghi Chú

- Backend tự tạo bảng khi khởi động thông qua `create_tables()`.
- Dữ liệu mẫu nằm trong `backend/scripts/seed_data.py`.
- SQL Server database mặc định là `GoldenPlace`.
- Khi chuyển máy, chỉ cần chỉnh `DATABASE_URL` trong `backend/.env` cho đúng SQL Server của máy đó.
