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

  const [newCustomerName, setNewCustomerName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

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

  const handleRegisterCustomer = async () => {
    if (!newCustomerName.trim() || !customerQuery.trim()) {
      showToast('Vui lòng nhập tên khách hàng', 'error');
      return;
    }
    setIsRegistering(true);
    try {
      const res = await axios.post(`${API}/customer/register`, {
        phone: customerQuery.trim(),
        fullName: newCustomerName.trim(),
        tableID: bill?.tableID
      });
      setCustomer(res.data.customer);
      setCustomerError('');
      showToast(`Đăng ký thành công! Đã gắn thẻ: ${res.data.customer.fullName}`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi đăng ký thành viên', 'error');
    } finally {
      setIsRegistering(false);
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
        <section className="flex flex-col gap-6 h-full overflow-hidden bg-slate-50/80 p-6 rounded-2xl">
          {/* Search Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0" style={{ marginTop: '20px', marginLeft: '10px' }}>
            <div className="flex items-center gap-4" style={{ padding: '10px' }}>
              <div className="flex-1 flex items-center gap-3 h-12 px-4 rounded-xl border border-slate-200 focus-within:border-[var(--dashboard-primary)] focus-within:ring-2 focus-within:ring-[var(--dashboard-primary-light)] transition-all bg-slate-50 focus-within:bg-white min-w-0" style={{ padding: '10px' }}>
                <Search size={20} className="text-slate-400 shrink-0" />
                <input
                  className="flex-grow h-full bg-transparent text-[var(--dashboard-text-main)] placeholder-slate-400 focus:outline-none text-sm font-medium min-w-0 overflow-hidden text-ellipsis"
                  placeholder="Nhập Số bàn (VD: TABLE-01)..."
                  value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchBill(tableSearch)}
                  autoFocus
                />
              </div>
              <button
                onClick={() => fetchBill(tableSearch)}
                style={{
                  height: '46px',
                  padding: '0 22px',
                  background: 'linear-gradient(135deg, #f97316, #eb6933)',
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
                Tìm kiếm
              </button>
            </div>
            {billError && <p className="text-[var(--dashboard-danger-text)] text-xs mt-3 font-semibold px-2" style={{ paddingLeft: '10px', paddingBottom: '10px' }}>{billError}</p>}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ marginTop: '20px', marginLeft: '10px' }}>
            {bill ? (
              <>
                {/* Bill Header */}
                <div className="px-6 py-5 flex justify-between items-start shrink-0 border-b border-dashed border-slate-200 bg-slate-50/30" style={{ padding: '10px' }}>
                  <div>
                    <h2 className="text-2xl font-bold leading-tight text-slate-800 mb-1.5">
                      {bill.tableName}
                    </h2>
                    {bill.customer && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="bg-[var(--dashboard-primary-light)] text-[var(--dashboard-primary)] p-1 rounded-md">
                          <User size={14} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm text-slate-700">{bill.customer.fullName}</span>
                        <span className="bg-[var(--dashboard-primary)] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-1">
                          Thành viên
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-slate-600 text-xs font-bold uppercase tracking-wider">
                      Mã Đơn: #{bill.orderID?.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4" style={{ padding: '10px' }}>
                  {Object.values(bill.items.reduce((acc, item) => {
                    if (!acc[item.itemID]) {
                      acc[item.itemID] = { ...item };
                    } else {
                      acc[item.itemID].quantity += item.quantity;
                      acc[item.itemID].subtotal += item.subtotal;
                    }
                    return acc;
                  }, {})).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 group hover:bg-slate-50 -mx-3 px-3 rounded-xl transition-colors" style={{ paddingBottom: '5px' }}>
                      <div>
                        <span className="text-base font-bold text-slate-800 block group-hover:text-[var(--dashboard-primary)] transition-colors" style={{ paddingBottom: '5px' }}>{item.itemName}</span>
                        <span className="text-sm font-semibold text-slate-400 mt-0.5 block">Số lượng: x{item.quantity}</span>
                      </div>
                      <span className="text-base font-bold text-slate-800">{item.subtotal.toLocaleString()} ₫</span>
                    </div>
                  ))}
                </div>

                {/* Total Area */}
                <div className="px-6 py-5 bg-slate-50/80 border-t border-slate-200 shrink-0">
                  {voucherResult && (
                    <div className="flex justify-between items-center text-sm mb-3" style={{ padding: '10px' }}>
                      <span className="font-semibold text-slate-500 flex items-center gap-2">
                        <Tag size={16} /> Khuyến mãi ({voucherCode})
                      </span>
                      <span className="text-[var(--dashboard-primary)] font-bold text-base">- {voucherResult.discountAmount.toLocaleString()} ₫</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center" style={{ padding: '10px' }}>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cần thanh toán</span>
                    <div className="flex items-baseline gap-1 text-slate-800">
                      <span className="text-3xl font-black tracking-tight">
                        {finalTotal.toLocaleString()}
                      </span>
                      <span className="text-lg font-bold text-slate-500">₫</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
                <p className="text-xl font-bold text-slate-800" style={{ padding: '5px' }}>Chưa có hóa đơn nào được chọn</p>
                <button
                  onClick={() => document.querySelector('input[placeholder*="Nhập Số bàn"]')?.focus()}
                  className="mt-6 px-6 py-2.5 rounded-xl border-2 border-[var(--dashboard-primary)] text-[var(--dashboard-primary)] font-bold text-sm hover:bg-[var(--dashboard-primary-light)] transition-colors active:scale-95" style={{ padding: '5px' }}
                >
                  Nhập số bàn thủ công
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: Actions */}
        <section className="flex flex-col h-full overflow-hidden" style={{ marginTop: '20px', marginRight: '35px' }}>
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-3 pr-1">
            {/* 1. Customer Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]" style={{ padding: '5px' }} >
              <h2 className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2" style={{ padding: '5px' }}>
                <User size={16} /> Khách Hàng Thành Viên
              </h2>
              {customer ? (
                <div className="flex items-center justify-between bg-[var(--dashboard-primary-light)] border border-[rgba(235,105,51,0.15)] px-4 py-3 rounded-lg" style={{ padding: '5px', margin: '5px' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[var(--dashboard-primary)] font-bold text-base shadow-sm">
                      {customer.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--dashboard-text-main)] text-sm leading-tight">{customer.fullName}</p>
                      <p className="text-xs font-semibold text-[var(--dashboard-primary)] mt-0.5">{customer.rewardPoints} điểm tích lũy</p>
                    </div>
                  </div>
                  <button onClick={() => { setCustomer(null); setCustomerQuery(''); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--dashboard-danger-bg)] text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-danger-text)] transition-colors">
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2" style={{ padding: '5px' }}>
                  <input
                    className="flex-1 h-[42px] px-3 bg-slate-50 text-[var(--dashboard-text-main)] rounded-lg border border-slate-200 focus:outline-none focus:border-[var(--dashboard-primary)] focus:bg-white transition-all text-sm placeholder:text-xs placeholder-slate-400 font-medium" style={{ padding: '5px' }}
                    placeholder="Nhập SĐT khách hàng..."
                    value={customerQuery}
                    onChange={e => setCustomerQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFindCustomer()}
                  />
                  <button
                    onClick={handleFindCustomer}
                    style={{
                      height: '42px',
                      padding: '0 16px',
                      background: 'linear-gradient(135deg, #f97316, #eb6933)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 16px rgba(235,105,51,0.4)',
                      transition: 'all 0.2s',
                      letterSpacing: '0.02em',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <QrCode size={16} /> Tìm
                  </button>
                </div>
              )}
              {customerError && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg" style={{ padding: '10px', margin: '5px' }}>
                  <p className="text-[var(--dashboard-danger-text)] text-xs font-semibold mb-2" style={{ paddingBottom: '5px' }}>{customerError}</p>
                  <p className="text-xs text-slate-500 font-medium mb-2" style={{ paddingBottom: '5px' }}>Chưa có tài khoản? Đăng ký ngay để tích điểm:</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-[36px] px-3 bg-white text-slate-800 rounded-md border border-slate-300 focus:outline-none focus:border-[var(--dashboard-primary)] transition-all text-xs placeholder-slate-400 font-medium" style={{ padding: '5px' }}
                      placeholder="Nhập tên khách hàng..."
                      value={newCustomerName}
                      onChange={e => setNewCustomerName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRegisterCustomer()}
                    />
                    <button
                      onClick={handleRegisterCustomer}
                      disabled={isRegistering}
                      style={{
                        height: '36px',
                        padding: '0 12px',
                        background: isRegistering ? '#e2e8f0' : 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '6px',
                        color: isRegistering ? '#94a3b8' : 'white',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: isRegistering ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { if (!isRegistering) e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { if (!isRegistering) e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      {isRegistering ? 'Đang ĐK...' : 'Đăng ký & Tích điểm'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Voucher Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]" style={{ padding: '10px' }}>
              <h2 className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2" style={{ padding: '5px' }}>
                <Tag size={16} /> Mã Khuyến Mãi
              </h2>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-[42px] px-3 bg-slate-50 text-[var(--dashboard-text-main)] rounded-lg border border-slate-200 focus:outline-none focus:border-[var(--dashboard-primary)] focus:bg-white transition-all text-sm placeholder:text-xs placeholder-slate-400 font-medium" style={{ padding: '5px' }}
                  placeholder="Nhập mã ưu đãi (nếu có)..."
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleValidateVoucher()}
                />
                <button
                  onClick={handleValidateVoucher}
                  disabled={!bill}
                  style={{
                    height: '42px',
                    padding: '0 16px',
                    background: !bill ? '#e2e8f0' : 'linear-gradient(135deg, #f97316, #eb6933)',
                    border: 'none',
                    borderRadius: '10px',
                    color: !bill ? '#94a3b8' : 'white',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: !bill ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: !bill ? 'none' : '0 4px 16px rgba(235,105,51,0.4)',
                    transition: 'all 0.2s',
                    letterSpacing: '0.02em',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (bill) e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { if (bill) e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  Áp dụng
                </button>
              </div>
              {voucherError && <p className="text-[var(--dashboard-danger-text)] text-xs mt-2 font-semibold">{voucherError}</p>}
              {voucherResult && (
                <p className="text-[var(--dashboard-success-text)] text-xs mt-2 font-bold flex items-center gap-1" style={{ marginTop: '10px' }}>
                  <CheckCircle2 size={14} /> Áp dụng thành công. Giảm {voucherResult.discountAmount.toLocaleString()} ₫
                </p>
              )}
            </div>

            {/* 3. Payment Method Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]" style={{ padding: '5px' }}>
              <h2 className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2" style={{ padding: '5px' }}>
                <CreditCard size={16} /> Hình Thức Thanh Toán
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'CASH', icon: Coins, label: 'Tiền mặt' },
                  { value: 'CARD', icon: CreditCard, label: 'Thẻ tín dụng' },
                  { value: 'WALLET', icon: Wallet, label: 'Ví điện tử' },
                ].map(m => {
                  const isActive = paymentMethod === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={`relative h-[72px] rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 overflow-hidden ${isActive
                        ? 'text-white z-10'
                        : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow-sm'
                        }`}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, #f97316, #eb6933)',
                        boxShadow: '0 6px 16px rgba(235,105,51,0.35)',
                        transform: 'scale(1.02)',
                        border: '1px solid transparent'
                      } : {}}
                    >
                      <m.icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                      <span className={`text-[11px] font-bold tracking-wide uppercase ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                        {m.label}
                      </span>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 text-white/90">
                          <CheckCircle2 size={14} weight="fill" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Cash Flow Card / QR Code */}
            <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col gap-4" style={{ padding: '10px' }}>
              {paymentMethod === 'CASH' ? (
                <>
                  <div>
                    <span className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider block mb-2">Tiền Khách Đưa</span>
                    <div className="flex items-center justify-end w-full h-[42px] px-3 bg-slate-50 border border-slate-200 rounded-lg focus-within:bg-white focus-within:border-[var(--dashboard-primary)] transition-all">
                      <input
                        type="number"
                        className="w-full bg-transparent text-right font-bold text-lg text-slate-800 focus:outline-none placeholder-slate-400"
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
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
                </>
              ) : paymentMethod === 'CARD' ? (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 border-4 border-blue-100">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Thanh toán qua Thẻ</h3>
                    <p className="text-xs text-slate-500 max-w-[220px] mx-auto">Vui lòng yêu cầu khách hàng chạm hoặc quẹt thẻ trên thiết bị mPOS/SmartPOS.</p>
                  </div>
                  {bill && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-baseline gap-1">
                      <span className="text-sm font-semibold">Cần thu:</span>
                      <span className="font-bold text-lg">{finalTotal.toLocaleString()} đ</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <span className="text-xs font-bold text-[var(--dashboard-text-muted)] uppercase tracking-wider">Quét Mã QR (Ví / Ngân Hàng)</span>
                  {bill ? (
                    <div className="p-2 bg-white border-2 border-dashed border-[var(--dashboard-primary)] rounded-xl relative group">
                      <img
                        src={`https://img.vietqr.io/image/MB-5005005556556-compact2.png?amount=${finalTotal}&addInfo=Thanh toan don hang ${bill.orderID?.slice(-6)}&accountName=THE SELF STATION`}
                        alt="QR Code"
                        className="w-40 h-40 object-contain transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400">
                      <QrCode size={40} opacity={0.5} />
                    </div>
                  )}
                  <div className="text-sm mt-1">
                    <p className="font-bold text-slate-800">MBBank - 5005005556556</p>
                    <p className="font-bold text-[var(--dashboard-primary)] text-xl mt-1">{finalTotal.toLocaleString()} đ</p>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 mt-1 max-w-[200px]">Hỗ trợ quét mã bằng MoMo, ZaloPay, VNPay và các App Ngân hàng</p>
                </div>
              )}
            </div>
          </div>

          {/* 5. Checkout Button / Cooking Warning */}
          <div style={{
            flexShrink: 0,
            borderTop: '1.5px solid #f1f5f9',
            paddingTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* Total Summary Bar */}
            {bill && (
              <div style={{
                background: 'linear-gradient(135deg, #fff5f0 0%, #fff0ea 100%)',
                border: '1.5px solid rgba(235,105,51,0.2)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#eb6933', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Tổng cần thanh toán</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', lineHeight: 1 }}>{finalTotal.toLocaleString()}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>₫</span>
                  </div>
                </div>
                {paymentMethod === 'CASH' && parseFloat(cashReceived || 0) >= finalTotal && (
                  <div style={{
                    textAlign: 'right',
                    background: '#dcfce7',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '8px 14px',
                  }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Tiền thối</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d', letterSpacing: '-0.01em' }}>{change.toLocaleString()} ₫</p>
                  </div>
                )}
              </div>
            )}

            {bill && bill.items?.some(item => item.status === 'WAITING' || item.status === 'COOKING') ? (
              <div style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1.5px solid #fcd34d',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 4px 16px rgba(251, 191, 36, 0.12)',
                marginBottom: '25px'
              }}>
                <div style={{
                  flexShrink: 0,
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fef08a, #fde68a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
                }}>
                  <AlertTriangle size={20} strokeWidth={2.5} style={{ color: '#d97706' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Chưa thể thanh toán</p>
                  <p style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 500, lineHeight: 1.5 }}>
                    Còn món {bill.items.some(i => i.status === 'WAITING') ? <strong>"Chờ tiếp nhận"</strong> : <strong>"Đang chế biến"</strong>}. Đợi bếp hoàn thành!
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={!bill || loading}
                style={(!bill || loading) ? {
                  width: '100%',
                  height: '56px',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  marginBottom: '30px',
                } : {
                  width: '100%',
                  height: '56px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f97316 0%, #eb6933 50%, #d95a28 100%)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 6px 20px rgba(235, 105, 51, 0.35), 0 2px 8px rgba(235, 105, 51, 0.2)',
                  transition: 'all 0.2s',
                  marginBottom: '30px',
                }}
                onMouseEnter={e => { if (bill && !loading) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(235, 105, 51, 0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = bill && !loading ? '0 6px 20px rgba(235, 105, 51, 0.35), 0 2px 8px rgba(235, 105, 51, 0.2)' : 'none'; }}
                onMouseDown={e => { if (bill && !loading) e.currentTarget.style.transform = 'translateY(1px) scale(0.99)'; }}
                onMouseUp={e => { if (bill && !loading) e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                    Thanh toán hóa đơn
                  </>
                )}
              </button>
            )}
          </div>

        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300
          ${toast.type === 'error' ? 'bg-[var(--dashboard-danger-text)] text-white' : 'bg-[var(--dashboard-success-text)] text-white'}`} style={{ padding: '5px' }}>
          {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          {toast.msg}
        </div>
      )}
    </POSLayout>
  );
};

export default POSCashier;
