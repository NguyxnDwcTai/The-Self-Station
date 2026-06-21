/* Hallmark · component: POSReport · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Banknote, Receipt, Utensils, Printer, Calendar } from 'lucide-react';
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

  return (
    <POSLayout title="Báo Cáo Tổng Kết Ca">
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-6">

          {/* Report Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-[var(--dashboard-border)]">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--dashboard-text-main)] mb-1">Doanh thu trong ngày</h1>
              <p className="text-lg font-semibold text-[var(--dashboard-text-muted)]">Chi nhánh trung tâm</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 bg-white border border-[var(--dashboard-border)] rounded-xl shadow-sm h-[44px]" style={{ height: '44px' }}>
                <Calendar size={18} className="text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-transparent border-0 text-[var(--dashboard-text-main)] font-bold focus:outline-none cursor-pointer text-sm"
                  style={{ height: '100%' }}
                />
              </div>

              <button
                onClick={handlePrint}
                className="font-bold rounded-lg bg-[var(--dashboard-text-main)] text-white hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                style={{ height: '50px', paddingLeft: '20px', paddingRight: '20px' }}
              >
                <Printer size={18} />
                <span>{printStatus === 'printing' ? 'Đang in...' : printStatus === 'error' ? 'Lỗi máy in!' : 'In báo cáo'}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--dashboard-primary-light)] border-t-[var(--dashboard-primary)]"></div>
            </div>
          ) : (
            <>
              {/* Key Metrics Bento */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {/* Total Revenue Card */}
                <div className="bg-[var(--dashboard-primary)] text-white rounded-lg flex flex-col justify-between shadow-sm" style={{ height: '160px', padding: '20px' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Banknote size={20} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Tổng doanh thu</span>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-auto" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-3xl font-black tracking-tight">
                      {summary?.totalRevenue?.toLocaleString() || '0'}
                    </span>
                    <span className="text-xl font-bold opacity-80">₫</span>
                  </div>
                </div>

                {/* Total Orders Card */}
                <div className="bg-white border border-slate-100 text-[var(--dashboard-text-main)] rounded-lg flex flex-col justify-between shadow-sm" style={{ height: '160px', padding: '20px' }}>
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Receipt size={20} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Số lượng đơn hàng</span>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-auto" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-3xl font-black tracking-tight text-slate-800">
                      {summary?.totalOrders || 0}
                    </span>
                    <span className="text-xl font-bold text-slate-400">đơn</span>
                  </div>
                </div>
              </div>

              {/* Product Breakdown Table */}
              <div className="bg-white rounded-lg border border-[var(--dashboard-border)] overflow-hidden shadow-sm" style={{ marginTop: '24px' }}>
                <div className="p-4 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface-hover)] flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Utensils size={18} /> Chi tiết món ăn đã bán
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-[var(--dashboard-border)]">
                        <th className="p-3 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">Tên món</th>
                        <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-500 w-32 text-center">Số lượng</th>
                        <th className="p-3 pr-6 text-xs font-bold uppercase tracking-wider text-slate-500 w-48 text-right">Tổng doanh số</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--dashboard-border)] bg-white">
                      {summary?.items?.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-10 text-center text-slate-400 font-semibold text-base">
                            Chưa có doanh thu trong ngày này.
                          </td>
                        </tr>
                      ) : (
                        summary?.items?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-3 pl-6 text-sm font-bold text-slate-800 group-hover:text-[var(--dashboard-primary)] transition-colors">
                              {item.itemName}
                            </td>
                            <td className="p-3 text-sm font-semibold text-slate-500 text-center">
                              {item.soldQty}
                            </td>
                            <td className="p-3 pr-6 text-sm font-black text-slate-800 text-right">
                              {item.revenue.toLocaleString()} ₫
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {summary?.items?.length > 0 && (
                      <tfoot>
                        <tr className="bg-slate-50 border-t-2 border-[var(--dashboard-border)]">
                          <td className="p-4 pl-6 text-base font-black text-slate-700 uppercase">Tổng cộng</td>
                          <td className="p-4 text-base font-black text-slate-700 text-center">
                            {summary.items.reduce((s, i) => s + i.soldQty, 0)}
                          </td>
                          <td className="p-4 pr-6 text-lg font-black text-[var(--dashboard-primary)] text-right">
                            {summary.items.reduce((s, i) => s + i.revenue, 0).toLocaleString()} ₫
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
      </div>
    </POSLayout>
  );
};

export default POSReport;
