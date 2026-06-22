import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Banknote, Receipt, Utensils, Printer, Calendar, TrendingUp, ShoppingBag, CheckCircle2, AlertTriangle } from 'lucide-react';
import POSLayout from '../components/pos/POSLayout';

const API = 'http://localhost:5000/api/pos';

const POSReport = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printStatus, setPrintStatus] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/report/daily-summary?date=${selectedDate}`);
      setSummary(res.data);
    } catch (e) {
      setSummary({ totalRevenue: 0, totalOrders: 0, items: [] });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrintStatus('printing');
    try {
      window.print();
      setPrintStatus('done');
    } catch (e) {
      setPrintStatus('error');
    }
    setTimeout(() => setPrintStatus(null), 3000);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const avgOrderValue = summary?.totalOrders > 0
    ? Math.round(summary.totalRevenue / summary.totalOrders)
    : 0;

  const topItem = summary?.items?.length > 0
    ? summary.items.reduce((a, b) => a.revenue > b.revenue ? a : b)
    : null;

  return (
    <POSLayout title="Báo Cáo Tổng Kết Ca">
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#f8fafc' }}>

        {/* ─── HEADER ─────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 8px 32px rgba(15, 23, 42, 0.2)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '6px', height: '28px', background: 'linear-gradient(180deg, #f97316, #eb6933)', borderRadius: '3px' }} />
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Báo cáo doanh thu
              </h1>
            </div>
            <p style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem', marginLeft: '16px' }}>
              {formatDate(selectedDate)} · Chi nhánh trung tâm
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Date Picker */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '0 16px',
              height: '46px',
              backdropFilter: 'blur(8px)',
            }}>
              <Calendar size={17} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f1f5f9',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                  height: '100%',
                  colorScheme: 'dark',
                }}
              />
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              style={{
                height: '46px',
                padding: '0 22px',
                background: printStatus === 'error'
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : printStatus === 'done'
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #f97316, #eb6933)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                boxShadow: '0 4px 16px rgba(235,105,51,0.4)',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {printStatus === 'done' ? <CheckCircle2 size={17} /> : printStatus === 'error' ? <AlertTriangle size={17} /> : <Printer size={17} />}
              <span>{printStatus === 'printing' ? 'Đang in...' : printStatus === 'error' ? 'Lỗi máy in!' : printStatus === 'done' ? 'Đã in!' : 'In báo cáo'}</span>
            </button>
          </div>
        </div>

        {/* ─── KPI CARDS ─────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '4px solid #fde68a', borderTopColor: '#eb6933',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

              {/* Revenue Card */}
              <div style={{
                background: 'linear-gradient(135deg, #f97316 0%, #eb6933 60%, #d95a28 100%)',
                borderRadius: '18px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(235,105,51,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tổng doanh thu</span>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                    <Banknote size={18} style={{ color: 'white' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {summary?.totalRevenue?.toLocaleString() || '0'}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>₫</span>
                  </div>
                </div>
              </div>

              {/* Orders Card */}
              <div style={{
                background: 'white',
                borderRadius: '18px',
                padding: '24px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Số đơn hàng</span>
                  <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                    <Receipt size={18} style={{ color: '#64748b' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {summary?.totalOrders || 0}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8' }}>đơn</span>
                </div>
              </div>

              {/* Avg Order Value Card */}
              <div style={{
                background: 'white',
                borderRadius: '18px',
                padding: '24px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Giá trị TB / đơn</span>
                  <div style={{ background: '#fff5f0', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                    <TrendingUp size={18} style={{ color: '#eb6933' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {avgOrderValue.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8' }}>₫</span>
                </div>
              </div>

              {/* Top Item Card */}
              <div style={{
                background: 'white',
                borderRadius: '18px',
                padding: '24px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Món bán chạy nhất</span>
                  <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                    <ShoppingBag size={18} style={{ color: '#16a34a' }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', lineHeight: 1.2, marginBottom: '4px' }}>
                    {topItem?.itemName || '—'}
                  </p>
                  {topItem && (
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#16a34a' }}>
                      {topItem.soldQty} phần · {topItem.revenue.toLocaleString()} ₫
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ─── PRODUCT TABLE ───────────────────── */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              {/* Table Header */}
              <div style={{
                padding: '20px 28px',
                borderBottom: '1.5px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafafa',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#fff5f0', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                    <Utensils size={18} style={{ color: '#eb6933' }} />
                  </div>
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Chi tiết món ăn đã bán
                  </h2>
                </div>
                {summary?.items?.length > 0 && (
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                    {summary.items.length} loại món
                  </span>
                )}
              </div>

              <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '420px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ padding: '12px 28px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>#</th>
                      <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tên món</th>
                      <th style={{ padding: '12px 12px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', width: '120px' }}>Số lượng</th>
                      <th style={{ padding: '12px 28px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', width: '180px' }}>Doanh số</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.items?.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '60px 28px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Utensils size={24} style={{ color: '#cbd5e1' }} />
                            </div>
                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8', margin: 0 }}>Chưa có doanh thu trong ngày này</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      summary?.items?.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff5f0'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '16px 28px', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>{idx + 1}</td>
                          <td style={{ padding: '16px 12px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{item.itemName}</span>
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              background: '#f1f5f9',
                              borderRadius: '8px',
                              padding: '4px 14px',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              color: '#475569',
                            }}>
                              {item.soldQty}
                            </span>
                          </td>
                          <td style={{ padding: '16px 28px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1e293b' }}>{item.revenue.toLocaleString()}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginLeft: '4px' }}>₫</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  {/* Footer Total Row */}
                  {summary?.items?.length > 0 && (
                    <tfoot>
                      <tr style={{
                        background: '#fff5f0',
                        borderTop: '2px solid rgba(235,105,51,0.15)',
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 1,
                        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)'
                      }}>
                        <td style={{ padding: '18px 28px' }} colSpan={2}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tổng cộng</span>
                        </td>
                        <td style={{ padding: '18px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            background: 'rgba(235,105,51,0.12)',
                            borderRadius: '8px',
                            padding: '4px 14px',
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            color: '#eb6933',
                          }}>
                            {summary.items.reduce((s, i) => s + i.soldQty, 0)}
                          </span>
                        </td>
                        <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#eb6933', letterSpacing: '-0.01em' }}>
                            {summary.items.reduce((s, i) => s + i.revenue, 0).toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f97316', marginLeft: '4px' }}>₫</span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Spin keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </POSLayout>
  );
};

export default POSReport;
