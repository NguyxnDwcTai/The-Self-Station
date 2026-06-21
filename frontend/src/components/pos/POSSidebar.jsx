import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Monitor, FileText, LogOut } from 'lucide-react';

const POSSidebar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const navClass = ({ isActive }) => 
    `flex flex-col items-center justify-center gap-1 w-full h-[72px] rounded-xl transition-all ${
      isActive 
        ? 'bg-[var(--dashboard-primary)] text-white shadow-md' 
        : 'text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-surface-hover)] hover:text-[var(--dashboard-text-main)]'
    }`;

  return (
    <div className="w-[88px] h-screen bg-[var(--dashboard-surface)] border-r border-[var(--dashboard-border)] flex flex-col items-center py-6 shrink-0 z-20">
      <div className="w-12 h-12 rounded-xl bg-[var(--dashboard-primary-light)] text-[var(--dashboard-primary)] flex items-center justify-center font-black text-xl mb-8 shadow-sm">
        TS
      </div>
      
      <div className="flex flex-col gap-4 w-full px-3 flex-1">
        <NavLink to="/pos" end className={navClass} title="Bảng điều khiển">
          <Monitor size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">POS</span>
        </NavLink>
        
        <NavLink to="/pos/report" className={navClass} title="Báo cáo ca">
          <FileText size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">Report</span>
        </NavLink>
      </div>

      <div className="w-full px-3">
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 w-full h-[72px] rounded-xl text-[var(--dashboard-danger-text)] hover:bg-[var(--dashboard-danger-bg)] transition-all"
          title="Kết thúc ca"
        >
          <LogOut size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">Thoát</span>
        </button>
      </div>
    </div>
  );
};

export default POSSidebar;
