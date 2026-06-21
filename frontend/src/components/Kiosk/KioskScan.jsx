import { ArrowRight } from 'lucide-react';

export default function KioskScan({ setView }) {
  return (
    <div className="flex-1 flex flex-col bg-[#fdfaf0] relative items-center justify-center p-8 overflow-hidden h-full">
       <h1 className="text-[56px] font-black text-[#383831] tracking-tight mb-2">Đưa thẻ lại gần để tích điểm</h1>
       <p className="text-xl text-gray-500 mb-16" style={{marginBottom: '30px'}}>Giữ thẻ của bạn trong vùng quét phía dưới thiết bị</p>

       {/* Thẻ NFC */}
       <div className="bg-[#f6f4e8] p-16 rounded-[40px] shadow-2xl border-2 border-white relative w-full max-w-3xl flex justify-center items-center mb-16">
          <div className="absolute inset-0 bg-white opacity-40 blur-3xl rounded-[40px]"></div>

          <div className="relative w-[480px] h-[300px] bg-[#9d4f00] rounded-[32px] shadow-[0_20px_50px_rgba(157,79,0,0.4)] flex flex-col p-10 overflow-hidden transform hover:scale-105 transition-transform duration-500" style={{margin: '30px'}}>
             <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#f68a2f] opacity-20 rounded-full blur-[40px]"></div>
             
             <div className="flex justify-between items-start mb-auto z-10">
                <div className="w-16 h-12 bg-[#b56717] rounded-lg shadow-inner" style={{marginTop: '30px', marginLeft: '30px'}}></div>
                <div className="bg-white text-[#9d4f00] p-2 rounded-[8px] shadow-md" style={{marginTop: '30px', marginRight: '30px'}}>
                   <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 10H2"/></svg>
                </div>
             </div>

             <div className="z-10 mt-auto text-center">
                <p className="text-orange-200 text-sm font-bold tracking-[0.2em] mb-2 uppercase" style={{marginTop: '40px'}}>Loyalty Member</p>
                <h3 className="text-white text-3xl font-black tracking-widest">THE CULINARY PASS</h3>
             </div>
          </div>
       </div>

       {/* Status Text */}
       <div className="flex items-center gap-3 bg-[transparent] px-8 py-4 rounded-full shadow-sm border border-[#e5e3d6] mb-8"style={{marginTop: '30px', marginBottom: '30px', padding: '10px'}}>
          <span className="w-3 h-3 bg-[#9d4f00] rounded-full animate-ping"></span>
          <span className="text-[#9d4f00] font-bold tracking-widest uppercase">Đang chờ nhận diện ...</span>
       </div>

       {/* Skip Btn */}
       <button onClick={() => setView('menu')} className="w-full max-w-sm text-[#383831] py-6 px-8 rounded-[8px] font-bold flex justify-center items-center gap-4 hover:bg-[#e4e1d7] transition-colors shadow-sm" style={{paddingTop: '25px', paddingBottom: '25px', marginBottom: '20px', backgroundColor: '#C9C6BD'}}>
          SKIP <ArrowRight size={24} />
       </button>

       <p className="text-sm text-gray-400 mt-8">Bằng việc quét thẻ, bạn đồng ý với Điều khoản & Điều kiện của chúng tôi</p>
    </div>
  );
}
