# Hướng Dẫn Cài Đặt (Setup Guide)

Chào mừng bạn đến với dự án **The Self Station**. Tài liệu này sẽ hướng dẫn bạn chi tiết từng bước để có thể chạy dự án này trên máy cá nhân (Localhost) một cách hoàn hảo nhất.

Hệ thống được chia làm hai phần chính:
- **Backend (Node.js, Express, Socket.io, Prisma, MySQL)**
- **Frontend (React.js, Vite, TailwindCSS)**

---

## 🛠️ Bước 1: Yêu cầu hệ thống (Prerequisites)
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
1. **Node.js**: Phiên bản 16.x hoặc mới hơn (khuyến nghị 18.x hoặc 20.x Lts). Tải tại: [nodejs.org](https://nodejs.org/)
2. **Git**: Để clone mã nguồn. Tải tại: [git-scm.com](https://git-scm.com/)
3. **MySQL**: Hệ quản trị cơ sở dữ liệu. Bạn có thể dùng XAMPP, Laragon, WAMP hoặc cài MySQL Server độc lập.
4. **Phần mềm quản lý Database (Tùy chọn)**: DBeaver, Navicat, MySQL Workbench, hoặc phpMyAdmin (đi kèm XAMPP).

---

## 📥 Bước 2: Clone dự án về máy
Mở Terminal (hoặc Git Bash, Command Prompt) và chạy lệnh sau để tải source code về:
```bash
git clone https://github.com/NguyxnDwcTai/the-self-station.git
cd the-self-station
```

---

## ⚙️ Bước 3: Cài đặt Backend & Cơ sở dữ liệu

### 1. Tạo Database
Mở phần mềm quản lý MySQL của bạn và tạo một cơ sở dữ liệu (database) trống. 
Ví dụ: Tạo database có tên là `the_self_station`.

### 2. Cấu hình biến môi trường (.env)
Di chuyển vào thư mục `backend`:
```bash
cd backend
```
Tạo một file mới có tên là `.env` nằm trong thư mục `backend` (ngang hàng với `package.json`).
Thêm nội dung sau vào file `.env` vừa tạo:
```env
# Thay thế 'root' và 'password' bằng tài khoản MySQL trên máy bạn.
# Nếu dùng XAMPP mặc định, password thường để trống: mysql://root:@localhost:3306/the_self_station
DATABASE_URL="mysql://root:password@localhost:3306/the_self_station"
```

### 3. Cài đặt thư viện và Đồng bộ Database
Chạy các lệnh sau trong terminal (đang ở thư mục `backend`):
```bash
# Cài đặt các gói thư viện (dependencies)
npm install

# Đẩy cấu trúc bảng (schema) từ Prisma vào Database vừa tạo
npx prisma db push
```

### 4. Khởi động Backend
```bash
npm run server
```
*Nếu bạn thấy thông báo "Server is running on port 5000", chúc mừng bạn đã cài đặt backend thành công!*

---

## 🎨 Bước 4: Cài đặt Frontend

Mở một cửa sổ Terminal **mới** (giữ nguyên cửa sổ Terminal của backend đang chạy) và quay lại thư mục gốc của dự án, sau đó vào `frontend`:
```bash
cd frontend
```

Chạy các lệnh sau:
```bash
# Cài đặt thư viện giao diện
npm install

# Khởi động giao diện người dùng
npm run dev
```

Terminal sẽ hiển thị một đường link (thường là `http://localhost:5173`). Bấm vào link đó hoặc copy dán lên trình duyệt (Chrome/Edge/Safari) để xem giao diện ứng dụng.

---

## 📝 Một số lưu ý quan trọng (Troubleshooting)

- **Lỗi không kết nối được Database**: Hãy chắc chắn MySQL của bạn đang chạy (Start MySQL trên XAMPP/Laragon) và kiểm tra lại chuỗi kết nối trong file `.env`.
- **Dữ liệu trống (Blank Data)**: Do bạn vừa mới setup, database sẽ hoàn toàn trống. Bạn cần phải tạo dữ liệu mẫu (như đăng ký tài khoản admin, thêm món ăn vào menu) thông qua các công cụ quản trị Database, hoặc lấy file `.sql` dữ liệu mẫu từ người quản lý dự án để import vào.
- **Port 5000 bị chiếm**: Mặc định backend chạy ở port 5000. Nếu bị xung đột với phần mềm khác, bạn có thể phải đổi port ở backend và cả link API URL trong source code của frontend.

---
*Chúc bạn có những trải nghiệm lập trình tuyệt vời với The Self Station!* ☕🚀
