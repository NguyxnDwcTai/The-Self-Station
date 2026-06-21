import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './LandingPage.css'; // Reusing header/footer styles

const MenuTodayPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // Header Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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

        setCategories(catRes.data || []);
        // Only show active items
        setMenuItems((itemRes.data || []).filter(item => item.isActive));
      } catch (error) {
        console.error("Lỗi khi tải Menu:", error);
      }
    };
    fetchMenu();
  }, []);

  // ScrollSpy for Categories
  useEffect(() => {
    const handleScrollSpy = () => {
      // Find all category sections
      let currentId = 'all';
      if (window.scrollY < 300) {
        currentId = 'all';
      } else {
        categories.forEach((cat) => {
          const section = document.getElementById(`category-${cat.categoryID}`);
          if (section) {
            const sectionTop = section.offsetTop;
            // if we scrolled past the section (with offset for header)
            if (window.scrollY >= sectionTop - 150) {
              currentId = cat.categoryID;
            }
          }
        });
      }
      setActiveCategory(currentId);
    };

    window.addEventListener('scroll', handleScrollSpy);
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [categories]);

  const scrollToCategory = (id) => {
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(`category-${id}`);
      if (el) {
        window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="landing-page-wrapper">
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`} style={{ backgroundColor: isScrolled ? '#ffffff' : '#000' }}>
        <div className="main-content">
          <div className="header-body">
            <Link to="/"><p className="logo" style={{ color: isScrolled ? '#000' : '#fff' }}>THE SELF STATION</p></Link>
            <nav className="nav">
              <ul>
                <li><Link to="/" style={{ color: isScrolled ? '#000' : '#fff' }}>TRANG CHỦ</Link></li>
                <li><Link to="/#menu-collection" style={{ color: isScrolled ? '#000' : '#fff' }}>"MENU" COLLECTION</Link></li>
                <li><Link to="/menu-today" className="active" style={{ color: isScrolled ? '#000' : '#fff' }}>MÓN ĂN HÔM NAY</Link></li>
                <li><Link to="/store" style={{ color: isScrolled ? '#000' : '#fff' }}>CỬA HÀNG</Link></li>
                <li><Link to="/#khuyen-mai" style={{ color: isScrolled ? '#000' : '#fff' }}>KHUYẾN MÃI</Link></li>
                <li><Link to="/#footer" style={{ color: isScrolled ? '#000' : '#fff' }}>LIÊN HỆ</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <div style={{ paddingTop: '100px', backgroundColor: '#fdfaf0', minHeight: '100vh' }}>
        <div className="menu-today-outer">

          {/* Left Sidebar (Category Index) - Fixed */}
          <aside className="menu-today-sidebar">
            <div className="menu-today-sidebar-inner">
              <h3 className="menu-today-sidebar-title">DANH MỤC</h3>
              <ul className="menu-today-sidebar-list">
                <li
                  onClick={() => scrollToCategory('all')}
                  className={`menu-today-sidebar-item ${activeCategory === 'all' ? 'active' : ''}`}
                >
                  Tất cả món ăn
                </li>
                {categories.map(cat => (
                  <li
                    key={cat.categoryID}
                    onClick={() => scrollToCategory(cat.categoryID)}
                    className={`menu-today-sidebar-item ${activeCategory === cat.categoryID ? 'active' : ''}`}
                  >
                    {cat.categoryName}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Content (Menu Items) */}
          <div className="menu-today-content">
            <h1 className="menu-today-page-title">Thực đơn hôm nay</h1>

            {categories.map(cat => {
              const itemsInCategory = menuItems.filter(item => item.categoryID === cat.categoryID);
              if (itemsInCategory.length === 0) return null;

              return (
                <div key={cat.categoryID} id={`category-${cat.categoryID}`} className="menu-today-section">
                  <h2 className="menu-today-category-title">{cat.categoryName}</h2>
                  <div className="menu-today-grid">
                    {itemsInCategory.map(item => (
                      <div key={item.itemID} className="menu-today-card">
                        <div className="menu-today-card-img-wrap">
                          <img
                            src={item.imageURL || '/landing-assets/img/slide_1_img.jpg'}
                            alt={item.itemName}
                            className="menu-today-card-img"
                          />
                        </div>
                        <h3 className="menu-today-card-name">{item.itemName}</h3>
                        <p className="menu-today-card-price">{parseFloat(item.price).toLocaleString('vi-VN')} đ</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* ===== MENU TODAY LAYOUT ===== */
        .menu-today-outer {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          /* Không dùng grid nữa vì sidebar là fixed,
             content sẽ tự chiếm toàn bộ chiều rộng trừ sidebar */
          display: block;
        }

        /* ===== SIDEBAR ===== */
        .menu-today-sidebar {
          /* Giữ sidebar ở vị trí cố định khi scroll */
          position: fixed;
          top: 100px;
          /* Canh trái dựa theo max-width của outer container:
             (100vw - 1200px) / 2 = phần lề trái + padding 20px */
          left: max(20px, calc((100vw - 1200px) / 2 + 20px));
          width: 240px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          z-index: 100;
        }

        .menu-today-sidebar-inner {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
        }

        .menu-today-sidebar-title {
          font-size: 18px;
          font-weight: 800;
          color: #eb6933;
          margin: 0 0 16px 0;
          letter-spacing: 0.5px;
        }

        .menu-today-sidebar-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .menu-today-sidebar-item {
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          color: #555;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .menu-today-sidebar-item:hover {
          background-color: #fff5f0;
          color: #eb6933;
        }

        .menu-today-sidebar-item.active {
          background-color: #eb6933;
          color: #fff;
          border-left-color: transparent;
        }

        /* ===== CONTENT AREA ===== */
        /* Đẩy content sang phải để không bị sidebar fixed che khuất */
        .menu-today-content {
          margin-left: 280px; /* 240px sidebar + 40px gap */
        }

        .menu-today-page-title {
          font-size: 36px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 32px 0;
        }

        .menu-today-section {
          margin-bottom: 50px;
        }

        .menu-today-category-title {
          font-size: 22px;
          font-weight: 800;
          color: #2d2d2d;
          margin: 0 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #eee;
        }

        /* ===== CARDS ===== */
        .menu-today-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .menu-today-card {
          background: #fff;
          border-radius: 16px;
          padding: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .menu-today-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .menu-today-card-img-wrap {
          width: 100%;
          aspect-ratio: 1 / 1;
          position: relative;
          margin-bottom: 12px;
          overflow: hidden;
          border-radius: 12px;
        }

        .menu-today-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
          transition: transform 0.4s ease;
        }

        .menu-today-card:hover .menu-today-card-img {
          transform: scale(1.05);
        }

        .menu-today-card-name {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }

        .menu-today-card-price {
          font-size: 15px;
          font-weight: 700;
          color: #eb6933;
          margin: 0;
        }

        /* ===== TABLET ===== */
        @media screen and (max-width: 1024px) {
          .menu-today-sidebar {
            width: 200px;
          }

          .menu-today-content {
            margin-left: 224px; /* 200px sidebar + 24px gap */
          }
        }

        /* ===== MOBILE ===== */
        @media screen and (max-width: 768px) {
          .menu-today-outer {
            padding: 20px 16px 60px;
          }

          /* Trên mobile: sidebar không còn fixed, trở về flow bình thường */
          .menu-today-sidebar {
            position: relative;
            top: auto;
            left: auto;
            width: 100%;
            max-height: none;
            overflow-y: visible;
            margin-bottom: 24px;
          }

          .menu-today-sidebar-inner {
            border-radius: 12px;
            padding: 16px;
          }

          .menu-today-sidebar-list {
            flex-direction: row;
            overflow-x: auto;
            flex-wrap: nowrap;
            gap: 8px;
            padding-bottom: 4px;
          }

          .menu-today-sidebar-item {
            white-space: nowrap;
            border-left: none;
            border-bottom: 3px solid transparent;
          }

          .menu-today-sidebar-item:hover {
            border-left-color: transparent;
            border-bottom-color: #eb6933;
          }

          .menu-today-sidebar-item.active {
            border-bottom-color: transparent;
          }

          /* Trên mobile: content không cần margin-left nữa */
          .menu-today-content {
            margin-left: 0;
          }

          .menu-today-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .menu-today-page-title {
            font-size: 26px;
          }
        }
      `}} />
    </div>
  );
};

export default MenuTodayPage;