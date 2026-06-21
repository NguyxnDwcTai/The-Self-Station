import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LandingPage.css';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Store
const storeIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mockStores = [
  { id: 1, name: "The Self Station - Cầu Giấy", address: "Xuân Thủy, Cầu Giấy, Hà Nội", lat: 21.0362, lng: 105.7891 },
  { id: 2, name: "The Self Station - Hoàn Kiếm", address: "Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội", lat: 21.0285, lng: 105.8542 },
  { id: 3, name: "The Self Station - Quận 3", address: "86-88 Cao Thắng, Quận 3, TP.HCM", lat: 10.7712, lng: 106.6826 },
  { id: 4, name: "The Self Station - Quận 10", address: "Sư Vạn Hạnh, Quận 10, TP.HCM", lat: 10.7766, lng: 106.6685 },
  { id: 5, name: "The Self Station - Đà Nẵng", address: "Nguyễn Văn Linh, Hải Châu, Đà Nẵng", lat: 16.0605, lng: 108.2127 }
];

// Haversine formula to calculate distance between two coordinates in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

// Component to dynamically update map center
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

const StorePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [mapCenter, setMapCenter] = useState([16.047079, 108.206230]); // Default Vietnam center
  const [nearestStore, setNearestStore] = useState(null);

  // Header Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Cities
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/')
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error("Lỗi tải thành phố:", err));
  }, []);

  const handleCityChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedCity(code);
    setSelectedCityName(name);
    setSelectedDistrict('');
    setSelectedDistrictName('');
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

  const handleDistrictChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setSelectedDistrict(code);
    setSelectedDistrictName(name);
  };

  const findNearestStore = async () => {
    if (!selectedCityName || !selectedDistrictName) {
      alert("Vui lòng chọn Tỉnh/Thành phố và Quận/Huyện!");
      return;
    }

    setIsSearching(true);
    try {
      // 1. Geocode the user's selected location using Nominatim (OpenStreetMap)
      const query = encodeURIComponent(`${selectedDistrictName}, ${selectedCityName}, Vietnam`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const userLat = parseFloat(data[0].lat);
        const userLng = parseFloat(data[0].lon);

        // 2. Find the nearest store using Haversine algorithm
        let minDistance = Infinity;
        let closest = null;

        mockStores.forEach(store => {
          const distance = getDistanceFromLatLonInKm(userLat, userLng, store.lat, store.lng);
          if (distance < minDistance) {
            minDistance = distance;
            closest = store;
          }
        });

        // 3. Update map state
        if (closest) {
          setNearestStore(closest);
          setMapCenter([closest.lat, closest.lng]);
        }
      } else {
        alert("Không thể tìm thấy tọa độ cho địa điểm này. Sẽ hiển thị quán mặc định.");
        setNearestStore(mockStores[0]);
        setMapCenter([mockStores[0].lat, mockStores[0].lng]);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm địa điểm:", error);
      alert("Lỗi kết nối bản đồ. Sẽ hiển thị quán mặc định.");
      setNearestStore(mockStores[0]);
      setMapCenter([mockStores[0].lat, mockStores[0].lng]);
    } finally {
      setIsSearching(false);
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
                <li><Link to="/menu-today" style={{ color: isScrolled ? '#000' : '#fff' }}>MÓN ĂN HÔM NAY</Link></li>
                <li><Link to="/store" className="active" style={{ color: isScrolled ? '#000' : '#fff' }}>CỬA HÀNG</Link></li>
                <li><Link to="/promotions" style={{ color: isScrolled ? '#000' : '#fff' }}>KHUYẾN MÃI</Link></li>
                <li><Link to="/#footer" style={{ color: isScrolled ? '#000' : '#fff' }}>LIÊN HỆ</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <div style={{ paddingTop: '100px' }}></div>

      {/* Store Locator */}
      <section id="cua-hang" className="store-locator section">
        <div className="main-content">
          <div className="locator-wrapper" style={{ marginBottom: '40px' }}>
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
                  <select id="ward-select" className="custom-select" disabled={!selectedCity || isLoadingDistricts} value={selectedDistrict} onChange={handleDistrictChange}>
                    <option value="" disabled>{isLoadingDistricts ? 'Đang tải dữ liệu...' : 'Chọn Phường/Xã (Sau Sáp Nhập)'}</option>
                    {districts.map(dist => (
                      <option key={dist.code} value={dist.code}>{dist.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={findNearestStore}
                  disabled={isSearching}
                  className="view-store-btn" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span>{isSearching ? 'ĐANG TÌM KIẾM...' : 'TÌM QUÁN GẦN NHẤT'}</span>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div style={{ width: '100%', height: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '2px solid #eb6933', position: 'relative', zIndex: 1 }}>
             <MapContainer center={mapCenter} zoom={6} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Render all stores */}
                {mockStores.map(store => (
                  <Marker 
                    key={store.id} 
                    position={[store.lat, store.lng]} 
                    icon={nearestStore?.id === store.id ? storeIcon : new L.Icon.Default()}
                  >
                    <Popup>
                      <strong style={{ fontSize: '14px', color: '#eb6933' }}>{store.name}</strong><br />
                      {store.address}
                    </Popup>
                  </Marker>
                ))}
                
                <MapUpdater center={mapCenter} />
             </MapContainer>
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

export default StorePage;
