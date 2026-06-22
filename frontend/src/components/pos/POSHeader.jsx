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
    <header className="app-header" style={{
      height: '70px',
      backgroundColor: 'transparent',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--dashboard-border)',
      flexShrink: 0,
      zIndex: 10
    }}>
      <div className="flex items-center gap-4" style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--dashboard-text-main)' }}>
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 pr-0">
          <Clock size={18} style={{ color: 'var(--dashboard-text-muted)' }} />
          <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--dashboard-text-main)' }}>
            {timeStr}
          </span>
        </div>

        <div className="flex items-center gap-2 pr-0" style={{ cursor: 'pointer' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: 'var(--dashboard-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
          }}>
            <User size={18} />
          </div>
          <span className="hide-on-mobile" style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--dashboard-text-main)' }}>
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default POSHeader;
