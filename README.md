# 📝 Todo App – Business Requirements (Nghiệp vụ hệ thống)

## 1. Giới thiệu

Ứng dụng **Todo App** được xây dựng nhằm giúp người dùng quản lý công việc cá nhân một cách hiệu quả: tạo, theo dõi, phân loại và hoàn thành các nhiệm vụ hàng ngày.

---

## 2. Phạm vi chức năng

### 2.1. Quản lý công việc (Task Management)

Hệ thống cho phép người dùng:

* Tạo công việc mới
* Cập nhật thông tin công việc
* Xóa công việc
* Đánh dấu hoàn thành / chưa hoàn thành

**Thông tin của một Task bao gồm:**

* `id`: định danh duy nhất
* `title`: tiêu đề công việc (bắt buộc)
* `description`: mô tả chi tiết
* `status`: trạng thái (TODO / DONE)
* `created_at`: thời gian tạo

---

### 2.2. Hiển thị & lọc dữ liệu

Người dùng có thể:

* Xem danh sách tất cả công việc
* Lọc theo trạng thái:

  * Tất cả
  * Chưa hoàn thành
  * Đã hoàn thành

---

### 2.3. Sắp xếp công việc

Hệ thống hỗ trợ:

* Sắp xếp theo thời gian tạo
* Sắp xếp theo độ ưu tiên (nếu có)

---

## 3. Chức năng mở rộng

### 3.1. Deadline (Hạn chót)

* Gán thời hạn cho công việc
* Hiển thị cảnh báo khi gần đến hạn

**Thuộc tính bổ sung:**

* `deadline`

---

### 3.2. Priority (Độ ưu tiên)

* Mỗi công việc có mức độ ưu tiên:

  * High
  * Medium
  * Low

**Thuộc tính bổ sung:**

* `priority`

---

### 3.3. Tag / Category

* Phân loại công việc theo nhóm
* Một công việc có thể có nhiều tag

---

### 3.4. Tìm kiếm

Hệ thống hỗ trợ tìm kiếm:

* Theo tiêu đề
* Theo tag
* Theo trạng thái

---

## 4. Quản lý người dùng (User Management)

* Đăng ký tài khoản
* Đăng nhập hệ thống
* Mỗi người dùng quản lý danh sách công việc riêng

---

## 5. Thông báo (Notification)

* Nhắc việc khi gần đến deadline
* Có thể triển khai bằng:

  * Timer nội bộ
  * Push notification (tuỳ nền tảng)

---

## 6. Thống kê & báo cáo

* Tổng số công việc
* Số công việc đã hoàn thành
* Tỷ lệ hoàn thành (%)
* Thống kê theo ngày / tuần

---

## 7. Subtask (Công việc con)

* Một công việc có thể chứa nhiều công việc con
* Công việc cha được xem là hoàn thành khi tất cả subtask hoàn thành

---

## 8. Thiết kế dữ liệu (Database Design)

### Bảng `users`

* `id`
* `username`
* `password`

### Bảng `tasks`

* `id`
* `title`
* `description`
* `status`
* `priority`
* `deadline`
* `user_id`
* `created_at`

### Bảng `tags`

* `id`
* `name`

### Bảng `task_tags`

* `task_id`
* `tag_id`

---

## 9. Quy tắc nghiệp vụ (Business Rules)

* Tiêu đề công việc không được để trống
* Deadline phải lớn hơn hoặc bằng thời điểm hiện tại
* Mỗi công việc thuộc về một người dùng
* Không thể sửa/xóa công việc của người dùng khác
* Khi tất cả subtask hoàn thành → task chính tự động hoàn thành

---

## 10. Kiến trúc đề xuất (Architecture)

Áp dụng mô hình:

* **GUI**: Giao diện người dùng
* **BUS (Business Logic)**: Xử lý nghiệp vụ
* **DTO**: Đối tượng truyền dữ liệu
* **DAO**: Truy cập cơ sở dữ liệu

---

## 11. Hướng phát triển nâng cao

* Drag & Drop (kanban style như Trello)
* Dark mode
* Đồng bộ dữ liệu cloud
* Offline mode
* Tích hợp AI gợi ý công việc

---

## 12. Mục tiêu

* Xây dựng một ứng dụng quản lý công việc đơn giản nhưng đầy đủ
* Có thể mở rộng thành sản phẩm thực tế
* Phù hợp làm project CV cho vị trí thực tập Web / Software Engineer

---
