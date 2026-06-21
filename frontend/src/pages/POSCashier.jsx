/* Hallmark · component: POSCashier · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Receipt, User, QrCode, Tag, Coins, CreditCard, Wallet, ArrowRight, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import POSLayout from '../components/pos/POSLayout';

const API = 'http://localhost:5000/api/pos';

const POSCashier = () => {
  const [tableSearch, setTableSearch] = useState('');
  const [bill, setBill] = useState(null);
  const [billError, setBillError] = useState('');

  const [customerQuery, setCustomerQuery] = useState('');
  const [customer, setCustomer] = useState(null);
  const [customerError, setCustomerError] = useState('');

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cashReceived, setCashReceived] = useState('');

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBill = useCallback(async (tableID) => {
    if (!tableID.trim()) return;
    setBillError('');
    setBill(null);
    setCustomer(null);
    setVoucherResult(null);
    setVoucherCode('');
    setCashReceived('');
    try {
      const res = await axios.get(`${API}/bill?tableID=${tableID.trim()}`);
      setBill(res.data);
      if (res.data.customer) setCustomer(res.data.customer);
    } catch (e) {
      setBillError(e.response?.data?.message || 'Không tìm thấy hóa đơn cho bàn này');
    }
  }, []);

  const handleFindCustomer = async () => {
    if (!customerQuery.trim()) return;
    setCustomerError('');
    try {
      const res = await axios.get(`${API}/customer?phone=${customerQuery.trim()}`);
      setCustomer(res.data);
      if (bill) {
        await axios.post(`${API}/customer/link-order`, {
          tableID: bill.tableID,
          customerID: res.data.customerID
        });
        showToast(`Đã gắn thẻ thành viên: ${res.data.fullName}`);
      }
    } catch (e) {
      setCustomerError(e.response?.data?.message || 'Không tìm thấy thành viên');
    }
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim() || !bill) return;
    setVoucherError('');
    setVoucherResult(null);
    try {
      const res = await axios.post(`${API}/voucher/validate`, {
        orderID: bill.orderID,
        voucherCode: voucherCode.trim().toUpperCase()
      });
      setVoucherResult(res.data);
      showToast('Áp dụng mã giảm giá thành công!');
    } catch (e) {
      setVoucherError(e.response?.data?.message || 'Mã giảm giá không hợp lệ');
    }
  };

  const finalTotal = voucherResult ? voucherResult.newTotal : bill?.total || 0;
  const change = paymentMethod === 'CASH'
    ? Math.max(0, parseFloat(cashReceived || 0) - finalTotal)
    : 0;

  const handleCheckout = async () => {
    if (!bill) return;
    if (paymentMethod === 'CASH' && parseFloat(cashReceived || 0) < finalTotal) {
      showToast(`Tiền khách đưa chưa đủ. Còn thiếu ${(finalTotal - parseFloat(cashReceived || 0)).toLocaleString()} VNĐ`, 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/checkout`, {
        orderID: bill.orderID,
        paymentMethod,
        cashReceived: parseFloat(cashReceived || 0),
        voucherCode: voucherCode.trim() || undefined
      });
      showToast(`Thanh toán thành công! Tiền thối: ${res.data.change.toLocaleString()} VNĐ`);
      setBill(null);
      setCustomer(null);
      setVoucherResult(null);
      setVoucherCode('');
      setCashReceived('');
      setTableSearch('');
      setCustomerQuery('');
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi xử lý thanh toán', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isChangePositive = paymentMethod === 'CASH' && parseFloat(cashReceived || 0) >= finalTotal;

  return (
    <POSLayout title="Bảng Điều Khiển POS">
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 h-full w-full max-w-[1440px] mx-auto overflow-hidden">
        {/* LEFT PANEL: Bill Details */}
        <section className="flex flex-col bg-white rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 h-11 px-3 bg-white rounded-lg border border-slate-200 focus-within:border-[var(--dashboard-primary)] focus-within:ring-2 focus-within:ring-[var(--dashboard-primary-light)] transition-all min-w-0">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  className="flex-grow h-full bg-transparent text-[var(--dashboard-text-main)] placeholder-slate-400 focus:outline-none text-sm font-medium min-w-0 overflow-hidden text-ellipsis"
                  placeholder="Quét mã QR hoặc nhập Số bàn (VD: TABLE-01)..."
                  value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchBill(tableSearch)}
                  autoFocus
                />
              </div>
              <button
                onClick={() => fetchBill(tableSearch)}
                className="h-11 px-6 bg-[var(--dashboard-text-main)] hover:bg-black text-white rounded-lg font-bold text-sm transition-colors shrink-0 shadow-sm"
              >
                Tải Đơn
              </button>
            </div>
            {billError && <p className="text-[var(--dashboard-danger-text)] text-xs mt-2 font-semibold px-1">{billError}</p>}
          </div>

          {bill ? (
            <>
              {/* Bill Header */}
              <div className="px-6 py-4 flex justify-between items-start shrink-0 border-b border-dashed border-slate-200">
                <div>
                  <h2 className="text-xl font-bold leading-tight text-slate-800 mb-1">
                    {bill.tableName}
                  </h2>
                  {bill.customer && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="bg-[var(--dashboard-primary-light)] text-[var(--dashboard-primary)] p-0.5 rounded">
                        <User size={12} strokeWidth={2.5} />
                      </div>
                      <span className="font-bold text-xs text-slate-700">{bill.customer.fullName}</span>
                      <span className="bg-[var(--dashboard-primary)] text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-1">
                        Thành viên
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-slate-50 rounded text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Mã Đơn: #{bill.orderID?.slice(-6)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-2">
                {Object.values(bill.items.reduce((acc, item) => {
                  if (!acc[item.itemID]) {
                    acc[item.itemID] = { ...item };
                  } else {
                    acc[item.itemID].quantity += item.quantity;
                    acc[item.itemID].subtotal += item.subtotal;
                  }
                  return acc;
                }, {})).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 group hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div>
                      <span className="text-sm font-bold text-slate-800 block group-hover:text-[var(--dashboard-primary)] transition-colors">{item.itemName}</span>
                      <span className="text-xs font-semibold text-slate-400">Số lượng: x{item.quantity}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{item.subtotal.toLocaleString()} ₫</span>
                  </div>
                ))}
              </div>

              {/* Total Area */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 shrink-0">
                {voucherResult && (
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <Tag size={14} /> Khuyến mãi ({voucherCode})
                    </span>
                    <span className="text-[var(--dashboard-primary)] font-bold">- {voucherResult.discountAmount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cần thanh toán</span>
                  <div className="flex items-baseline gap-0.5 text-slate-800">
                    <span className="text-2xl font-black tracking-tight">
                      {finalTotal.toLocaleString()}
                    </span>
                    <span className="text-base font-bold text-slate-500">₫</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2 border border-slate-100">
                <Receipt size={32} strokeWidth={1.5} />
              </div>
              <p className="text-lg font-bold text-slate-700">Chưa có hóa đơn nào được chọn</p>
              <p className="text-sm text-slate-400">Vui lòng quét QR hoặc nhập số bàn để tiếp tục.</p>
            </div>
          )}
        </section>

        {/* RIGHT PANEL: Actions */}
        <section className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-3 pr-1">
            {/* 1. Customer Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <h2 className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={16} /> Khách Hàng Thành Viên
              </h2>
              {customer ? (
                <div className="flex items-center justify-between bg-[var(--dashboard-primary-light)] border border-[rgba(235,105,51,0.15)] px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[var(--dashboard-primary)] font-bold text-base shadow-sm">
                      {customer.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--dashboard-text-main)] text-sm leading-tight">{customer.fullName}</p>
                      <p className="text-xs font-semibold text-[var(--dashboard-primary)] mt-0.5">⭐ {customer.rewardPoints} điểm tích lũy</p>
                    </div>
                  </div>
                  <button onClick={() => { setCustomer(null); setCustomerQuery(''); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--dashboard-danger-bg)] text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-danger-text)] transition-colors">
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className="flex-1 h-[42px] px-3 bg-slate-50 text-[var(--dashboard-text-main)] rounded-lg border border-slate-200 focus:outline-none focus:border-[var(--dashboard-primary)] focus:bg-white transition-all text-sm placeholder:text-xs placeholder-slate-400 font-medium"
                    placeholder="Nhập SĐT khách hàng..."
                    value={customerQuery}
                    onChange={e => setCustomerQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFindCustomer()}
                  />
                  <button onClick={handleFindCustomer} className="h-[42px] px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-sm transition-colors flex items-center gap-1.5 border border-slate-200">
                    <QrCode size={16} /> Tìm
                  </button>
                </div>
              )}
              {customerError && <p className="text-[var(--dashboard-danger-text)] text-xs mt-2 font-semibold">{customerError}</p>}
            </div>

            {/* 2. Voucher Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <h2 className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tag size={16} /> Mã Khuyến Mãi
              </h2>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-[42px] px-3 bg-slate-50 text-[var(--dashboard-text-main)] rounded-lg border border-slate-200 focus:outline-none focus:border-[var(--dashboard-primary)] focus:bg-white transition-all text-sm placeholder:text-xs placeholder-slate-400 font-medium"
                  placeholder="Nhập mã ưu đãi (nếu có)..."
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleValidateVoucher()}
                />
                <button
                  onClick={handleValidateVoucher}
                  disabled={!bill}
                  className="h-[42px] px-4 bg-[var(--dashboard-text-main)] hover:bg-black disabled:opacity-50 disabled:hover:bg-[var(--dashboard-text-main)] text-white rounded-lg font-bold text-sm transition-colors shrink-0"
                >
                  Áp dụng
                </button>
              </div>
              {voucherError && <p className="text-[var(--dashboard-danger-text)] text-xs mt-2 font-semibold">{voucherError}</p>}
              {voucherResult && (
                <p className="text-[var(--dashboard-success-text)] text-xs mt-2 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Áp dụng thành công. Giảm {voucherResult.discountAmount.toLocaleString()} ₫
                </p>
              )}
            </div>

            {/* 3. Payment Method Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <h2 className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard size={16} /> Hình Thức Thanh Toán
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'CASH', icon: Coins, label: 'Tiền mặt' },
                  { value: 'CARD', icon: CreditCard, label: 'Thẻ tín dụng' },
                  { value: 'WALLET', icon: Wallet, label: 'Ví điện tử' },
                ].map(m => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={`h-11 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      paymentMethod === m.value
                        ? 'border-[var(--dashboard-primary)] bg-[var(--dashboard-primary-light)] text-[var(--dashboard-primary)] font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <m.icon size={16} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Cash Flow Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col gap-4">
              <div>
                <span className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider block mb-2">Tiền Khách Đưa</span>
                <div className="flex items-center justify-end w-full h-[42px] px-3 bg-slate-50 border border-slate-200 rounded-lg focus-within:bg-white focus-within:border-[var(--dashboard-primary)] transition-all">
                  <input
                    type="number"
                    className="w-full bg-transparent text-right font-bold text-lg text-slate-800 focus:outline-none placeholder-slate-400"
                    value={cashReceived}
                    onChange={e => setCashReceived(e.target.value)}
                    disabled={paymentMethod !== 'CASH'}
                    placeholder="0"
                  />
                  <span className="ml-1 text-lg font-bold text-slate-500">đ</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider">Tiền Thừa Trả Khách</span>
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-2xl font-bold tracking-tight ${isChangePositive ? 'text-green-600' : 'text-slate-400'}`}>
                    {change.toLocaleString()}
                  </span>
                  <span className={`text-lg font-bold ${isChangePositive ? 'text-green-600' : 'text-slate-400'}`}>đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Checkout Button / Cooking Warning */}
          <div className="pt-3 border-t border-slate-100 bg-white lg:bg-transparent shrink-0">
            {bill && bill.items?.some(item => item.status === 'WAITING' || item.status === 'COOKING') ? (
              <div className="w-full text-center p-4 bg-[var(--dashboard-warning-bg)] text-[var(--dashboard-warning-text)] rounded-lg font-semibold border border-yellow-200 flex items-center justify-center gap-3">
                 <AlertTriangle size={20} strokeWidth={2.5} className="shrink-0 text-yellow-600" />
                 <span className="text-left text-xs leading-tight">Chưa thể thanh toán do có món ăn đang <br/> {bill.items.some(i => i.status === 'WAITING') ? '"Chờ tiếp nhận"' : '"Đang chế biến"'}. Vui lòng đợi bếp hoàn thành!</span>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={!bill || loading}
                className={`w-full h-[50px] rounded-lg text-base font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 select-none ${
                  !bill || loading
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-[var(--dashboard-primary)] text-white hover:bg-[var(--dashboard-primary-hover)] active:scale-[0.98] active:translate-y-[1.5px] cursor-pointer shadow-[0_4px_12px_rgba(235,105,51,0.2)]'
                }`}
              >
                <span>{loading ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN HÓA ĐƠN'}</span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300
          ${toast.type === 'error' ? 'bg-[var(--dashboard-danger-text)] text-white' : 'bg-[var(--dashboard-success-text)] text-white'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          {toast.msg}
        </div>
      )}
    </POSLayout>
  );
};

export default POSCashier;
