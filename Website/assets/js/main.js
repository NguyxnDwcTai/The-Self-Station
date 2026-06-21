document.addEventListener("DOMContentLoaded", function () {
  // ================= 1. XỬ LÝ HEADER SCROLL =================
  const header = document.querySelector(".header");

  window.addEventListener("scroll", () => {
    // Nếu cuộn xuống hơn 50px thì thêm class 'scrolled'
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // ================= 2. XỬ LÝ SLIDER (TRÁI -> PHẢI) =================
  const images = document.querySelectorAll(".image-transition");
  let currentIndex = 0;

  // Nếu có ảnh, cho ảnh đầu tiên hiển thị
  if (images.length > 0) {
    images[currentIndex].classList.add("active");
  }

  function slideImages() {
    // 1. Ảnh hiện tại trượt sang phải
    const currentImg = images[currentIndex];
    currentImg.classList.remove("active");
    currentImg.classList.add("exit");

    // 2. Tính toán Index của ảnh tiếp theo
    currentIndex = (currentIndex + 1) % images.length;
    const nextImg = images[currentIndex];

    // 3. Chuẩn bị ảnh tiếp theo
    // Tạm thời tắt hiệu ứng (transition: none) để đưa ảnh về lại mép bên TRÁI ngay lập tức
    nextImg.style.transition = "none";
    nextImg.classList.remove("exit");

    // Ép trình duyệt nhận diện vị trí mới (Reflow) trước khi bật lại hiệu ứng
    void nextImg.offsetWidth;

    // Bật lại hiệu ứng và cho ảnh trượt vào vị trí trung tâm
    nextImg.style.transition = "";
    nextImg.classList.add("active");
  }

  // Chuyển ảnh tự động mỗi 4 giây
  if (images.length > 1) {
    setInterval(slideImages, 4000);
  }
});

// ================= 3. XỬ LÝ CHUYỂN TAB VÀ SLIDER SẢN PHẨM =================
const tabs = document.querySelectorAll(".tab-item");
const tracks = document.querySelectorAll(".carousel-track");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
let autoSlideInterval;

// Hàm setup Slider dựa trên số lượng sản phẩm
function updateSliderConstraints(track) {
  const items = track.querySelectorAll(".product-card");
  const isFewItems = items.length <= 4; // Nếu <= 4 sản phẩm

  if (isFewItems) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    track.classList.add("centered"); // Căn giữa nội dung
  } else {
    prevBtn.style.display = "flex";
    nextBtn.style.display = "flex";
    track.classList.remove("centered");
  }

  // Reset vị trí slider về 0
  track.style.transform = `translateX(0)`;
  track.dataset.currentIndex = 0;
}

// Chuyển đổi Tab (Danh mục)
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // 1. Tắt active tất cả tabs và nội dung
    tabs.forEach((t) => t.classList.remove("active"));
    tracks.forEach((t) => t.classList.remove("active"));

    // 2. Bật active tab được click
    tab.classList.add("active");
    const targetId = tab.getAttribute("data-target");
    const activeTrack = document.getElementById(targetId);

    if (activeTrack) {
      activeTrack.classList.add("active");
      updateSliderConstraints(activeTrack);
      resetAutoSlide(); // Reset lại thời gian đếm 20s
    }
  });
});

// Logic Di chuyển Slider
function moveSlider(direction) {
  const activeTrack = document.querySelector(".carousel-track.active");
  if (!activeTrack) return;

  const items = activeTrack.querySelectorAll(".product-card");
  if (items.length <= 4) return; // Không cần cuộn nếu <= 4

  let currentIndex = parseInt(activeTrack.dataset.currentIndex || 0);
  const maxIndex = items.length - 4; // Hiện 4 cái, số lần trượt tối đa là tổng - 4

  if (direction === "next") {
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1; // Hết thì quay về đầu
  } else {
    currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1; // Lùi hết cỡ thì vòng ra cuối
  }

  activeTrack.dataset.currentIndex = currentIndex;

  // Tính toán độ dài trượt (chiều rộng 1 sản phẩm + gap 20px)
  const itemWidth = items[0].offsetWidth + 20;
  activeTrack.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
}

// Sự kiện Nút bấm trái phải
nextBtn.addEventListener("click", () => {
  moveSlider("next");
  resetAutoSlide();
});

// Nút bấm bên trái
prevBtn.addEventListener("click", () => {
  moveSlider("prev");
  resetAutoSlide();
});

// Tự động cuộn sau mỗi 20s
function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    moveSlider("next");
  }, 20000); // 20000ms = 20 giây
}

// Kích hoạt slider đầu tiên khi trang vừa tải xong
const initialTrack = document.querySelector(".carousel-track.active");
if (initialTrack) {
  updateSliderConstraints(initialTrack);
  resetAutoSlide();
}

// ================= 4. XỬ LÝ FORM TÌM KIẾM CỬA HÀNG (TỈNH/THÀNH PHỐ) =================
const citySelect = document.getElementById("city-select");
const wardSelect = document.getElementById("ward-select");

// Gọi API lấy danh sách 63 Tỉnh/Thành Việt Nam
fetch("https://provinces.open-api.vn/api/")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((city) => {
      const option = document.createElement("option");
      option.value = city.code; // Lưu mã thành phố
      option.textContent = city.name;
      citySelect.appendChild(option);
    });
  })
  .catch((error) => console.error("Lỗi khi tải dữ liệu Tỉnh/Thành:", error));

// Sự kiện khi người dùng chọn Thành phố
citySelect.addEventListener("change", function () {
  const cityCode = this.value;

  // Reset và hiển thị trạng thái "Đang tải" ở ô thứ 2
  wardSelect.innerHTML =
    '<option value="" disabled selected>Đang tải dữ liệu...</option>';
  wardSelect.disabled = true;

  // Gọi API lấy danh sách Quận/Huyện dựa trên mã Thành phố vừa chọn (depth=2)
  fetch(`https://provinces.open-api.vn/api/p/${cityCode}?depth=2`)
    .then((response) => response.json())
    .then((data) => {
      // Reset lại option mặc định và mở khóa ô select
      wardSelect.innerHTML =
        '<option value="" disabled selected>Chọn Phường/Xã (Sau Sáp Nhập)</option>';
      wardSelect.disabled = false;

      // Đổ dữ liệu Quận/Huyện/Xã vào
      if (data.districts) {
        data.districts.forEach((district) => {
          const option = document.createElement("option");
          option.value = district.code;
          option.textContent = district.name;
          wardSelect.appendChild(option);
        });
      }
    })
    .catch((error) => {
      console.error("Lỗi khi tải dữ liệu Phường/Xã:", error);
      wardSelect.innerHTML =
        '<option value="" disabled selected>Lỗi tải dữ liệu</option>';
    });
});

// ================= 5. XỬ LÝ SCROLLSPY (CẬP NHẬT MENU KHI CUỘN) =================
const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let currentId = "";

  // Lặp qua từng section để kiểm tra vị trí cuộn
  sections.forEach((section) => {
    // Khoảng cách từ đỉnh trang đến section đó
    const sectionTop = section.offsetTop;

    // Nếu vị trí cuộn hiện tại vượt qua đỉnh của section (trừ hao 100px của Header)
    if (scrollY >= sectionTop - 100) {
      currentId = section.getAttribute("id");
    }
  });

  // Lặp qua từng thẻ a trong menu để bật/tắt class 'active'
  navLinks.forEach((link) => {
    link.classList.remove("active");

    // Nếu href của link trùng với id của section đang hiển thị trên màn hình
    if (link.getAttribute("href") === `#${currentId}`) {
      link.classList.add("active");
    }
  });
});
