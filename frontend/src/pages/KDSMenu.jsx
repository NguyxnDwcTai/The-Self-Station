import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Layers, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import CustomDropdown from '../components/ui/CustomDropdown';

const API_BASE_URL = 'http://localhost:5000/api';

const KDSMenu = ({ showToast }) => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [togglingItems, setTogglingItems] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/menu/categories`),
        axios.get(`${API_BASE_URL}/menu`)
      ]);
      setCategories(catsRes.data);
      setMenuItems(itemsRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thực đơn:", error);
      showToast('Không thể tải thực đơn. Vui lòng thử lại!', 'error');
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = !item.isActive;
    
    // Set toggling state
    setTogglingItems(prev => ({ ...prev, [item.itemID]: true }));

    // Optimistic UI update
    setMenuItems(prev => prev.map(m => 
      m.itemID === item.itemID ? { ...m, isActive: newStatus } : m
    ));

    try {
      await axios.put(`${API_BASE_URL}/menu/${item.itemID}`, {
        isActive: newStatus
      });
      showToast('Cập nhật trạng thái thành công', 'success');
    } catch (error) {
      // Rollback
      setMenuItems(prev => prev.map(m => 
        m.itemID === item.itemID ? { ...m, isActive: item.isActive } : m
      ));
      showToast('Lỗi khi cập nhật trạng thái món ăn', 'error');
    } finally {
      // Clear toggling state
      setTogglingItems(prev => {
        const next = { ...prev };
        delete next[item.itemID];
        return next;
      });
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.categoryID === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.categoryID]) {
      acc[item.categoryID] = {
        categoryInfo: categories.find(c => c.categoryID === item.categoryID) || { categoryName: 'Khác' },
        items: []
      };
    }
    acc[item.categoryID].items.push(item);
    return acc;
  }, {});

  const categoryOptions = categories.map(cat => ({
    value: cat.categoryID,
    label: cat.categoryName
  }));

  // KPI Calculations
  const totalCount = menuItems.length;
  const activeCount = menuItems.filter(item => item.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="kds-menu-container">
      <style>{`
        /* Container & Fonts */
        .kds-menu-container {
          width: 100%;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* KPI Summary Panel */
        .kds-menu-kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 640px) {
          .kds-menu-kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .kds-menu-kpi-card {
          background-color: var(--surface-card, #ffffff);
          border: 1px solid rgba(194, 200, 191, 0.3);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 20px rgba(59, 47, 47, 0.02);
          transition: all 0.3s ease;
        }

        .kds-menu-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(59, 47, 47, 0.05);
        }

        .kds-menu-kpi-icon-wrap {
          padding: 0.75rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kds-menu-kpi-icon-wrap.total {
          background-color: var(--surface-soft, #f6f4ea);
          color: var(--primary-color, #4f6f52);
        }

        .kds-menu-kpi-icon-wrap.active {
          background-color: #dcfce7;
          color: #166534;
        }

        .kds-menu-kpi-icon-wrap.inactive {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .kds-menu-kpi-info {
          display: flex;
          flex-direction: column;
        }

        .kds-menu-kpi-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted, #6e5f5f);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.125rem;
        }

        .kds-menu-kpi-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main, #3b2f2f);
        }

        .kds-menu-kpi-value.active {
          color: #166534;
        }

        .kds-menu-kpi-value.inactive {
          color: #991b1b;
        }

        /* Control Panel (Search & Filter on the same line) */
        .kds-menu-controls-panel {
          position: relative;
          z-index: 30;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(194, 200, 191, 0.2);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(59, 47, 47, 0.01);
        }

        .kds-menu-search-wrapper {
          position: relative;
          flex: 1;
        }

        .kds-menu-search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #737971;
          pointer-events: none;
          transition: color 0.3s ease;
        }

        .kds-menu-search-input {
          width: 100%;
          height: 44px;
          background-color: var(--surface-card, #ffffff);
          border: 1px solid rgba(194, 200, 191, 0.6);
          border-radius: 12px;
          padding-left: 2.75rem;
          padding-right: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-main, #3b2f2f);
          transition: all 0.3s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .kds-menu-search-input::placeholder {
          color: rgba(115, 121, 113, 0.7);
        }

        .kds-menu-search-input:focus {
          outline: none;
          border-color: var(--primary-color, #4f6f52);
          box-shadow: 0 0 0 3px rgba(79, 111, 82, 0.15);
        }

        .kds-menu-search-input:hover {
          border-color: rgba(79, 111, 82, 0.5);
        }

        .kds-menu-filter-wrapper {
          width: 12rem;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .kds-menu-filter-wrapper {
            width: 10rem;
          }
        }

        /* Category Sections & Sticky Headers */
        .kds-menu-canvas {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          padding-bottom: 3rem;
        }

        .kds-menu-empty-state {
          text-align: center;
          color: #a8a29e;
          padding: 3rem;
          background-color: var(--surface-card, #ffffff);
          border-radius: 16px;
          border: 1px solid rgba(194, 200, 191, 0.2);
          box-shadow: 0 4px 20px rgba(59, 47, 47, 0.01);
          font-weight: 500;
        }

        .kds-menu-category-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(79, 111, 82, 0.1);
          border-radius: 16px;
          padding: 0.875rem 1.25rem;
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
        }

        .kds-menu-category-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .kds-menu-category-line {
          width: 4px;
          height: 24px;
          background-color: var(--primary-color, #4f6f52);
          border-radius: 999px;
        }

        .kds-menu-category-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main, #3b2f2f);
        }

        .kds-menu-category-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary-color, #4f6f52);
          background-color: var(--surface-soft, #f6f4ea);
          border: 1px solid rgba(79, 111, 82, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
        }

        /* Grid & Cards */
        .kds-menu-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .kds-menu-item-card {
          background-color: var(--surface-card, #ffffff);
          border: 1px solid rgba(194, 200, 191, 0.3);
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 4px 20px rgba(59, 47, 47, 0.02);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .kds-menu-item-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(59, 47, 47, 0.06);
          border-color: rgba(79, 111, 82, 0.2);
        }

        .kds-menu-item-card.inactive {
          opacity: 0.85;
        }

        .kds-menu-card-image-wrap {
          width: 100%;
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
          background-color: var(--surface-soft, #f6f4ea);
          position: relative;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .kds-menu-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .kds-menu-item-card:hover .kds-menu-card-image {
          transform: scale(1.05);
        }

        .kds-menu-card-overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(59, 47, 47, 0.2);
          backdrop-filter: blur(3px);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kds-menu-card-overlay-badge {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #fee2e2;
          color: var(--danger, #ba1a1a);
          padding: 0.5rem 0.875rem;
          border-radius: 12px;
          font-size: 0.6875rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .kds-menu-card-dot-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--danger, #ba1a1a);
          animation: kds-pulse 1.2s infinite;
        }

        @keyframes kds-pulse {
          0% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 0 0 rgba(186, 26, 26, 0.7); }
          70% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 6px rgba(186, 26, 26, 0); }
          100% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 0 0 rgba(186, 26, 26, 0); }
        }

        .kds-menu-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .kds-menu-card-tag {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #6e5f5f);
          background-color: var(--surface-soft, #f6f4ea);
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          border: 1px solid rgba(194, 200, 191, 0.1);
          align-self: flex-start;
        }

        .kds-menu-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main, #3b2f2f);
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
          transition: color 0.2s ease;
        }

        .kds-menu-item-card:hover .kds-menu-card-title {
          color: var(--primary-color, #4f6f52);
        }

        .kds-menu-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(194, 200, 191, 0.15);
        }

        .kds-menu-card-price {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-main, #3b2f2f);
          font-variant-numeric: tabular-nums;
        }

        .kds-menu-toggle-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .kds-menu-toggle-text {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kds-menu-toggle-text.active { color: #166534; }
        .kds-menu-toggle-text.inactive { color: #991b1b; }
        .kds-menu-toggle-text.loading { color: var(--text-muted, #6e5f5f); }

        /* Switch design */
        .kds-menu-toggle-btn {
          background: none;
          border: none;
          padding: 0;
          outline: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
        }

        .kds-menu-toggle-btn:disabled {
          cursor: not-allowed;
          opacity: 0.75;
        }

        .kds-menu-toggle-track {
          width: 48px;
          height: 24px;
          border-radius: 999px;
          padding: 2px;
          display: flex;
          align-items: center;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
          transition: background-color 0.3s ease;
        }

        .kds-menu-toggle-track.active {
          background-color: var(--primary-color, #4f6f52);
        }

        .kds-menu-toggle-track.inactive {
          background-color: #e4e2e2;
        }

        .kds-menu-toggle-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .kds-menu-toggle-thumb.active {
          transform: translateX(24px);
        }

        .kds-menu-toggle-thumb.inactive {
          transform: translateX(0);
        }
      `}</style>
      
      {/* KPI Cards Panel */}
      <div className="kds-menu-kpi-grid">
        {/* KPI 1: Tổng số món */}
        <div className="kds-menu-kpi-card">
          <div className="kds-menu-kpi-icon-wrap total">
            <Layers size={20} />
          </div>
          <div className="kds-menu-kpi-info">
            <span className="kds-menu-kpi-label">Tổng số món</span>
            <span className="kds-menu-kpi-value">{totalCount}</span>
          </div>
        </div>

        {/* KPI 2: Đang phục vụ */}
        <div className="kds-menu-kpi-card">
          <div className="kds-menu-kpi-icon-wrap active">
            <CheckCircle2 size={20} />
          </div>
          <div className="kds-menu-kpi-info">
            <span className="kds-menu-kpi-label">Đang bán</span>
            <span className="kds-menu-kpi-value active">{activeCount}</span>
          </div>
        </div>

        {/* KPI 3: Tạm ngưng */}
        <div className="kds-menu-kpi-card">
          <div className="kds-menu-kpi-icon-wrap inactive">
            <AlertCircle size={20} />
          </div>
          <div className="kds-menu-kpi-info">
            <span className="kds-menu-kpi-label">Tạm ngưng</span>
            <span className="kds-menu-kpi-value inactive">{inactiveCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls (Always on the same line) */}
      <div className="kds-menu-controls-panel">
        <div className="kds-menu-search-wrapper">
          <Search className="kds-menu-search-icon" size={16} />
          <input 
            className="kds-menu-search-input"
            placeholder="Tìm kiếm món ăn theo tên..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="kds-menu-filter-wrapper">
          <CustomDropdown 
            options={categoryOptions} 
            value={selectedCategory} 
            onChange={setSelectedCategory} 
            placeholder="Tất cả danh mục" 
          />
        </div>
      </div>

      {/* Menu Content Canvas */}
      <div className="kds-menu-canvas">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="kds-menu-empty-state">
            Không tìm thấy món ăn nào khớp với bộ lọc
          </div>
        ) : (
          Object.values(groupedItems)
            .sort((a, b) => (a.categoryInfo?.sortOrder || 0) - (b.categoryInfo?.sortOrder || 0))
            .map((group, idx) => (
            <section key={idx}>
              <div className="kds-menu-category-header">
                <div className="kds-menu-category-title-wrap">
                  <div className="kds-menu-category-line"></div>
                  <h2 className="kds-menu-category-name">{group.categoryInfo.categoryName}</h2>
                </div>
                <span className="kds-menu-category-badge">{group.items.length} món ăn</span>
              </div>
              
              <div className="kds-menu-items-grid">
                {group.items.map(item => {
                  const isToggling = togglingItems[item.itemID];
                  return (
                    <div 
                      key={item.itemID} 
                      className={`kds-menu-item-card ${!item.isActive ? 'inactive' : ''}`}
                    >
                      <div className="kds-menu-card-image-wrap">
                        {!item.isActive && (
                          <div className="kds-menu-card-overlay">
                            <div className="kds-menu-card-overlay-badge">
                              <span className="kds-menu-card-dot-pulse"></span>
                              <span>Tạm ngưng</span>
                            </div>
                          </div>
                        )}
                        <img 
                          alt={item.itemName} 
                          className="kds-menu-card-image" 
                          src={
                            !item.imageURL
                              ? '/img/foodimg.jpg'
                              : item.imageURL.startsWith('http')
                                ? item.imageURL
                                : item.imageURL.startsWith('/')
                                  ? item.imageURL
                                  : `/img/${item.imageURL}`
                          }
                          onError={(e) => { e.target.src = '/img/foodimg.jpg' }}  
                        />
                      </div>
                      
                      <div className="kds-menu-card-body">
                        <div>
                          <span className="kds-menu-card-tag">
                            {group.categoryInfo.categoryName}
                          </span>
                          <h3 className="kds-menu-card-title">
                            {item.itemName}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="kds-menu-card-footer">
                        <span className="kds-menu-card-price">
                          {Number(item.price).toLocaleString('vi-VN')}đ
                        </span>
                        
                        <div className="kds-menu-toggle-group">
                          <span className={`kds-menu-toggle-text ${
                            isToggling ? 'loading' : item.isActive ? 'active' : 'inactive'
                          }`}>
                            {isToggling ? 'Lưu...' : item.isActive ? 'Bán' : 'Ngưng'}
                          </span>
                          
                          <button 
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleStatus(item)}
                            className="kds-menu-toggle-btn"
                            aria-label={`Bật/tắt trạng thái món ${item.itemName}`}
                          >
                            <div className={`kds-menu-toggle-track ${item.isActive ? 'active' : 'inactive'}`}>
                              <div className={`kds-menu-toggle-thumb ${item.isActive ? 'active' : 'inactive'}`}>
                                {isToggling && (
                                  <Loader2 size={10} className="animate-spin text-[#4f6f52]" />
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default KDSMenu;