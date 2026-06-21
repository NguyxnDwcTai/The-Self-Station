import { Check } from 'lucide-react';

export default function KioskReady({ orderTracking, isReadOnly, onComplete }) {
  const activeItems = orderTracking?.orderDetails?.filter(item => item.status !== 'CANCELLED') || [];
  const isOrderFinished = activeItems.length > 0 && activeItems.every(item => item.status === 'DONE');

  // Chỉ hiển thị overlay khi tất cả món DONE và chưa bấm "Hoàn tất nhận món"
  if (!orderTracking || !isOrderFinished || isReadOnly) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfaf0]/95 backdrop-blur-sm">
       
       <div className="absolute top-8 flex justify-center w-full">
          <div className="bg-[#6bfe9c] text-[#004a23] px-6 py-2 rounded-full font-bold text-sm tracking-widest shadow-md border border-[#5bef90] flex items-center gap-2" style={{padding: '10px'}}>
             <Check size={16} /> MÓN ĂN ĐÃ HOÀN TẤT
          </div>
       </div>

       <div className="text-center mt-12 mb-16">
          <h2 className="text-[100px] font-black text-[#9d4f00] tracking-tighter leading-none mb-4" style={{marginBottom: '30px'}}>
             Đơn #{orderTracking.orderID?.replace('K_','A')} <br/>
             <span className="italic">đã sẵn sàng</span>
          </h2>
          <p className="text-2xl text-gray-500 font-medium tracking-wide" style={{marginBottom: '30px'}}>Vui lòng đến quầy để nhận món</p>
       </div>

       <div className="flex gap-6 mb-16 relative z-10 w-full max-w-4xl px-8">
          {/* Card Left: Quầy nhận món */}
          <div className="flex-1 bg-white p-10 rounded-[10px] shadow-lg border border-[#ebe8dc] flex flex-col" style={{padding: '30px'}}>
             <div className="w-16 h-16 bg-[#6bfe9c] rounded-xl flex justify-center items-center mb-8 shadow-sm" style={{marginBottom: '10px'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#004a23" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
             </div>
             <h3 className="text-3xl font-black text-[#383831] mb-6" style={{marginBottom: '10px'}}>Điểm nhận món</h3>
             <p className="text-lg text-gray-500 mb-8 leading-relaxed" style={{marginBottom: '10px'}}>
                Món ăn của bạn đã được đầu bếp kiểm tra kỹ lưỡng và đang chờ bạn tại <strong>Quầy Số 2</strong>.
             </p>
             <p className="text-[#00743a] font-bold flex items-center gap-2 mt-auto">
                Lối này, vui lòng đi thẳng
             </p>
          </div>

          {/* Card Right: Chi tiết đơn */}
          <div className="flex-1 bg-[#fcf9ef] p-10 rounded-[10px] shadow-sm border border-[#ebe8dc] flex flex-col text-center overflow-y-auto" style = {{padding: '30px'}}>
             <div className="flex justify-between items-center mb-6">
                <p className="font-bold tracking-widest text-sm text-gray-500 uppercase" style={{marginBottom: '10px'}}>Chi tiết đơn</p>
                <span className="bg-[#f2ebd9] text-[#9d4f00] font-bold px-3 py-1 rounded-md" style={{padding: '5px'}}>
                   #{orderTracking.orderID?.replace('K_','A')}
                </span>
             </div>

             <div className="flex flex-col gap-3 mb-8 text-[#383831] flex-1 text-left px-4 overflow-y-auto" style={{ maxHeight: '250px' }}>
                {orderTracking.orderDetails?.map((i, idx) => {
                   const itemName = i.menuItem?.itemName || i.itemName || 'Món ăn';
                   const isCancelled = i.status === 'CANCELLED';
                   return (
                   <p key={idx} className={`font-medium text-lg leading-snug ${isCancelled ? 'text-[#ba1a1a] line-through' : ''}`}>
                     <span className="font-bold">{i.quantity}x</span> {itemName}
                   </p>
                )})}
                {(!orderTracking.orderDetails || orderTracking.orderDetails.length === 0) && (
                   <>
                     <p className="font-medium text-lg"><span className="font-bold text-gray-500">1x</span> Artisanal Wagyu Burger</p>
                     <p className="font-medium text-lg"><span className="font-bold text-gray-500">1x</span> Garden Fresh Salad</p>
                     <p className="text-sm text-gray-400 italic pl-6">Sốt Cay Phụ Thêm</p>
                   </>
                )}
             </div>

             <div className="border-t border-[#e5e2d9] pt-6 flex items-center justify-center gap-4 text-left" >

                <div>
                   <p className="text-xs font-bold text-gray-500 tracking-widest uppercase" style={{marginTop: '10px'}}>Chúc bạn ngon miệng!</p>
                   <p className="text-lg font-medium italic text-[#383831]">Bon Appétit</p>
                </div>
             </div>
          </div>
       </div>

       <div className="flex gap-4">
          <button
            onClick={onComplete}
            className="bg-[#9d4f00] text-white py-5 px-10 rounded-[8px] text-xl font-bold shadow-xl hover:bg-[#8b4500] flex items-center justify-center gap-3 w-72"
            style={{padding: '20px', marginTop: '30px', backgroundColor: '#9d4f00'}}
          >
             Hoàn tất nhận món <Check size={20} />
          </button>
       </div>
    </div>
  );
}
