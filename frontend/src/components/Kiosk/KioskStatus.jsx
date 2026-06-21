import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Bell, ArrowRight, Check, AlertCircle } from 'lucide-react';

export default function KioskStatus({ orderTracking, setView, isReadOnly }) {
  const [progress, setProgress] = useState(0);
  const [minutesLeft, setMinutesLeft] = useState(10);

  useEffect(() => {
    if (!orderTracking) return;

    const calculateProgress = () => {
      const items = orderTracking.orderDetails || [];
      const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
      
      if (totalQuantity === 0) {
        setProgress(0);
        return;
      }

      const doneQuantity = items.filter(i => i.status === 'DONE').reduce((acc, item) => acc + item.quantity, 0);
      const p = Math.min((doneQuantity / totalQuantity) * 100, 100);
      
      setProgress(p);
      setMinutesLeft(Math.max(1, Math.ceil(10 * (1 - p / 100))));
    };

    calculateProgress();
  }, [orderTracking]);

  if (!orderTracking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#fdfaf0] h-full">
        <div className="text-center text-gray-400">
           <Clock size={64} className="mx-auto mb-4 opacity-30" style={{marginLeft: 'auto', marginRight: 'auto'}}/>
           <p className="text-2xl font-bold">Chưa có đơn hàng nào đang xử lý</p>
        </div>
      </div>
    );
  }

  const rawOrderItems = orderTracking.orderDetails || [];
  const totalItemsCount = rawOrderItems.reduce((acc, item) => acc + item.quantity, 0);
  const orderIdText = orderTracking.orderID?.replace('K_', '') || '8824';

  const orderItems = [...rawOrderItems].sort((a, b) => {
    if (a.status === 'DONE' && b.status !== 'DONE') return -1;
    if (a.status !== 'DONE' && b.status === 'DONE') return 1;
    return 0;
  });

  return (
    <div className="flex-1 overflow-y-auto h-full bg-[#fdfaf0] flex flex-col font-sans" style={{ marginTop: '30px', marginLeft: '30px'}}>
      
      {/* ── READ-ONLY BANNER ── */}
      {isReadOnly && (
        <div className="mx-8 mt-4 mb-0 bg-[#fff8e1] border border-[#f59e0b] rounded-[10px] px-6 py-4 flex items-center gap-4 shadow-sm shrink-0 sticky top-0 z-10" style = {{marginBottom: '20px', padding: '10px'}}>
          <div className="w-10 h-10 bg-[#fbbf24] rounded-full flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div className="flex-1">
            <p className="font-black text-[#92400e] text-base leading-snug">Đang chờ thu ngân thanh toán</p>
            <p className="text-[#b45309] text-sm font-medium mt-0.5">Thông tin đơn hàng được hiển thị chỉ để tham khảo. Vui lòng đến quầy thu ngân để hoàn tất.</p>
          </div>
          <div className="shrink-0">
            <span className="bg-[#f59e0b] text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide animate-pulse" style = {{marginRight: '10px', padding: '5px'}}>CHỈ XEM</span>
          </div>
        </div>
      )}
      
      {/* ── TOP SECTION (Cream Background) ── */}
      <div className="flex px-16 py-16 gap-16 bg-[#fdfaf0] shrink-0">
        
        {/* Left Column: Info & Progress */}
        <div className="flex-1 flex flex-col">
          <div className="mb-6 flex items-center">
            <span className="bg-[#6bfe9c] text-[#004a23] font-bold px-4 py-1.5 rounded-full tracking-widest text-sm flex items-center gap-2" style = {{padding: '10px'}}>
              <span className="w-2 h-2 rounded-full bg-[#004a23]"></span> ORDER #{orderIdText}
            </span>
          </div>
          
          <h1 className="text-[64px] font-black text-[#383831] tracking-tight leading-[1.05] mb-6" style = {{marginTop: '30px'}}>
            Đơn hàng đang<br />được <span className="text-[#9d4f00] italic">chuẩn bị</span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-xl leading-relaxed mb-auto" style = {{marginTop: '30px'}}>
            Các đầu bếp của chúng tôi đang chăm chút cho món ăn của bạn. Hãy thư giãn trong không gian ấm cúng, chúng tôi sẽ thông báo ngay khi món ăn sẵn sàng.
          </p>

          {/* Progress Indicator Block */}
          <div className="flex items-center gap-6 mt-16" style = {{marginTop: '30px'}}>
            {/* Circular icon */}
            <div className="w-24 h-24 rounded-full border-4 border-[#e5e3d6] flex items-center justify-center relative shrink-0">
               {/* Progress circular trim hack via conic-gradient on a pseudo-element or simple svg */}
               <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                 <circle cx="50" cy="50" r="48" fill="none" stroke="#9d4f00" strokeWidth="4" strokeDasharray="301.59" strokeDashoffset={301.59 * (1 - progress / 100)} className="transition-all duration-1000 ease-linear" />
               </svg>
            </div>
            {/* Progress line */}
            <div className="flex-1">
               <div className="flex justify-between items-end mb-2" style={{marginBottom: '10px'}}>
                  <span className="font-bold text-[#9d4f00] tracking-[0.15em] uppercase text-sm">Tiến độ</span>
                  <span className="font-bold text-[#9d4f00] text-lg">{Math.round(progress)}%</span>
               </div>
               <div className="w-full bg-[#ebe8dc] h-3 rounded-full overflow-hidden mb-2" style={{marginBottom: '10px'}}>
                  <div className="bg-[#9d4f00] h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
               </div>
               <p className="text-sm text-gray-500 italic">Món chính đang được chế biến...</p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image & Cards */}
        <div className="w-[480px] shrink-0 flex flex-col gap-6" style = {{marginRight: '10px'}}>

           {/* Stats Cards */}
           <div className="flex gap-6">
              <div className="flex-1 bg-white rounded-[24px] p-6 shadow-sm border border-[#ebe8dc] flex flex-col relative justify-center" style = {{padding: '10px'}}>
                 <UtensilsIcon className="text-[#00743a] mb-4" />
                 <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1" style = {{paddingTop: '5px'}}>Món ăn</p>
                 <p className="text-xl font-bold text-[#383831]">{totalItemsCount < 10 ? `0${totalItemsCount}` : totalItemsCount} món</p>
              </div>
              <div className="flex-1 bg-white rounded-[24px] p-6 shadow-sm border border-[#ebe8dc] flex flex-col relative justify-center" style = {{padding: '10px'}}>
                 <ClockIcon className="text-[#9d4f00] mb-4" />
                 <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1" style = {{paddingTop: '5px'}}>Thời gian chờ</p>
                 <p className="text-xl font-bold text-[#383831]">~ {minutesLeft} phút</p>
              </div>
           </div>

           {/* Big Call Waiter Button */}
           <div className="bg-[#9d4f00] rounded-[24px] text-white p-6 shadow-xl flex items-center justify-between relative overflow-hidden group cursor-pointer hover:bg-[#8b4500] transition-colors h-[110px]" style = {{padding: '10px'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-xl -mr-10 -mt-10"></div>
              <div>
                 <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Yêu cầu thêm?</p>
                 <h3 className="text-[26px] font-black">Gọi phục vụ</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-full mr-2">
                 <Bell size={28} />
              </div>
           </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION (Gray/White Background) ── */}
      <div className="bg-[#fcf9ef] flex-1 px-16 pt-16 pb-8 border-t border-[#ebe8dc] flex flex-col" style={{marginTop: '30px'}}>
          <div className="flex justify-between items-end mb-8" style={{marginTop: '30px'}}>
             <div>
                <h3 className="text-sm font-bold tracking-[0.15em] text-gray-500 uppercase mb-2">Chi tiết thực đơn</h3>
                <h2 className="text-[32px] font-black text-[#383831]">Danh sách món đang đợi</h2>
             </div>
             {!isReadOnly && (
               <button onClick={() => setView('bill')} className="text-[#9d4f00] font-bold text-lg hover:underline flex items-center gap-2 mb-2" style = {{marginRight: '50px'}}>
                 Xem chi tiết hóa đơn <ArrowRight size={20} />
               </button>
             )}
             {isReadOnly && (
               <button disabled className="text-gray-300 font-bold text-lg flex items-center gap-2 mb-2 cursor-not-allowed" style={{marginRight: '50px'}}>
                 Xem chi tiết hóa đơn <ArrowRight size={20} />
               </button>
             )}
          </div>

          {/* Vertical Scroll Cards */}
          <div className="grid grid-cols-2 gap-4 overflow-y-auto hide-scrollbar pb-4" style = {{marginTop: '10px', maxHeight: '320px'}}>
             {orderItems.map((item, idx) => {
               const isDone = item.status === 'DONE';
               const isCooking = item.status === 'COOKING';
               const isOutOfStock = item.status === 'OUT_OF_STOCK';
               const isCancelled = item.status === 'CANCELLED';
               return (
                 <div key={item.id || idx} className={`p-4 h-[100px] rounded-[8px] shadow-sm border flex items-center gap-4 ${isDone ? 'bg-[#e8fbe8] border-[#a3e6b7]' : 'bg-white border-[#ebe8dc]'} ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                    <img src={item.imageURL || item.menuItem?.imageURL || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150'} alt="food" className="w-20 h-20 rounded-full object-cover shadow-sm bg-[#f6f4e8]" style={{padding: '3px'}}/>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className={`text-[18px] leading-[24px] font-[700] truncate ${isCancelled ? 'text-[#ba1a1a] line-through' : 'text-[#1b1c1c]'}`}>{item.itemName || item.menuItem?.itemName || 'Món ăn'}</h3>
                      {item.notes && <p className="text-[14px] leading-[20px] text-[#747873] truncate mt-1">Ghi chú: {item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[16px] leading-[24px] font-[700] ${isCancelled ? 'text-[#ba1a1a] line-through' : 'text-[#424841]'}`}>x{item.quantity}</span>
                      
                      {/* Status Display */}
                      <div className="flex items-center gap-2" style={{marginRight: '10px'}}>
                        {item.status === 'CANCELLED' && (
                          <span className="text-[14px] font-bold text-white bg-[#ba1a1a] px-2 py-1 rounded-[8px]" style={{padding: '5px'}}>Đã Hủy</span>
                        )}
                        {item.status === 'WAITING' && (
                          <span className="text-[14px] font-bold text-[#747873] bg-[#e4e2e2]/50 px-2 py-1 rounded-[8px]" style={{padding: '5px'}}>Đang tiếp nhận</span>
                        )}
                        {item.status === 'COOKING' && (
                          <span className="text-[14px] font-bold text-[#9d4f00] bg-[#ffdcbd] px-2 py-1 rounded-[8px]" style = {{padding: '5px'}}>Đang làm</span>
                        )}
                        {item.status !== 'CANCELLED' && (
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${item.status === 'DONE' ? 'bg-[#c8ecc8] text-[#2f4e33]' : 'bg-[#e4e2e2]/50 text-[#a9aba6]'}`} style = {{marginRight: '10px'}}>
                            <CheckCircle size={20} className={item.status === 'DONE' ? 'opacity-100' : 'opacity-40'} />
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
               )
             })}
             {/* Fallback items if empty */}
             {orderItems.length === 0 && (
                 <div className="bg-white p-6 rounded-[8px] shadow-sm border border-[#ebe8dc] flex items-center gap-5 col-span-2">
                   <div className="w-20 h-20 rounded-full bg-[#f1eee4] flex items-center justify-center text-gray-400"><AlertCircle /></div>
                   <div className="flex-1">
                      <h4 className="text-lg font-bold text-[#383831]">Đang cập nhật...</h4>
                   </div>
                </div>
             )}
          </div>

          <div className="mt-auto border-t border-[#ebe8dc] pt-8 flex items-center justify-between" style = {{marginTop: '30px', marginBottom: '40px'}}>
             <div className="flex items-center gap-4 text-gray-500"style = {{marginTop: '10px'}}>
                <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex justify-center items-center opacity-50 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <p className="text-sm italic font-medium max-w-sm" >Cảm ơn bạn đã lựa chọn trải nghiệm tại The Self Station. Chúng tôi luôn nỗ lực vì sự hài lòng của bạn.</p>
             </div>
          </div>
      </div>
    </div>
  );
}

function UtensilsIcon({ className }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}