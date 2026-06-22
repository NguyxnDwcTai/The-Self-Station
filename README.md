<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/coffee.svg" alt="Logo" width="80" height="80">

  # The Self Station - Hệ Thống POS & KDS Toàn Diện

  Mô hình quản lý nhà hàng thông minh, tối ưu hóa quy trình từ khâu gọi món tại quầy thu ngân (POS) đến hệ thống hiển thị nhà bếp (KDS), kết hợp báo cáo và quản trị tập trung.

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
</div>

---

## 🌟 Giới thiệu

**The Self Station** là một hệ thống quản lý nhà hàng/quán cafe được thiết kế với giao diện người dùng (UI/UX) hiện đại, mang phong cách "Premium Dashboard". Hệ thống được chia thành 3 phân hệ chính:

1. **POS (Point of Sale):** Giao diện dành cho thu ngân, hỗ trợ chọn món, gán bàn, áp dụng mã giảm giá, và thanh toán nhanh chóng.
2. **KDS (Kitchen Display System):** Giao diện hiển thị trực tiếp tại khu vực Bếp, tự động cập nhật đơn hàng theo thời gian thực (Real-time) qua WebSockets, hỗ trợ theo dõi trạng thái món ăn (Chờ tiếp nhận, Đang chế biến, Đã xong).
3. **Admin Dashboard:** Khu vực quản trị tập trung giúp quản lý tài khoản, thực đơn, chương trình khuyến mãi và xuất báo cáo doanh thu chi tiết.

## ✨ Tính năng nổi bật

### Phân hệ Thu ngân (POS Cashier)
- 🛒 **Giỏ hàng thông minh:** Gom nhóm món ăn, tính tổng tiền tự động.
- 🎟️ **Khuyến mãi & Khách hàng:** Quét/nhập mã thành viên, áp dụng Voucher giảm giá tức thì.
- 💵 **Tính tiền thối (Change):** Tự động tính toán số tiền cần thối lại khi thanh toán bằng tiền mặt.
- 🚫 **Chặn thanh toán:** Tự động cảnh báo nếu bếp chưa hoàn thành các món ăn (Waiting/Cooking).

### Phân hệ Nhà bếp (KDS)
- ⚡ **Real-time Synchronization:** Cập nhật đơn hàng ngay lập tức khi thu ngân bấm order (sử dụng Socket.io).
- ⏱️ **Theo dõi thời gian:** Tự động đếm thời gian chờ của món ăn, cảnh báo nhấp nháy đỏ khi đơn hàng bị trễ (quá 15 phút).
- 🔔 **Hệ thống thông báo:** Chuông báo âm thanh và pop-up notifications khi có món mới hoặc khách hối thúc.

### Phân hệ Quản trị (Admin)
- 📊 **Báo cáo doanh thu (Reports):** Thống kê trực quan, thiết kế bảng dữ liệu hiện đại, tính toán số lượng/doanh số từng món. In báo cáo dễ dàng.
- 🍔 **Quản lý Menu:** Thêm, sửa, tắt/bật (hết hàng) món ăn theo thời gian thực.
- 🎨 **Thiết kế đồng bộ:** Toàn bộ hệ thống sử dụng chung CSS Design Tokens, nhất quán về UI/UX từ POS đến Admin.

## 🛠️ Công nghệ sử dụng

- **Frontend:** React.js, Vite, Tailwind CSS, Lucide React (Icons).
- **Backend:** Node.js, Express, Socket.io.
- **Trạng thái & Call API:** Axios, Context API / Hooks.

## 🚀 Hướng dẫn cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/the-self-station.git
   cd the-self-station
   ```

2. **Cài đặt & chạy Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Cài đặt & chạy Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📸 Giao diện ứng dụng

Hệ thống theo đuổi phong cách thiết kế phẳng, sử dụng Glassmorphism nhẹ và hệ thống màu cam/đen `var(--dashboard-primary)` tinh tế, mang lại cảm giác thân thiện nhưng vẫn cực kỳ chuyên nghiệp.

> Cảm ơn bạn đã quan tâm đến dự án **The Self Station**!
