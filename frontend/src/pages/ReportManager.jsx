import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, TrendingUp, TrendingDown, Banknote, ShoppingBag, 
  Receipt, Calendar, MapPin, ChevronDown, ExternalLink,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/api';
import { useLanguage } from '../contexts/LanguageContext';
import './AdminTheme.css';

const ReportManager = () => {
  const { language, t } = useLanguage();
  const [chartPeriod, setChartPeriod] = useState('30days');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data States
  const [kpis, setKpis] = useState({ status: 'loading', totalRevenue: 0, completedOrders: 0, averageOrderValue: 0 });
  const [topItems, setTopItems] = useState({ status: 'loading', data: [] });
  const [catShare, setCatShare] = useState({ status: 'loading', data: [] });
  const [revChart, setRevChart] = useState({ status: 'loading', labels: [], data: [] });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    api.get('/reports/kpis').then(res => setKpis(res.data)).catch(() => setKpis({ status: 'none' }));
    api.get('/reports/top-items').then(res => setTopItems(res.data)).catch(() => setTopItems({ status: 'none', data: [] }));
    api.get('/reports/category-share').then(res => setCatShare(res.data)).catch(() => setCatShare({ status: 'none', data: [] }));
  }, []);

  useEffect(() => {
    setRevChart({ status: 'loading', labels: [], data: [] });
    api.get(`/reports/revenue-chart?period=${chartPeriod}`).then(res => setRevChart(res.data)).catch(() => setRevChart({ status: 'none', labels: [], data: [] }));
  }, [chartPeriod]);

  const allItems = topItems.status === 'success' ? [...topItems.data].sort((a, b) => b.revenue - a.revenue) : [];
  const top5 = allItems.slice(0, 5);

  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allItems.slice(start, start + itemsPerPage);
  }, [allItems, currentPage]);

  const exportExcel = () => {
    const kpiData = [
      { 'Chỉ số': 'Tổng doanh thu', 'Giá trị': kpis.totalRevenue || 0 },
      { 'Chỉ số': 'Số hoá đơn hoàn thành', 'Giá trị': kpis.completedOrders || 0 },
      { 'Chỉ số': 'Giá trị đơn TB', 'Giá trị': kpis.averageOrderValue || 0 },
    ];
    const kpiSheet = XLSX.utils.json_to_sheet(kpiData);

    const revData = (revChart.labels || []).map((label, idx) => ({
      'Thời gian': label,
      'Doanh thu (VNĐ)': revChart.data[idx] || 0
    }));
    const revSheet = XLSX.utils.json_to_sheet(revData);

    const catData = (catShare.data || []).map(cat => ({
      'Danh mục': cat.name,
      'Tỷ trọng (%)': cat.percentage
    }));
    const catSheet = XLSX.utils.json_to_sheet(catData);

    const itemData = allItems.map((item, idx) => ({
      'Hạng': idx + 1,
      'Món ăn': item.itemName,
      'Danh mục': item.categoryName,
      'Số lượng bán': item.soldCount,
      'Doanh thu (VNĐ)': item.revenue,
    }));
    const itemSheet = XLSX.utils.json_to_sheet(itemData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, kpiSheet, 'Tổng quan KPI');
    XLSX.utils.book_append_sheet(wb, revSheet, 'Biểu đồ doanh thu');
    XLSX.utils.book_append_sheet(wb, catSheet, 'Tỷ trọng danh mục');
    XLSX.utils.book_append_sheet(wb, itemSheet, 'Tất cả món đã bán');

    XLSX.writeFile(wb, `Tong_Hop_Bao_Cao_${chartPeriod}.xlsx`);
  };

  const maxChartVal = revChart.data && revChart.data.length > 0 ? Math.max(...revChart.data, 1) : 1;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{t.reportTitle || 'Báo Cáo & Thống Kê'}</h1>
        
        <div className="action-strip" style={{ marginBottom: 0 }}>
          <button onClick={exportExcel} className="action-btn" style={{ backgroundColor: 'var(--dashboard-primary)', color: 'white', borderColor: 'var(--dashboard-primary)' }}>
            <Download size={18} color="white" />
            {t.downloadReport || 'Xuất Excel'}
          </button>
        </div>
      </div>

      {/* KPI ROW - 3 Cards */}
      <div className="kpi-banner">
        <div className="kpi-card">
           <div className="kpi-icon-wrap" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
             <Banknote size={24} />
           </div>
           <div className="kpi-info" style={{ flexGrow: 1 }}>
             <span className="kpi-label">{t.totalRevenue || 'Tổng doanh thu'}</span>
             {kpis.status === 'none' ? <span className="kpi-value">0₫</span> : 
              <span className="kpi-value">{kpis.totalRevenue?.toLocaleString('vi-VN')}<span style={{ fontSize: '1rem', color: 'var(--dashboard-text-muted)' }}>₫</span></span>}
           </div>
           {kpis.status === 'success' && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--dashboard-success-bg)', color: 'var(--dashboard-success-text)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}><TrendingUp size={14} /> +12%</div>}
        </div>
        
        <div className="kpi-card">
           <div className="kpi-icon-wrap" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
             <ShoppingBag size={24} />
           </div>
           <div className="kpi-info" style={{ flexGrow: 1 }}>
             <span className="kpi-label">{t.completedOrders || 'Hóa đơn hoàn thành'}</span>
             {kpis.status === 'none' ? <span className="kpi-value">0</span> : <span className="kpi-value">{kpis.completedOrders}</span>}
           </div>
        </div>

        <div className="kpi-card">
           <div className="kpi-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
             <Receipt size={24} />
           </div>
           <div className="kpi-info" style={{ flexGrow: 1 }}>
             <span className="kpi-label">{t.avgOrder || 'Giá trị đơn TB'}</span>
             {kpis.status === 'none' ? <span className="kpi-value">0₫</span> :
              <span className="kpi-value">{kpis.averageOrderValue?.toLocaleString('vi-VN')}<span style={{ fontSize: '1rem', color: 'var(--dashboard-text-muted)' }}>₫</span></span>}
           </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="flex gap-6" style={{ flexWrap: 'wrap', marginBottom: '2rem' }}>
        {/* Doanh thu */}
        <div className="dashboard-panel" style={{ flex: '2 1 500px' }}>
           <div className="panel-header">
              <h3 className="panel-title">{t.revenueMomentum || 'Động lượng doanh thu'}</h3>
              <div style={{ position: 'relative' }}>
                 <select 
                    value={chartPeriod} onChange={(e) => setChartPeriod(e.target.value)}
                    style={{ appearance: 'none', backgroundColor: 'var(--dashboard-surface-hover)', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text-main)', fontWeight: '600', borderRadius: '8px', padding: '6px 36px 6px 12px', outline: 'none', cursor: 'pointer' }}
                 >
                    <option value="30days">{t.period30Days || '30 Ngày qua'}</option>
                    <option value="6months">{t.period6Months || '6 Tháng qua'}</option>
                    <option value="1year">{t.period1Year || '1 Năm qua'}</option>
                 </select>
                 <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dashboard-text-muted)', pointerEvents: 'none' }} />
              </div>
           </div>
           
           {revChart.status === 'none' || !revChart.data || revChart.data.length === 0 ? (
              <div className="chart-container" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--dashboard-text-muted)', fontWeight: '600', fontSize: '1.25rem' }}>
                 Chưa có dữ liệu giao dịch
              </div>
           ) : (
             <div className="chart-container">
               <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2%', flexGrow: 1, paddingBottom: '20px', borderBottom: '1px solid var(--dashboard-border)' }}>
                  {revChart.data.slice(-15).map((val, idx, arr) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '10px', position: 'relative', overflow: 'hidden' }}>
                       <div style={{ width: '100%', maxWidth: '40px', minWidth: '4px', backgroundColor: idx === arr.length - 1 ? 'var(--dashboard-primary)' : 'var(--dashboard-primary-light)', height: `${(val / maxChartVal) * 200 + 10}px`, borderRadius: '6px 6px 0 0', transition: 'all 0.5s ease', cursor: 'pointer' }} title={val.toLocaleString('vi-VN') + ' ₫'}></div>
                    </div>
                  ))}
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', overflowX: 'hidden' }}>
                  {revChart.labels.slice(-15).map((l, i, arr) => (
                    <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', fontWeight: '600', color: i === arr.length - 1 ? 'var(--dashboard-text-main)' : 'var(--dashboard-text-muted)' }}>{l}</span>
                  ))}
               </div>
             </div>
           )}
        </div>

        {/* Tỷ trọng danh mục */}
        <div className="dashboard-panel" style={{ flex: '1 1 300px' }}>
           <h3 className="panel-title" style={{ marginBottom: '1.5rem' }}>{t.categoryShare || 'Tỷ trọng danh mục'}</h3>
           
           {catShare.status === 'none' || catShare.data.length === 0 ? (
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dashboard-text-muted)', fontWeight: '600', height: '160px', fontSize: '1.25rem' }}>
                 Chưa có dữ liệu
              </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                   <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--dashboard-surface-hover)" strokeWidth="12"></circle>
                      {(() => {
                         let currentOffset = 0;
                         return [...catShare.data].sort((a,b)=>b.percentage - a.percentage).map((cat, idx) => {
                             const dashLength = (cat.percentage / 100) * 251.2;
                             const el = <circle key={idx} cx="50" cy="50" r="40" fill="transparent" stroke={cat.color || 'var(--dashboard-primary)'} strokeWidth="12" strokeDasharray={`${dashLength} ${251.2 - dashLength}`} strokeDashoffset={-currentOffset} style={{ transition: 'all 1s ease' }}></circle>;
                             currentOffset += dashLength;
                             return el;
                         });
                      })()}
                   </svg>
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--dashboard-text-main)' }}>100%</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--dashboard-text-muted)', textTransform: 'uppercase' }}>{t.total || 'Tổng'}</span>
                   </div>
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   {catShare.data.map((cat, idx) => (
                     <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-2"><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color || 'var(--dashboard-primary)' }}></div><span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--dashboard-text-main)' }}>{cat.name}</span></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--dashboard-text-main)' }}>{cat.percentage}%</span>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* TOP 5 MÓN BÁN CHẠY */}
      <div className="dashboard-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="panel-header" style={{ padding: '1.5rem 1.5rem 1rem' }}>
           <h3 className="panel-title">{t.top5Title || 'Top 5 món bán chạy'}</h3>
           {topItems.status !== 'none' && topItems.data.length > 0 && (
             <button onClick={() => setIsModalOpen(true)} className="panel-action flex items-center gap-1">
               {t.viewDetails || 'Xem chi tiết'} <ExternalLink size={16} />
             </button>
           )}
        </div>

        {topItems.status === 'none' || topItems.data.length === 0 ? (
           <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--dashboard-text-muted)', fontWeight: '600', fontSize: '1.25rem' }}>
             Chưa có dữ liệu bán hàng
           </div>
        ) : (
          <div style={{ overflowX: 'auto', maxWidth: '100vw' }}>
            <table className="full-table">
              <thead>
                <tr style={{ backgroundColor: 'var(--dashboard-surface-hover)' }}>
                  <th style={{ width: '80px' }}>{t.rank || 'Hạng'}</th>
                  <th>{t.item || 'Món ăn'}</th>
                  <th>{t.category || 'Danh mục'}</th>
                  <th>{t.qty || 'Đã bán'}</th>
                  <th style={{ textAlign: 'right' }}>{t.revenue || 'Doanh thu'}</th>
                </tr>
              </thead>
              <tbody>
                 {top5.map((item, idx) => (
                    <tr key={item.itemID} style={{ borderBottom: idx !== top5.length-1 ? '1px dashed var(--dashboard-border)' : 'none' }}>
                       <td>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--dashboard-primary)' : 'var(--dashboard-surface-hover)', color: idx === 0 ? '#fff' : 'var(--dashboard-text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.875rem' }}>
                             0{idx + 1}
                          </div>
                       </td>
                       <td style={{ fontWeight: '600' }}>
                          <div className="flex items-center gap-3">
                             <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--dashboard-surface-hover)' }}>
                                {item.imageURL && <img src={item.imageURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                             </div>
                             <span style={{ fontSize: '0.95rem' }}>{item.itemName}</span>
                          </div>
                       </td>
                       <td>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'var(--dashboard-surface-hover)', color: item.catClass || 'var(--dashboard-text-muted)' }}>
                             {item.categoryName}
                          </span>
                       </td>
                       <td style={{ fontWeight: '600' }}>
                          {item.soldCount}
                       </td>
                       <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--dashboard-primary)', fontSize: '1.05rem' }}>
                          {item.revenue.toLocaleString('vi-VN')}₫
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer: Tất cả món đã bán */}
      <div className={`drawer-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="drawer-panel" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="drawer-title">{t.modalTitle || 'Chi tiết tất cả món đã bán'}</h2>
            <button className="drawer-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="drawer-body" style={{ padding: 0 }}>
            <table className="full-table">
               <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--dashboard-surface-hover)' }}>
                 <tr>
                   <th style={{ width: '70px', paddingLeft: '1.5rem' }}>{t.rank || 'Hạng'}</th>
                   <th>{t.item || 'Món ăn'}</th>
                   <th>{t.category || 'Danh mục'}</th>
                   <th>{t.qty || 'Đã bán'}</th>
                   <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>{t.revenue || 'Doanh thu'}</th>
                 </tr>
               </thead>
               <tbody>
                  {currentData.map((item, idx) => {
                     const rank = (currentPage - 1) * itemsPerPage + idx + 1;
                     return (
                       <tr key={item.itemID}>
                          <td style={{ paddingLeft: '1.5rem' }}>
                             <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: rank === 1 ? 'var(--dashboard-primary)' : 'var(--dashboard-surface-hover)', color: rank === 1 ? '#fff' : 'var(--dashboard-text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem' }}>
                                {rank}
                             </div>
                          </td>
                          <td style={{ fontWeight: '600' }}>
                             <div className="flex items-center gap-3">
                                <div style={{ width: '30px', height: '30px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--dashboard-surface-hover)' }}>
                                   {item.imageURL && <img src={item.imageURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <span style={{ fontSize: '0.9rem' }}>{item.itemName}</span>
                             </div>
                          </td>
                          <td>
                             <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: 'var(--dashboard-surface-hover)', color: item.catClass || 'var(--dashboard-text-muted)' }}>
                                {item.categoryName}
                             </span>
                          </td>
                          <td style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                             {item.soldCount}
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: '1.5rem', fontWeight: '800', color: 'var(--dashboard-primary)', fontSize: '0.95rem' }}>
                             {item.revenue.toLocaleString('vi-VN')}₫
                          </td>
                       </tr>
                     )
                  })}
               </tbody>
            </table>
          </div>

          {/* Pagination in Drawer Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderTop: '1px solid var(--dashboard-border)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--dashboard-text-muted)', fontWeight: '500' }}>
                {language === 'vi' ? 'Hiển thị' : 'Showing'} {(currentPage - 1) * itemsPerPage + (currentData.length > 0 ? 1 : 0)}-{Math.min(currentPage * itemsPerPage, allItems.length)} {language === 'vi' ? 'của' : 'of'} {allItems.length} {language === 'vi' ? 'kết quả' : 'results'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button 
                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                 disabled={currentPage === 1} 
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--dashboard-border)', backgroundColor: currentPage === 1 ? 'var(--dashboard-surface-hover)' : '#fff', color: currentPage === 1 ? '#ccc' : 'var(--dashboard-text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
               >
                   <ChevronLeft size={16} />
               </button>
               <button 
                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                 disabled={currentPage >= totalPages || totalPages === 0} 
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--dashboard-border)', backgroundColor: currentPage >= totalPages || totalPages === 0 ? 'var(--dashboard-surface-hover)' : '#fff', color: currentPage >= totalPages || totalPages === 0 ? '#ccc' : 'var(--dashboard-text-main)', cursor: currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
               >
                   <ChevronRight size={16} />
               </button>
            </div>
         </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;