import { useState, useEffect } from 'react';
import { DollarSign, Receipt, PlusCircle, Tag, UserPlus, TrendingUp, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useLanguage } from '../contexts/LanguageContext';
import './AdminTheme.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ revenue: 0, orders: 0 });
  const [orders, setOrders] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [chartBars, setChartBars] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        if (loading && isMounted) setLoading(true);
        const res = await api.get('/orders');
        const data = res.data || [];
        
        let totalRev = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        
        data.forEach(o => {
           if(o.status === 2 && o.orderDate && o.orderDate.startsWith(todayStr)) {
             totalRev += parseFloat(o.totalAmount || 0);
           }
        });

        if (isMounted) {
          setStats({
            revenue: totalRev,
            orders: data.length
          });

          setOrders(data.sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate)));        
        }

        // Fetch Top Items
        const topRes = await api.get('/reports/top-items');
        if (isMounted && topRes.data && topRes.data.data) {
           setTopItems(topRes.data.data.slice(0, 5));
        }

        // Fetch Chart Data
        const chartRes = await api.get('/reports/revenue-chart?period=30days');
        if (isMounted && chartRes.data && chartRes.data.data) {
          const rawData = chartRes.data.data.slice(-7);
          const rawLabels = chartRes.data.labels.slice(-7);
          // Calculate heights as percentage of max
          const maxVal = Math.max(...rawData, 1);
          setChartBars(rawData.map(val => Math.round((val / maxVal) * 100)));
          setChartLabels(rawLabels);
        }

      } catch(e) {
        console.error("Lỗi fetch dashboard", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchDashboard();
    
    const interval = setInterval(fetchDashboard, 15000); // Refresh every 15s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getOrderStatus = (status) => {
    if(status === 2) return { text: 'HOÀN THÀNH', badgeClass: 'badge-success' };
    if(status === 1) return { text: 'PHỤC VỤ', badgeClass: 'badge-warning' };
    return { text: 'CHỜ', badgeClass: 'badge-danger' }; // status 0
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">{t.dashOverview}</h1>
        {/* Action Strip (Command Menu) moved to header area to save space */}
        <div className="action-strip" style={{ marginBottom: 0 }}>
          <button className="action-btn" onClick={() => navigate('/menu')}>
            <PlusCircle size={18} />
            {t.dashAddMenu}
          </button>
          <button className="action-btn" onClick={() => navigate('/promotions')}>
            <Tag size={18} />
            {t.dashAddPromo}
          </button>
          <button className="action-btn" onClick={() => navigate('/accounts')}>
            <UserPlus size={18} />
            {t.dashAddStaff}
          </button>
        </div>
      </div>

      {/* KPI Banner (Stat-Led) */}
      <div className="kpi-banner">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{t.dashRevToday}</span>
            <span className="kpi-value">{stats.revenue.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrap secondary">
            <Receipt size={24} strokeWidth={2.5} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{t.dashTotalOrders}</span>
            <span className="kpi-value">{stats.orders}</span>
          </div>
        </div>
      </div>

      {/* Workbench Layout */}
      <div className="workbench-grid">
        
        {/* Left Column: Data Visualization & Orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Revenue Chart */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{t.dashRevChart}</h3>
              <TrendingUp size={20} color="var(--dashboard-text-muted)" />
            </div>
            
            <div className="chart-container">
              {(() => {
                const W = 600, H = 200, PAD = 20;
                const n = chartBars.length;
                if (n === 0) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dashboard-text-muted)' }}>Đang tải dữ liệu...</div>;
                const xs = chartBars.map((_, i) => PAD + (i / (n - 1)) * (W - PAD * 2));
                const ys = chartBars.map(h => PAD + (1 - h / 100) * (H - PAD * 2 - 30));
                const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
                const areaPath = `${linePath} L${xs[n-1]},${H - 30} L${xs[0]},${H - 30} Z`;
                
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--dashboard-primary)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--dashboard-primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(pct => {
                      const y = PAD + (1 - pct / 100) * (H - PAD * 2 - 30);
                      return <line key={pct} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="var(--dashboard-border)" strokeWidth="1" strokeDasharray="4 4" />;
                    })}
                    {/* Area fill */}
                    <path d={areaPath} fill="url(#chartAreaGrad)" />
                    {/* Line */}
                    <path d={linePath} fill="none" stroke="var(--dashboard-primary)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                    {/* Dots + Labels */}
                    {xs.map((x, i) => (
                      <g key={i} style={{ cursor: 'pointer' }} className="chart-point">
                        <circle cx={x} cy={ys[i]} r="5" fill="var(--dashboard-surface)" stroke="var(--dashboard-primary)" strokeWidth="2.5" />
                        <text x={x} y={H - 5} textAnchor="middle" style={{ fontSize: '11px', fill: 'var(--dashboard-text-muted)', fontWeight: 600 }}>
                          {chartLabels[i] || `T${i+2}`}
                        </text>
                      </g>
                    ))}
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* Recent Orders Compact */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{t.dashRecentOrders}</h3>
              <button className="panel-action" onClick={() => setIsDrawerOpen(true)}>
                {t.dashViewAll} <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }}/>
              </button>
            </div>
            <div className="data-list">
              {loading ? <div style={{ color: 'var(--dashboard-text-muted)' }}>Đang tải...</div> :
                orders.slice(0, 5).map(o => {
                  const st = getOrderStatus(o.status);
                  return (
                    <div key={o.orderID} className="data-row">
                      <div>
                        <div className="data-id">#{o.orderID}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-muted)', marginTop: '4px' }}>
                          {new Date(o.orderDate || o.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={`status-badge ${st.badgeClass}`}>{st.text}</span>
                        <div className="data-amount">{parseFloat(o.totalAmount).toLocaleString('vi-VN')} ₫</div>
                      </div>
                    </div>
                  );
                })
              }
              {orders.length === 0 && !loading && <div style={{ color: 'var(--dashboard-text-muted)' }}>{t.dashOrderEmpty}</div>}
            </div>
          </div>
        </div>

        {/* Right Column: Rankings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="dashboard-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <h3 className="panel-title">{t.dashTopSelling}</h3>
            </div>
            <div className="rank-list">
              {topItems.length === 0 && !loading && <div style={{ color: 'var(--dashboard-text-muted)' }}>{t.dashOrderEmpty}</div>}
              {topItems.map((m, i) => {
                const isDrink = m.categoryName && (m.categoryName.toLowerCase().includes('cà phê') || m.categoryName.toLowerCase().includes('trà') || m.categoryName.toLowerCase().includes('nước') || m.categoryName.toLowerCase().includes('uống'));
                return (
                  <div key={m.itemID} className="rank-item">
                    <div className="rank-left">
                      <div className="rank-number">{i + 1}</div>
                      <div className="rank-name">{m.itemName}</div>
                    </div>
                    <div className="rank-count">{m.soldCount} <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{isDrink ? 'ly' : 'phần'}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Overlay (Replaces Giant Modal) */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="drawer-title">{t.dashOrderSys}</h2>
            <button className="drawer-close" onClick={() => setIsDrawerOpen(false)} aria-label="Đóng">
              <X size={20} />
            </button>
          </div>
          <div className="drawer-body">
            {orders.length === 0 ? (
              <p style={{ color: 'var(--dashboard-text-muted)' }}>Chưa có đơn hàng nào.</p>
            ) : (
              <table className="full-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const st = getOrderStatus(o.status);
                    return (
                      <tr key={o.orderID}>
                        <td style={{ fontWeight: 600 }}>#{o.orderID}</td>
                        <td style={{ color: 'var(--dashboard-text-muted)' }}>
                          {new Date(o.orderDate || o.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td>
                          <span className={`status-badge ${st.badgeClass}`}>{st.text}</span>
                        </td>
                        <td style={{ fontWeight: 700, textAlign: 'right' }}>
                          {parseFloat(o.totalAmount).toLocaleString('vi-VN')} ₫
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
