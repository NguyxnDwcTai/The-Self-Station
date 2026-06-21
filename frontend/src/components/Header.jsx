import { Search, Bell, User, Menu as MenuIcon, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../api/api';

const Header = ({ toggleSidebar }) => {
  const { language, toggleLanguage } = useLanguage();
  const [adminName, setAdminName] = useState('Đang tải...');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/accounts/me');
        if (res.data && res.data.username) setAdminName(res.data.username);
        else setAdminName('A. Tùng');
      } catch (err) {
        setAdminName('A. Tùng');
      }
    };
    fetchMe();
  }, []);

  return (
    <header className="app-header" style={{
      height: '70px',
      backgroundColor: 'transparent',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--dashboard-border)',
    }}>
      <div className="flex items-center gap-4" style={{ flex: 1 }}>
        <button className="mobile-menu-btn" onClick={toggleSidebar} style={{ display: 'none', padding: '8px', color: 'var(--dashboard-text-main)' }}>
           <MenuIcon size={24} />
        </button>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Language Toggle */}
        <div className="flex items-center gap-2" style={{ position: 'relative' }}>
           <Globe size={18} style={{ color: 'var(--dashboard-text-muted)' }} />
           <select 
              value={language}
              onChange={(e) => toggleLanguage(e.target.value)}
              style={{ appearance: 'none', cursor: 'pointer', border: 'none', outline: 'none', backgroundColor: 'transparent', fontWeight: '600', fontSize: '0.9rem', color: 'var(--dashboard-text-main)', paddingRight: '20px' }}
           >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
           </select>
           <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid var(--dashboard-text-muted)' }}></div>
        </div>

        <div className="flex items-center gap-2 pr-0" style={{ cursor: 'pointer' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: 'var(--dashboard-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
          }}>
            <User size={18} />
          </div>
          <span className="hide-on-mobile" style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--dashboard-text-main)' }}>{adminName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
