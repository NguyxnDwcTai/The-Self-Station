import { ArrowLeft, Printer, MapPin, CheckCircle, Clock } from 'lucide-react';

export default function KioskBill({ orderTracking, setView, isReadOnly }) {
  if (!orderTracking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#fdfaf0] h-full">
        <h2 className="text-4xl font-black text-[#9d4f00] mb-4" style={{marginBottom: '20px'}}>Chi tiết hóa đơn</h2>
        <p className="text-gray-500">Chưa có thông tin hóa đơn. Cùng gọi món nhé!</p>
        <button onClick={() => setView('menu')} className="mt-8 text-white px-6 py-3 rounded-[8px] font-bold" style = {{marginTop: '20px', backgroundColor: '#7a3a10', padding: '15px'}} >Quay lại menu</button>
      </div>
    );
  }

   const orderItems = orderTracking.orderDetails || [];
   const groupedItems = Object.values(orderItems.reduce((acc, item) => {
     if (!acc[item.itemID]) {
       acc[item.itemID] = { ...item };
     } else {
       acc[item.itemID].quantity += item.quantity;
     }
     return acc;
   }, {}));

   const subTotal = orderItems.reduce((acc, item) => {
     const price = parseFloat(item.unitPrice || item.price || item.menuItem?.price || 0);
     return acc + (price * item.quantity);
   }, 0);
   const tax = subTotal * 0.08; // 8% VAT
   const total = subTotal + tax;

   return (
     <div className="flex-1 bg-[#fdfaf0] flex flex-col h-full font-sans">
       
       {/* Header */}
       <div className="px-16 py-10 bg-[#f6f4ea] border-b border-[#ebe8dc] flex items-center justify-between shrink-0">
         <div className="flex items-center gap-6">
           <button onClick={() => setView('status')} className="w-14 h-14 bg-[#fcf9ef] border border-[#ebe8dc] rounded-full flex items-center justify-center text-[#383831] hover:bg-[#f6f4e8] transition-colors focus:outline-none">
              <ArrowLeft strokeWidth={2.5} size={28} />
           </button>
           <div>
             <p className="text-sm font-bold text-gray-400 tracking-[0.15em] uppercase mb-1">Mã tham chiếu</p>
             <h2 className="text-3xl font-black text-[#383831]">Đơn #{orderTracking.orderID?.replace('K_', '') || '8824'}</h2>
           </div>
         </div>
       </div>

       {/* READ-ONLY BANNER */}
       {isReadOnly && (
         <div className="mx-8 mt-4 bg-[#fff8e1] border border-[#f59e0b] rounded-[10px] px-6 py-4 flex items-center gap-4 shadow-sm shrink-0" style = {{marginTop: '20px', padding: '10px'}}>
           <div className="w-10 h-10 bg-[#fbbf24] rounded-full flex items-center justify-center shrink-0">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
           </div>
           <div className="flex-1">
             <p className="font-black text-[#92400e] text-base leading-snug">Hóa đơn đang chờ thu ngân xác nhận</p>
             <p className="text-[#b45309] text-sm font-medium mt-0.5">Vui lòng đưa thiết bị cho nhân viên hoặc đến quầy thu ngân. Hóa đơn sẽ tự động được xóa sau khi thanh toán.</p>
           </div>
           <span className="bg-[#f59e0b] text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide animate-pulse shrink-0" style = {{marginRight: '10px', padding: '5px'}}>CHỈ XEM</span>
         </div>
       )}

       <div className="flex-1 overflow-y-auto p-16 flex gap-16">
          {/* Left Side: Receipt List */}
          <div className="flex-1 flex flex-col" style = {{marginTop: '30px', marginLeft: '30px'}}>
             <h3 className="text-[28px] font-black text-[#383831] mb-8">Chi Tiết Hóa Đơn</h3>
             
             <div className="bg-white border border-[#ebe8dc] rounded-[8px] p-8 shadow-sm" style = {{marginTop: '30px'}}>
                {groupedItems.map((item, idx) => {
                  const price = parseFloat(item.unitPrice || item.price || item.menuItem?.price || 0);
                  const itemName = item.menuItem?.itemName || item.itemName || 'Món ăn';
                  const imageURL = item.menuItem?.imageURL || item.imageURL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150';
                  const categoryName = item.menuItem?.category?.categoryName || item.category?.categoryName || 'Món ăn';

                  return (
                  <div key={idx} className="flex gap-6 py-6 border-b border-[#f6f4ea] last:border-0 last:pb-0 relative group" style = {{paddingTop: '15px', paddingBottom: '15px'}}>
                     <img src={imageURL} alt="food" className="w-20 h-20 rounded-[8px] object-cover bg-[#fdfaf0]" style = {{marginLeft: '15px'}}/>
                     <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-lg font-bold text-[#383831] mb-1">{itemName}</h4>
                        <p className="text-gray-500 text-sm">{categoryName} • Chi tiết đính kèm</p>
                     </div>
                     <div className="flex flex-col items-end justify-center" style = {{marginRight: '15px'}}>
                        <p className="text-xl font-black text-[#383831] mb-2">{price.toLocaleString('vi-VN')}đ</p>
                        <p className="text-sm font-bold text-gray-500 bg-[#f6f4e8] px-3 py-1 rounded-lg">Số lượng: {item.quantity}</p>
                     </div>
                  </div>
                )})}

               {orderItems.length === 0 && (
                 <div className="py-12 text-center text-gray-500 font-medium tracking-wide">Chưa có món nào được đặt</div>
               )}

               <div className="mt-8 pt-8 border-t-2 border-dashed border-[#ebe8dc]" style = {{marginTop: '15px'}}>
                  <div className="flex justify-between items-center mb-4 text-gray-500" style = {{marginLeft: '15px', marginRight: '15px'}}>
                     <span className="font-bold text-lg">Tạm tính</span>
                     <span className="font-bold text-lg">{subTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-gray-500" style = {{marginLeft: '15px', marginRight: '15px'}}>
                     <span className="font-bold text-lg">Thuế VAT (8%)</span>
                     <span className="font-bold text-lg">{tax.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-[#383831] mt-6 pt-6 border-t border-[#f6f4e8]" style = {{marginLeft: '15px', marginRight: '15px'}}>
                     <span className="font-black text-2xl" >Tổng thanh toán</span>
                     <span className="font-black text-4xl text-[#9d4f00]">{Math.round(total).toLocaleString('vi-VN')}đ</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Side: Tracking timeline */}
         <div className="w-[420px] shrink-0" style = {{marginRight: '30px', marginTop: '30px'}}>
            <h3 className="text-[28px] font-black text-[#383831] mb-8">Trạng Thái Đơn Hàng</h3>
            
            <div className="bg-[#f6f4e8] border border-[#ebe8dc] rounded-[8px] p-10 relative overflow-hidden shadow-sm" style = {{marginTop: '30px'}}>
               {/* Timeline graphic */}
               <div className="relative pl-10" style = {{paddingTop: '20px', paddingLeft: '55px', paddingBottom: '20px'}}>
                  
                  {/* Step 1 */}
                  <div className="relative mb-12" style = {{paddingTop: '10px', paddingBottom: '10px'}}>
                     <div className="absolute -left-10 w-8 h-8 rounded-full bg-[#00743a] text-white flex items-center justify-center shadow-md z-10 -ml-[7px] -mt-1"><CheckCircle size={18} strokeWidth={3}/></div>
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] mb-1">
                       {new Date(orderTracking.startTime || Date.now()).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                     </p>
                     <h4 className="text-xl font-bold text-[#383831] leading-tight">Đơn hàng được nhận</h4>
                     <p className="text-gray-500 text-sm mt-1">Hệ thống đã xác nhận thanh toán thành công.</p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative mb-12" style = {{paddingTop: '10px', paddingBottom: '10px'}}>
                     <div className="absolute -left-10 w-8 h-8 rounded-full bg-[#fcf9ef] border-[5px] border-[#9d4f00] text-[#9d4f00] flex items-center justify-center z-10 -ml-[7px] -mt-1 shadow-[0_0_0_4px_#f6f4e8]"></div>
                     <p className="text-xs font-bold text-[#9d4f00] uppercase tracking-[0.1em] mb-1 animate-pulse">Đang chuẩn bị</p>
                     <h4 className="text-xl font-bold text-[#383831] leading-tight mb-1">Đang chế biến</h4>
                     <p className="text-gray-500 text-sm mt-1">Đầu bếp đang tỉ mỉ chuẩn bị món ăn của bạn.</p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative" style = {{paddingTop: '10px', paddingBottom: '10px'}}>
                     <div className="absolute -left-10 w-8 h-8 rounded-full bg-white border-4 border-[#ebe8dc] flex items-center justify-center z-10 -ml-[7px] -mt-1"><MapPin size={16} className="text-gray-300" /></div>
                     <h4 className="text-xl font-bold text-gray-400">Sẵn sàng phục vụ</h4>
                     <p className="text-gray-400 text-sm mt-1">Vui lòng nhận món tại quầy khi có thông báo.</p>
                  </div>
               </div>
            </div>

            <div className="bg-[#e8fbe8] rounded-[8px] p-8 mt-8 flex flex-col relative overflow-hidden group" style = {{marginTop: '20px', padding: '15px'}}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-40 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <h4 className="text-3xl font-black text-[#004a23]">+ {Math.floor(subTotal / 1000)} Điểm</h4>
               <p className="text-[#006633] text-sm mt-2 opacity-90 font-medium" style = {{paddingTop: '10px', paddingBottom: '10px'}}>Tích lũy từ đơn hàng này.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
