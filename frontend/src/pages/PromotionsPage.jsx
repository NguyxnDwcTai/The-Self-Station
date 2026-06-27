import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './LandingPage.css'; // Reusing header/footer styles

const PromotionsPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Header Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Promotions Data
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await api.get('/promotions/vouchers');
        const data = res.data?.data || res.data || [];
        
        const now = new Date().getTime();
        // Filter out inactive or ended vouchers
        const activeVouchers = data.filter(v => {
           if (!v.isActive) return false;
           const edUrl = new Date(v.expiryDate).getTime();
           if (now > edUrl) return false;
           return true; // Keep ONGOING and UPCOMING
        });
        
        setVouchers(activeVouchers);
      } catch (error) {
        console.error("Lỗi khi tải Khuyến mãi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  const getVoucherStatusText = (v) => {
    const now = new Date().getTime();
    const stUrl = new Date(v.startDate).getTime();
    if(now < stUrl) return { text: 'Sắp diễn ra', color: '#b26b00', bg: '#fef7e0' };
    return { text: 'Đang diễn ra', color: '#03210b', bg: '#d4edda' };
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
                <li><Link to="/menu-today" style={{ color: isScrolled ? '#000' : '#fff' }}>MÓN ĂN HÔM NAY</Link></li>
                <li><Link to="/store" style={{ color: isScrolled ? '#000' : '#fff' }}>CỬA HÀNG</Link></li>
                <li><Link to="/promotions" className="active" style={{ color: isScrolled ? '#000' : '#fff' }}>KHUYẾN MÃI</Link></li>
                <li><Link to="/#footer" style={{ color: isScrolled ? '#000' : '#fff' }}>LIÊN HỆ</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <div style={{ paddingTop: '120px', backgroundColor: '#fdfaf0', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="main-content">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
             <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#000', marginBottom: '15px' }}>Ưu đãi dành cho bạn</h1>
             <p style={{ fontSize: '16px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>Hàng ngàn mã giảm giá và chương trình khuyến mãi hấp dẫn đang chờ đón bạn. Nhanh tay lưu lại và sử dụng ngay!</p>
          </div>

          {loading ? (
             <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải danh sách khuyến mãi...</div>
          ) : vouchers.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '50px 0', fontSize: '18px', color: '#666' }}>Hiện tại chưa có chương trình khuyến mãi nào.</div>
          ) : (
            <div className="promotions-grid">
              {vouchers.map(v => {
                 const status = getVoucherStatusText(v);
                 return (
                  <div key={v.voucherID} className="ticket">
                    {/* Left side: Graphics/Discount Amount */}
                    <div className="ticket-left">
                       <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0' }}>
                          GIẢM {v.discountType === 1 ? `${v.discountValue}%` : `${parseFloat(v.discountValue || 0).toLocaleString('vi-VN')}K`}
                       </h2>
                       <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                          Đơn tối thiểu {parseFloat(v.minTotalRequired || 0).toLocaleString('vi-VN')}đ
                       </p>
                    </div>

                    {/* Right side: Details */}
                    <div className="ticket-right">
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <span style={{ backgroundColor: status.bg, color: status.color, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                             {status.text}
                          </span>
                       </div>
                       
                       <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a12', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {v.voucherName || `Mã giảm giá đặc biệt ${v.voucherCode}`}
                       </h3>
                       
                       <p style={{ fontSize: '13px', color: '#666', margin: '0 0 15px 0' }}>
                          HSD: {new Date(v.expiryDate).toLocaleDateString('vi-VN')}
                       </p>
                       
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                          <div style={{ backgroundColor: '#f5f5f5', border: '1px dashed #ccc', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', color: '#eb6933', textAlign: 'center', letterSpacing: '1px' }}>
                             {v.voucherCode}
                          </div>
                          <button 
                             onClick={() => copyToClipboard(v.voucherCode)}
                             style={{ width: '100%', backgroundColor: '#eb6933', color: '#fff', border: 'none', padding: '9px 15px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s' }}
                             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d55a29'}
                             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eb6933'}
                          >
                             COPY
                          </button>
                       </div>
                    </div>
                  </div>
                 );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Inline Ticket CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .promotions-grid {
           display: grid;
           grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
           gap: 30px;
        }
        .ticket {
           display: flex;
           height: 200px;
           background-color: #fff;
           border-radius: 12px;
           box-shadow: 0 5px 20px rgba(0,0,0,0.06);
           overflow: hidden;
           position: relative;
           transition: transform 0.3s ease;
        }
        .ticket:hover {
           transform: translateY(-5px);
           box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .ticket-left {
           flex: 0 0 130px;
           background: linear-gradient(135deg, #eb6933, #ff8c5a);
           display: flex;
           flex-direction: column;
           justify-content: center;
           align-items: center;
           text-align: center;
           padding: 15px;
           position: relative;
           border-right: 2px dashed rgba(255,255,255,0.5);
        }
        /* Top and Bottom cutouts for ticket effect */
        .ticket-left::before, .ticket-left::after {
           content: '';
           position: absolute;
           right: -10px;
           width: 20px;
           height: 20px;
           background-color: #fdfaf0;
           border-radius: 50%;
        }
        .ticket-left::before {
           top: -10px;
        }
        .ticket-left::after {
           bottom: -10px;
        }
        .ticket-right {
           flex: 1;
           padding: 20px;
           display: flex;
           flex-direction: column;
           background-color: #fff;
        }
        @media screen and (max-width: 768px) {
           .promotions-grid {
              grid-template-columns: 1fr;
              padding: 0 15px;
           }
        }
      `}} />

      {/* Footer */}
      <footer id="footer" className="footer section" style={{ marginTop: 0 }}>
        <div className="main-content">
          <div className="footer-top">
            <div className="footer-col">
              <h3>GIỚI THIỆU</h3>
              <ul>
                <li><a href="#!">Về Chúng Tôi</a></li>
                <li><a href="#!">Sản phẩm</a></li>
                <li><Link to="/promotions">Khuyến mãi</Link></li>
                <li><a href="#!">Chuyện cà phê</a></li>
                <li><Link to="/store">Cửa Hàng</Link></li>
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

export default PromotionsPage;
