import { useState, useEffect, useMemo } from 'react';
import { Tag, Plus, Search, Activity, CheckCircle, X } from 'lucide-react';
import api from '../api/api';
import { useLanguage } from '../contexts/LanguageContext';
import './AdminTheme.css';

const PromotionManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const { language, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, ONGOING, UPCOMING, ENDED
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    voucherID: '',
    voucherName: '',
    voucherCode: '',
    discountType: 1, 
    discountValue: '',
    minOrderValue: 0,
    quantity: 100,
    startDate: '',
    endDate: '',
    isActive: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/promotions/vouchers');
      
      const responseData = res.data?.data || res.data;
      
      if (Array.isArray(responseData)) {
         setVouchers(responseData);
      } else {
         setVouchers([]);
      }
    } catch (error) {
      const backendErrorMsg = error.response?.data?.error || error.message;
      console.error("Lỗi 500 từ Backend trả về:", backendErrorMsg);
      alert("Backend đang báo lỗi: " + backendErrorMsg);
      setVouchers([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if(!formData.voucherID || !formData.voucherCode || !formData.discountValue || !formData.startDate || !formData.endDate){
         alert("Vui lòng điền đầy đủ các trường bắt buộc!");
         return;
      }

      if(new Date(formData.startDate) > new Date(formData.endDate)) {
         alert("Ngày kết thúc phải sau ngày bắt đầu!");
         return;
      }
      
      const payload = {
        voucherID: formData.voucherID.trim(),
        voucherCode: formData.voucherCode.trim(),
        discountType: parseInt(formData.discountType),
        discountValue: parseFloat(formData.discountValue),
        minTotalRequired: parseFloat(formData.minOrderValue || 0), 
        usageLimit: parseInt(formData.quantity || 1), 
        startDate: new Date(formData.startDate).toISOString(), 
        expiryDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive
      };
      
      await api.post('/promotions/vouchers', payload);
      alert("Tạo mã khuyến mãi thành công!");
      setIsModalOpen(false);
      
      // Reset form
      setFormData({
        voucherID: '', voucherName: '', voucherCode: '', discountType: 1, 
        discountValue: '', minOrderValue: 0, quantity: 100, startDate: '', endDate: '', isActive: true
      });
      loadData();
    } catch (error) {
       console.error("Lỗi chi tiết từ Backend:", error);
       
       const errorMsg = error.response?.data?.error || error.message;
       
       if (errorMsg.includes("Unique constraint failed")) {
          alert("Lưu thất bại: Mã ID (Hoặc Code) này ĐÃ TỒN TẠI trong hệ thống!");
       } else if (errorMsg.includes("Unknown argument `startDate`")) {
          alert("Lỗi Server: Database của bạn chưa được thêm cột 'startDate'. Hãy cập nhật Prisma Schema!");
       } else {
          alert("Lưu thất bại. Chi tiết lỗi: " + errorMsg);
       }
    }
  };

  const handleToggleActive = async (voucherID, currentStatus) => {
    try {
      await api.put(`/promotions/vouchers/${voucherID}/status`, { isActive: !currentStatus });
      loadData();
    } catch (error) {
      console.error("Lỗi bật/tắt trạng thái:", error);
      alert("Không thể cập nhật trạng thái lúc này!");
    }
  };

  const safeDate = (dateString) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "---" : d.toLocaleDateString('vi-VN');
  };

  const getVoucherStatus = (v) => {
    const now = new Date().getTime();
    const stUrl = new Date(v.startDate).getTime();
    const edUrl = new Date(v.expiryDate).getTime();
    
    if(!v.isActive) return 'DISABLED';
    if(now < stUrl) return 'UPCOMING';
    if(now > edUrl) return 'ENDED';
    return 'ONGOING';
  };

  const safeVouchers = Array.isArray(vouchers) ? vouchers : [];
  const activeCount = safeVouchers.filter(v => getVoucherStatus(v) === 'ONGOING').length;
  const usesToday = safeVouchers.reduce((acc, v) => acc + (v.usedCount > 0 ? Math.floor(v.usedCount / 3) : 0), 0); 

  const filteredVouchers = useMemo(() => {
    return safeVouchers.filter(v => {
      const matchSearch = (v.voucherName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (v.voucherCode || '').toLowerCase().includes(searchQuery.toLowerCase());
      if(!matchSearch) return false;

      const st = getVoucherStatus(v);
      if(filterTab === 'ONGOING') return st === 'ONGOING';
      if(filterTab === 'UPCOMING') return st === 'UPCOMING';
      if(filterTab === 'ENDED') return st === 'ENDED' || st === 'DISABLED';
      return true;
    });
  }, [safeVouchers, filterTab, searchQuery]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{t.promoTitle || "Quản lý Khuyến mãi"}</h1>
      </div>

      <div className="kpi-banner">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <CheckCircle size={24} strokeWidth={2.5} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{t.promoActive || "Khuyến mãi đang chạy"}</span>
            <span className="kpi-value">{activeCount}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap secondary">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{t.promoUsedToday || "Lượt sử dụng hôm nay"}</span>
            <span className="kpi-value">{usesToday}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
         <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--dashboard-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--dashboard-border)' }}>
            {['ALL', 'ONGOING', 'UPCOMING', 'ENDED'].map(tab => (
               <button key={tab} onClick={() => setFilterTab(tab)} style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: '600', backgroundColor: filterTab===tab ? 'var(--dashboard-surface-hover)' : 'transparent', color: filterTab===tab ? 'var(--dashboard-text-main)' : 'var(--dashboard-text-muted)', cursor: 'pointer', border: 'none', transition: 'all 0.2s' }}>
                  {tab === 'ALL' ? (t.promoTabAll || 'Tất cả') : tab === 'ONGOING' ? (t.promoTabOngoing || 'Đang diễn ra') : tab === 'UPCOMING' ? (t.promoTabUpcoming || 'Sắp tới') : (t.promoTabEnded || 'Kết thúc')}
               </button>
            ))}
         </div>

         <div className="flex gap-4" style={{ alignItems: 'stretch' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dashboard-text-muted)' }} />
              <input 
                type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder={t.promoSearch || "Tìm Voucher..."}
                style={{ width: '100%', height: '100%', minHeight: '44px', padding: '0 10px 0 36px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface)', outline: 'none', color: 'var(--dashboard-text-main)' }}
              />
            </div>
            <button className="action-btn" onClick={() => setIsModalOpen(true)} style={{ backgroundColor: 'var(--dashboard-primary)', color: 'white', borderColor: 'var(--dashboard-primary)' }}>
              <Plus size={18} color="white" /> {t.promoCreateBtn || "Tạo mã khuyến mãi"}
            </button>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? <div style={{ color: 'var(--dashboard-text-muted)' }}>Đang tải...</div> : filteredVouchers.map(v => {
           const status = getVoucherStatus(v);
           let badgeClass = 'status-badge ';
           let badgeLabel = 'Chưa rõ';
           
           if(status === 'ONGOING') { badgeClass += 'badge-success'; badgeLabel = t.promoAvailable || "Mã khả dụng"; }
           else if(status === 'UPCOMING') { badgeClass += 'badge-warning'; badgeLabel = t.promoTabUpcoming || "Sắp tới"; }
           else if(status === 'ENDED') { badgeClass += 'status-badge'; badgeLabel = t.promoTabEnded || "Kết thúc"; }
           else if(status === 'DISABLED') { badgeClass += 'badge-danger'; badgeLabel = t.promoDisabled || "Đã vô hiệu hóa"; }

           return (
             <div key={v.voucherID} className="dashboard-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="flex justify-between items-start">
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span className={badgeClass} style={{ alignSelf: 'flex-start', padding: '4px 8px' }}>
                        {badgeLabel}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Giảm {v.discountType === 1 ? `${v.discountValue}%` : `${parseFloat(v.discountValue || 0).toLocaleString('vi-VN')}đ`}</h3>
                   </div>
                   <div style={{ backgroundColor: 'var(--dashboard-surface-hover)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', border: '1px dashed var(--dashboard-border)' }}>
                     {v.voucherCode}
                   </div>
                </div>

                <p style={{ color: 'var(--dashboard-text-muted)', fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
                   Mã Voucher ID: {v.voucherID}
                </p>

                <div style={{ backgroundColor: 'var(--dashboard-surface-hover)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                   <div className="flex justify-between">
                     <span style={{ color: 'var(--dashboard-text-muted)' }}>{t.promoTime || "Hạn sử dụng:"}</span>
                     <span style={{ fontWeight: '600' }}>{safeDate(v.expiryDate)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span style={{ color: 'var(--dashboard-text-muted)' }}>{t.promoCondition || "Điều kiện:"}</span>
                     <span style={{ fontWeight: '600' }}>{v.minTotalRequired ? `Đơn từ ${parseFloat(v.minTotalRequired).toLocaleString('vi-VN')}đ` : (t.promoMinOrder || "Đơn từ 0đ")}</span>
                   </div>
                   <div className="flex justify-between">
                     <span style={{ color: 'var(--dashboard-text-muted)' }}>{t.promoUsed || "Đã dùng:"}</span>
                     <span style={{ fontWeight: '600' }}>{v.usedCount} / {v.usageLimit|| (t.promoUnlimited || "Không giới hạn")}</span>
                   </div>
                </div>

                <div className="flex justify-between items-center" style={{ paddingTop: '0.5rem', marginTop: 'auto' }}>
                   <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--dashboard-text-main)' }}>{t.promoStatusActive || "Trạng thái Kích hoạt"}</span>
                   <button onClick={() => handleToggleActive(v.voucherID, v.isActive)} style={{ 
                      width: '44px', height: '24px', borderRadius: '12px', 
                      backgroundColor: v.isActive ? 'var(--dashboard-success-text)' : 'var(--dashboard-border)',
                      position: 'relative', cursor: 'pointer', border: 'none', transition: 'background-color 0.2s'
                    }}>
                       <div style={{ 
                         width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
                         position: 'absolute', top: '3px', left: v.isActive ? '23px' : '3px', transition: 'left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                         boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                       }}></div>
                    </button>
                </div>
             </div>
           )
        })}
      </div>

      <div className={`drawer-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="drawer-title">{t.promoCreateBtn || "Khởi Tạo Voucher Khuyến Mãi"}</h2>
            <button className="drawer-close" onClick={() => setIsModalOpen(false)} aria-label="Đóng">
              <X size={20} />
            </button>
          </div>
          <div className="drawer-body">
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Mã Voucher (Code khách nhập)</label>
                  <input type="text" name="voucherCode" onChange={handleInputChange} value={formData.voucherCode} placeholder="VD: SALET5" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
              </div>
              
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Tên CT Khuyến Mãi</label>
                  <input type="text" name="voucherName" onChange={handleInputChange} value={formData.voucherName} placeholder="Nhập tên chương trình (Tùy chọn)" style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Mã Lưu Trữ (ID)</label>
                    <input type="text" name="voucherID" onChange={handleInputChange} value={formData.voucherID} placeholder="VD: VOUCHER_001" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Loại Giảm</label>
                    <select name="discountType" onChange={handleInputChange} value={formData.discountType} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none', backgroundColor: '#fff' }}>
                        <option value={1}>Phần trăm (%)</option>
                        <option value={0}>Trực tiếp (VNĐ)</option>
                    </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                 <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Mức Giảm (Giá Trị)</label>
                     <input type="number" name="discountValue" onChange={handleInputChange} value={formData.discountValue} placeholder="VD: 15 hoặc 50000" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                 </div>
                 <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Đơn tối thiểu (VNĐ)</label>
                     <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} placeholder="VD: 150000" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                 </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Số lượng giới hạn</label>
                  <input type="number" name="quantity" onChange={handleInputChange} value={formData.quantity} required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Ngày bắt đầu</label>
                    <input type="date" name="startDate" onChange={handleInputChange} value={formData.startDate} required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Ngày Hết hạn</label>
                    <input type="date" name="endDate" onChange={handleInputChange} value={formData.endDate} required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="action-btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text-muted)' }}>Hủy bỏ</button>
                 <button type="submit" className="action-btn" style={{ backgroundColor: 'var(--dashboard-primary)', color: 'white', border: 'none' }}>Khởi tạo mã</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionManager;
