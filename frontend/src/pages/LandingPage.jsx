import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './LandingPage.css';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('trang-chu');
  
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [sliderIndices, setSliderIndices] = useState({});

  const heroImages = [
    '/landing-assets/img/slide_1_img.jpg',
    '/landing-assets/img/slide_2_img.jpg',
    '/landing-assets/img/slide_3_img.jpg'
  ];
  
  // Header Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Scrollspy
      const sections = ['trang-chu', 'menu-collection', 'cua-hang', 'footer'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActiveSectionId(section);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Menu Data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get('/menu/categories'),
          api.get('/menu')
        ]);
        
        const fetchedCats = catRes.data || [];
        setCategories(fetchedCats);
        
        // Filter out inactive items
        const activeItems = (itemRes.data || []).filter(item => item.isActive);
        setMenuItems(activeItems);

        if (fetchedCats.length > 0) {
          setActiveTab(fetchedCats[0].categoryID);
          // Initialize slider indices
          const initIndices = {};
          fetchedCats.forEach(c => { initIndices[c.categoryID] = 0; });
          setSliderIndices(initIndices);
        }
      } catch (error) {
        console.error("Lỗi khi tải Menu:", error);
      }
    };
    fetchMenu();
  }, []);

  // Hero Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Fetch Cities
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/')
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error("Lỗi tải thành phố:", err));
  }, []);

  const handleCityChange = (e) => {
    const code = e.target.value;
    setSelectedCity(code);
    setIsLoadingDistricts(true);
    setDistricts([]);
    
    fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
      .then(res => res.json())
      .then(data => {
        if (data.districts) setDistricts(data.districts);
        setIsLoadingDistricts(false);
      })
      .catch(err => {
        console.error("Lỗi tải phường xã:", err);
        setIsLoadingDistricts(false);
      });
  };

  const getActiveProducts = () => {
    return menuItems.filter(item => item.categoryID === activeTab);
  };

  // Product Slider Controls
  const moveSlider = (direction) => {
    const items = getActiveProducts();
    if (!items || items.length <= 4) return;
    
    const maxIndex = items.length - 4;
    setSliderIndices(prev => {
      let nextIdx = prev[activeTab] || 0;
      if (direction === 'next') {
        nextIdx = nextIdx >= maxIndex ? 0 : nextIdx + 1;
      } else {
        nextIdx = nextIdx <= 0 ? maxIndex : nextIdx - 1;
      }
      return { ...prev, [activeTab]: nextIdx };
    });
  };

  useEffect(() => {
    const items = getActiveProducts();
    if (items && items.length > 4) {
      const interval = setInterval(() => moveSlider('next'), 20000);
      return () => clearInterval(interval);
    }
  }, [activeTab, sliderIndices, menuItems]);

  const activeProducts = getActiveProducts();

  return (
    <div className="landing-page-wrapper">
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="main-content">
          <div className="header-body">
            <a href="#trang-chu" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}><p className="logo">THE SELF STATION</p></a>
            <nav className="nav">
              <ul>
                <li><a href="#trang-chu" className={activeSectionId === 'trang-chu' ? 'active' : ''}>TRANG CHỦ</a></li>
                <li><a href="#menu-collection" className={activeSectionId === 'menu-collection' ? 'active' : ''}>"MENU" COLLECTION</a></li>
                <li><Link to="/menu-today">MÓN ĂN HÔM NAY</Link></li>
                <li><Link to="/store" className={activeSectionId === 'cua-hang' ? 'active' : ''}>CỬA HÀNG</Link></li>
                <li><Link to="/promotions">KHUYẾN MÃI</Link></li>
                <li><a href="#footer">LIÊN HỆ</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main id="trang-chu" className="section">
        <div className="hero">
          <div className="main-content">
            <div className="body">
              {heroImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="Hero"
                  className={`image-transition ${idx === currentHeroIndex ? 'active' : (idx === (currentHeroIndex - 1 + heroImages.length) % heroImages.length ? 'exit' : '')}`}
                  style={{ transition: idx === currentHeroIndex || idx === (currentHeroIndex - 1 + heroImages.length) % heroImages.length ? 'transform 1s ease-in-out' : 'none' }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="branch-desc">
        <div className="marquee-track">
          <div className="marquee-group">
            <p>ĂN LÀ DÍNH, KHÔNG TÍNH ĐƯỜNG VỀ</p>
            <span className="dot">•</span>
            <p>ĂN LÀ DÍNH, KHÔNG TÍNH ĐƯỜNG VỀ</p>
            <span className="dot">•</span>
            <p>ĂN LÀ DÍNH, KHÔNG TÍNH ĐƯỜNG VỀ</p>
            <span className="dot">•</span>
            <p>ĂN LÀ DÍNH, KHÔNG TÍNH ĐƯỜNG VỀ</p>
            <span className="dot">•</span>
          </div>
          <div className="marquee-group">
            <p>ĂN LÀ DÍNH, KHÔNG TÍNH ĐƯỜNG VỀ</p>
            <span className="dot">•</span>
            <p>ĂN LÀ DÍNH, KHÔNG TÍNH ĐƯỜNG VỀ</p>
            <span className="dot">•</span>
            <p>ĂN LÀ DÍNH, KHÔNG TÍNH ĐƯỜNG VỀ</p>
            <span className="dot">•</span>
            <p>ĂN LÀ DÍNH, KHÔNG TÍNH ĐƯỜNG VỀ</p>
            <span className="dot">•</span>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section id="menu-collection" className="featured-products section">
        <div className="main-content">
          <div className="curved-text">
            <svg viewBox="0 0 400 60" className="curve-svg">
              <path id="curve-path" fill="transparent" d="M50,50 Q200,10 350,50" />
              <text fontWeight="800" fill="#2d2d2d" fontSize="16" letterSpacing="2">
                <textPath href="#curve-path" startOffset="50%" textAnchor="middle">
                  FEATURED PRODUCT
                </textPath>
              </text>
            </svg>
          </div>
          <h2 className="collection-title">“MENU” COLLECTION</h2>

          <ul className="product-tabs">
            {categories.map(cat => {
               const count = menuItems.filter(item => item.categoryID === cat.categoryID).length;
               return (
                 <li 
                   key={cat.categoryID} 
                   className={`tab-item ${activeTab === cat.categoryID ? 'active' : ''}`} 
                   onClick={() => setActiveTab(cat.categoryID)}
                 >
                   {cat.categoryName}<sup>{count}</sup>
                 </li>
               );
            })}
          </ul>

          <div className="carousel-wrapper">
            {activeProducts.length > 4 && (
              <button className="nav-btn prev-btn" onClick={() => moveSlider('prev')}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            )}

            <div className="carousel-container">
              <div 
                className={`carousel-track active ${activeProducts.length <= 4 ? 'centered' : ''}`}
                style={{ transform: `translateX(-${(sliderIndices[activeTab] || 0) * (100/4)}%)` }}
              >
                {activeProducts.map(p => (
                  <div key={p.itemID} className="product-card">
                    <div className="img-wrap">
                      <img src={p.imageURL || '/landing-assets/img/slide_1_img.jpg'} alt={p.itemName} />
                      {/* Removed the 20% privilege badge as requested */}
                    </div>
                    <p className="sub-name">{p.category?.categoryName || p.categoryID}</p>
                    <h3 className="prod-name">{p.itemName}</h3>
                    <p className="prod-price">{parseFloat(p.price).toLocaleString('vi-VN')} đ</p>
                  </div>
                ))}
              </div>
            </div>

            {activeProducts.length > 4 && (
              <button className="nav-btn next-btn" onClick={() => moveSlider('next')}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Store Locator */}
      <section id="cua-hang" className="store-locator section">
        <div className="main-content">
          <div className="locator-wrapper">
            <div className="locator-left">
              <img src="/landing-assets/icon/stickerset-stores3.png" alt="" className="sticker sticker-1" />
              <div className="text-content">
                <h2 className="locator-title">Tìm nhà gần bạn</h2>
                <p className="locator-desc">
                  Dù bạn ở đâu, "Nhà" cũng luôn ở gần.<br />
                  Hãy tìm một góc Nhà để nhâm nhi tách cà phê, lắng nghe bản nhạc<br />
                  quen và tận hưởng những khoảnh khắc nhỏ vui vẻ trong ngày.
                </p>
              </div>
            </div>

            <div className="locator-right">
              <img src="/landing-assets/icon/stickerset-stores_1.png" alt="" className="sticker sticker-3" />
              <div className="form-group">
                <div className="custom-select-wrapper">
                  <select id="city-select" className="custom-select" value={selectedCity} onChange={handleCityChange}>
                    <option value="" disabled>Chọn Thành phố</option>
                    {cities.map(city => (
                      <option key={city.code} value={city.code}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div className="custom-select-wrapper">
                  <select id="ward-select" className="custom-select" disabled={!selectedCity || isLoadingDistricts} defaultValue="">
                    <option value="" disabled>{isLoadingDistricts ? 'Đang tải dữ liệu...' : 'Chọn Phường/Xã (Sau Sáp Nhập)'}</option>
                    {districts.map(dist => (
                      <option key={dist.code} value={dist.code}>{dist.name}</option>
                    ))}
                  </select>
                </div>
                <Link to="/store" className="view-store-btn">
                  <span>XEM DANH SÁCH CỬA HÀNG</span>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="footer section">
        <div className="main-content">
          <div className="footer-top">
            <div className="footer-col">
              <h3>GIỚI THIỆU</h3>
              <ul>
                <li><a href="#!">Về Chúng Tôi</a></li>
                <li><a href="#!">Sản phẩm</a></li>
                <li><a href="#!">Khuyến mãi</a></li>
                <li><a href="#!">Chuyện cà phê</a></li>
                <li><a href="#!">Cửa Hàng</a></li>
                <li><a href="#!">Tuyển dụng</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>ĐIỀU KHOẢN</h3>
              <ul>
                <li><a href="#!">Điều khoản sử dụng</a></li>
                <li><a href="#!">Chính sách bảo mật thông tin</a></li>
                <li><a href="#!">Hướng dẫn xuất hóa đơn GTGT</a></li>
              </ul>
            </div>
            <div className="footer-col contact-col">
              <h3>© 2025 THE SELF STATION</h3>
              <p><span className="highlight">VPGG:</span> Tầng 6, Toà nhà Toyota, Số 315 Trường Chinh, P.Khương Mai, Q.Thanh Xuân, TP Hà Nội, Việt Nam</p>
              <p><span className="highlight">Đặt hàng:</span> 1800 6936</p>
              <p><span className="highlight">Email:</span> support.hn@ggg.com.vn</p>
            </div>
            <div className="footer-col brand-col">
              <h2 className="footer-logo">THE SELF STATION</h2>
              <div className="social-section">
                <h3>FOLLOW US</h3>
                <div className="social-icons">
                  <a href="#!"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                  <a href="#!"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon></svg></a>
                  <a href="#!"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Công ty cổ phần thương mại dịch vụ The Self Station</p>
            <p>Mã số DN: 0312867172 do sở kế hoạch và đầu tư tp. HCM cấp ngày 23/07/2014. Người đại diện: NGUYỄN ĐỨC TÀI</p>
            <p>Địa chỉ: 86-88 Cao Thắng, phường 04, quận 3, tp Hồ Chí Minh | Điện thoại: (028) 7107 8079 | Email: hi@theselfstation.vn</p>
            <p>© 2014-2025 Công ty cổ phần thương mại dịch vụ The Self Station mọi quyền bảo lưu</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
