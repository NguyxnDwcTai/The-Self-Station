import { useState, useEffect } from 'react';
import { Scan, QrCode } from 'lucide-react';

export default function KioskMenu({ menuItems, cart, handleUpdateCart, submitOrder, setView, isSubmitted, isReadOnly }) {
  const [activeCategory, setActiveCategory] = useState('');

  // Lọc ra các category distinct từ DB và sắp xếp theo sortOrder
  const dynamicCats = [...new Map(
    menuItems.map(item => [item.category?.categoryName || 'Khác', item.category])
  ).values()]
  .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
  .map(cat => cat?.categoryName || 'Khác');

  const getIconForCat = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('cà phê') || lower.includes('cafe')) return '☕';
    if (lower.includes('tráng') || lower.includes('ngọt') || lower.includes('bánh')) return '🍦';
    if (lower.includes('uống') || lower.includes('nước') || lower.includes('trà') || lower.includes('giải khát')) return '🍸';
    if (lower.includes('salad') || lower.includes('khai vị')) return '🥗';
    if (lower.includes('kèm') || lower.includes('side')) return '🍟';
    return '🍴';
  };

  const categories = dynamicCats.map(name => ({ id: name, icon: getIconForCat(name) }));

  useEffect(() => {
    if (categories.length > 0 && (!activeCategory || !categories.some(c => c.id === activeCategory))) {
      setActiveCategory(categories[0].id);
    }
  }, [categories.length]);

  const filteredMenu = menuItems.filter(item => (item.category?.categoryName || 'Khác') === activeCategory);

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const formatPrice = (price) => {
    const k = Number(price) / 1000;
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(0)}k`;
  };

  return (
    <div className="flex-1 flex h-full relative overflow-hidden">

      {/* ── COLUMN 2: CATEGORIES ── */}
      <div className="w-[300px] bg-[#E8E6DA] h-full flex flex-col border-r border-[#d9d6cc] shrink-0">
        <h2 className="text-[32px] font-bold text-[#3d3a35] mt-12 mb-10" style={{ marginLeft: '20px', marginTop: '30px', marginBottom: '30px' }}>Danh Mục</h2>

        {/* Category list */}
        <div className="flex flex-col gap-5 flex-1 overflow-y-auto hide-scrollbar pb-8 items-center">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  backgroundColor: isActive ? '#944A00' : '#FFFFFF',
                  width: 'calc(100% - 40px)',
                }}
                className={`flex items-center gap-4 px-5 h-[55px] rounded-[8px] transition-all duration-200 shadow-sm hover:shadow-md shrink-0 ${
                  isActive ? 'text-white' : 'text-[#3d3a35]'
                }`}
              >
                <span
                  className="text-[26px] shrink-0" 
                  style={{ color: isActive ? '#fff' : '#125838', marginLeft: '10px' }}
                >
                  {cat.icon}
                </span>
                <span className="text-[20px] font-semibold leading-tight">{cat.id}</span>
              </button>
            );
          })}
        </div>
      </div>




      {/* ── COLUMN 3: PRODUCT GRID ── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#fdfaf0] px-12 pt-12 pb-36">
        {/* Section header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[#125838] text-[13px] font-bold tracking-[0.1em] uppercase mb-2" style={{ marginLeft: '30px', marginTop: '40px'}}>
              Thực đơn đặc sắc
            </p>
            <h2 className="text-[40px] font-bold text-[#3d3a35] leading-none" style={{ marginLeft: '30px'}}>{activeCategory}</h2>
          </div>
          <p className="text-gray-500 font-medium text-[15px] mb-1" style={{ marginRight: '30px'}}>{filteredMenu.length} món khả dụng</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-12" style={{ margin: '30px'}}>
          {filteredMenu.map(m => {
            const isOutOfStock = m.isActive === false;
            return (
              <div key={m.itemID} className={`flex flex-col group ${isOutOfStock ? 'opacity-60 grayscale-[0.8]' : ''}`}>
                {/* Image area with price badge */}
                <div className="relative w-full aspect-square mb-4">
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-[#e4e2e2]/40 z-20 flex items-center justify-center backdrop-blur-[1px] rounded-[8px]">
                      <span className="bg-[#ffffff] px-3 py-1 rounded-[8px] text-[12px] leading-[16px] tracking-[0.05em] font-[600] text-[#1b1c1c] shadow-sm" style = {{padding: '5px'}}>Hết hàng</span>
                    </div>
                  )}
                  <img
                    src={m.imageURL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400'}
                    alt={m.itemName}
                    className="w-full h-[260px] object-cover rounded-[8px] group-hover:shadow-md transition-shadow"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400'; }}
                  />
                  {/* Price badge formatted as '145k' */}
                  <span className="absolute top-4 right-4 bg-[#34D399] text-white text-[14px] font-bold px-3 py-1 rounded-[8px] shadow-sm z-10 text-center" style={{width: '40px'}}>
                    {Math.round(m.price / 1000)}k
                  </span>
                </div>

                {/* Name + Button */}
                <div className="flex flex-col flex-1 px-1">
                  <h3 className="text-[18px] font-bold text-[#3d3a35] line-clamp-2 leading-tight mb-4 flex-1" style={{marginTop: '10px', marginBottom: '10px'}}>
                    {m.itemName}
                  </h3>
                  <button
                    onClick={() => !isOutOfStock && !isReadOnly && handleUpdateCart(m, 1)}
                    disabled={isOutOfStock || isReadOnly}
                    style={{ minHeight: '44px', backgroundColor: 'white', height: '44px', cursor: (isOutOfStock || isReadOnly) ? 'not-allowed' : 'pointer', opacity: isReadOnly ? 0.5 : 1 }}
                    className="w-full text-[#9B5110] font-semibold py-2.5 rounded-[8px] text-[15px] border border-[#e0ddd6] transition-all flex justify-center items-center gap-1 shadow-sm outline-none focus:ring-2"
                  >
                    <span className="text-lg leading-none mb-[2px] font-light">+</span> Thêm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* ── COLUMN 4: CART ── */}
      <div className="w-[340px] bg-[#f5f3ee] border-l border-[#e0ddd6] h-full flex flex-col z-10 shrink-0">
        {/* Cart header */}
        <div className="px-6 pt-6 pb-5 flex items-center justify-between border-b border-[#e0ddd6]">
          <h2 className="text-[22px] font-black text-[#2d2d28]" style={{margin: '20px'}}>Giỏ hàng</h2>
          <span className="bg-[#f0c09a] text-[#7a3a10] text-xs font-bold px-3 py-1 rounded-[8px]" style={{marginRight  : '20px', padding: '10px'}}>
            {totalItems} món
          </span>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3 px-6">
              <span className="text-5xl">🛒</span>
              <p className="text-sm font-medium text-center">Chưa có món nào được chọn</p>
            </div>
          )}
          {cart.map((c, idx) => {
            const isCooking = c.status === 'COOKING' || c.status === 'DONE';
            const isCancelled = c.status === 'CANCELLED';
            return (
              <div key={c.id || `${c.itemID}-${idx}`} className={`flex gap-4 px-5 py-5 items-start border-b border-[#e8e5dd] ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                <img
                  src={c.imageURL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100'}
                  alt={c.itemName}
                  className="w-[55px] h-[55px] rounded-[8px] object-cover shrink-0 shadow-sm" style={{marginLeft: '10px', marginRight: '10px', marginTop: '15px', marginBottom: '15px'}}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100'; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm leading-snug mb-[2px] line-clamp-2 ${isCancelled ? 'text-[#ba1a1a] line-through' : 'text-[#2d2d28]'}`} style={{marginTop: '5px', marginBottom: '5px'}}>
                    {c.itemName}
                  </h4>
                  <p className="text-gray-400 text-xs mb-1" style={{marginTop: '5px', marginBottom: '5px'}}>{Number(c.price).toLocaleString('vi-VN')}đ</p>
                  {c.status && (
                    <div className="mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-[8px] font-bold ${
                        c.status === 'WAITING' ? 'bg-[#e3e1cb] text-[#646352]' :
                        c.status === 'COOKING' ? 'bg-[#ffdcbd] text-[#9d4f00]' :
                        c.status === 'DONE' ? 'bg-[#c8ecc8] text-[#2f4e33]' :
                        'bg-[#ffdad6] text-[#ba1a1a]'
                      }`} style = {{padding: '5px'}}>
                        {c.status === 'WAITING' ? 'Đang tiếp nhận' :
                         c.status === 'COOKING' ? 'Đang làm' :
                         c.status === 'DONE' ? 'Đã xong' : 'Đã hủy'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between"  style = {{marginTop: '10px'}}>
                    {/* Stepper */}
                    {isCancelled ? (
                       <div className="flex items-center gap-1" style={{ marginBottom: '10px'}}>
                          <span className="w-6 text-center text-sm font-bold text-[#ba1a1a] line-through">x{c.quantity}</span>
                       </div>
                    ) : isReadOnly ? (
                       <div className="flex items-center gap-1" style={{ marginBottom: '10px'}}>
                         <span className="w-8 text-center text-sm font-bold text-[#2d2d28]">x{c.quantity}</span>
                       </div>
                    ) : (
                      <div className={`flex items-center border rounded-[8px] px-1 shadow-sm gap-1 ${isCooking ? 'bg-stone-100 border-stone-200 opacity-70' : 'bg-white border-[#e0ddd6]'}`} style={{ marginBottom: '10px'}}>
                        <button
                          onClick={() => handleUpdateCart(c, -1)}
                          disabled={isCooking}
                          className={`w-7 h-7 flex justify-center items-center font-bold transition-colors ${isCooking ? 'text-stone-300 cursor-not-allowed' : 'text-gray-500 hover:text-[#9B5110]'}`}
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-[#2d2d28]">{c.quantity}</span>
                        <button
                          onClick={() => handleUpdateCart(c, 1)}
                          disabled={isCooking && !isSubmitted}
                          className={`w-7 h-7 flex justify-center items-center font-bold transition-colors ${(isCooking && !isSubmitted) ? 'text-stone-300 cursor-not-allowed' : 'text-gray-500 hover:text-[#9B5110]'}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                    <span className={`font-bold text-sm ${isCancelled ? 'text-stone-400 line-through' : 'text-[#2d2d28]'}`} style={{marginRight: '15px'}}>{formatPrice(c.price * c.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout footer — pinned bottom */}
        <div className="px-6 py-6 bg-[#f5f3ee] border-t border-[#e0ddd6] shrink-0">
          {/* Points */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500" style={{marginLeft: '20px', marginTop: '30px'}}>Điểm thưởng dự kiến</span>
            <span className="text-sm font-bold text-[#9B5110]" style={{marginRight: '20px', marginTop: '30px'}}>+{Math.floor(totalAmount / 1000)} điểm</span>
          </div>
          {/* Strikethrough original price */}
          {totalAmount > 0 && (
            <div className="flex justify-end mb-[6px]">
              <span className="text-xs text-gray-400 line-through">
              </span>
            </div>
          )}
          {/* Total */}
          <div className="flex justify-between items-end mb-5">
            <span className="text-base font-semibold text-[#2d2d28]" style={{marginLeft: '20px', marginTop: '20px'}}>Tổng cộng</span>
            <span className="text-[28px] font-black text-[#2d2d28] leading-none" style={{marginRight: '20px', marginTop: '20px'}}>
              {totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Buttons */}
          {isReadOnly ? (
            <div
              className="flex items-center justify-center gap-2 w-[calc(100%-35px)] bg-[#d4a853] text-white rounded-[8px] text-base font-bold shadow-md"
              style={{margin: '20px', padding: '12px', cursor: 'not-allowed', opacity: 0.85}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Đang chờ thu ngân
            </div>
          ) : (
            <button
              onClick={submitOrder}
              className="w-[calc(100%-35px)] mr-4 bg-[#7a3a10] text-white py-4 rounded-[8px] text-lg font-bold shadow-md hover:bg-[#6b3009] active:scale-[0.98] transition-all mb-3"
              style={{margin: '20px', padding: '10px', backgroundColor: '#7a3a10'}}
            >
              Bắt đầu đặt món
            </button>
          )}
        </div>
      </div>

    </div>
  );
}