import { Utensils, Scan, BarChart2, FileText } from 'lucide-react';

export default function KioskSidebar({ currentView, setView }) {
  const menus = [
    { id: 'menu', label: 'MENU', icon: <Utensils size={32} /> },
    { id: 'status', label: 'STATUS', icon: <BarChart2 size={32} /> },
    { id: 'bill', label: 'BILL', icon: <FileText size={32} /> }
  ];

  return (
    <div className="w-[140px] bg-[#fdfce9] h-full flex flex-col items-center border-r border-[#ebe8dc] z-50 shadow-[2px_0_10px_rgba(0,0,0,0.02)] shrink-0">
  
  <div className="flex-1 flex flex-col justify-evenly w-full items-center">
        {menus.map(m => {
          const isActive = currentView === m.id;
          return (
            <button 
  key={m.id}
  onClick={() => setView(m.id)}
  style={isActive ? { backgroundColor: '#FFB783' } : { backgroundColor: 'transparent' }}
  className={`flex flex-col items-center justify-center gap-2 w-24 aspect-square rounded-2xl transition-all duration-300 ${
    isActive 
      ? 'text-[#9d4f00] shadow-sm' 
      : 'text-gray-400 hover:text-[#9d4f00]'
  }`}
>
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {m.icon}
              </span>
              <span className={`text-[11px] font-bold tracking-widest uppercase ${
                isActive ? 'text-[#9d4f00]' : 'text-gray-400'
              }`}>
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}