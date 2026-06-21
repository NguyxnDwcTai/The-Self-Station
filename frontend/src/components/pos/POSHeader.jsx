import React, { useState, useEffect } from 'react';
import { User, Clock } from 'lucide-react';

const POSHeader = ({ title = 'Bảng Điều Khiển' }) => {
  const [user, setUser] = useState(null);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }

    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const displayName = user?.fullName || user?.username || 'NguyenDucTai';

  return (
    <header className="flex justify-between items-center w-full px-8 h-[88px] bg-[var(--dashboard-surface)] border-b border-[var(--dashboard-border)] shrink-0 z-10">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-black text-[var(--dashboard-text-main)] tracking-tight">
          {title}
        </h1>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--dashboard-surface-hover)] rounded-lg text-[var(--dashboard-text-muted)] text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-[var(--dashboard-success-text)]"></span>
          Kết nối ổn định
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--dashboard-surface-hover)] rounded-xl font-bold text-[var(--dashboard-text-main)]">
          <Clock size={18} className="text-[var(--dashboard-text-muted)]" />
          {timeStr}
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--dashboard-border)]">
          <div className="text-right">
            <div className="text-sm font-bold text-[var(--dashboard-text-main)]">{displayName}</div>
            <div className="text-xs font-semibold text-[var(--dashboard-text-muted)]">Thu Ngân</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--dashboard-primary-light)] flex items-center justify-center text-[var(--dashboard-primary)] ring-2 ring-[var(--dashboard-surface)] shadow-sm">
            <User size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default POSHeader;
