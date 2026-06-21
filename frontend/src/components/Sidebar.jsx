import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu as MenuIcon, Users, Tag, BarChart3, X, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { name: t.menuDashboard, path: '/admin', icon: LayoutDashboard },
    { name: t.menuPromotions, path: '/admin/promotions', icon: Tag },
    { name: t.menuMenu, path: '/admin/menu', icon: MenuIcon },
    { name: t.menuAccounts, path: '/admin/accounts', icon: Users },
    { name: t.menuReports, path: '/admin/reports', icon: BarChart3 }
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`} style={{
      width: '260px',
      backgroundColor: 'var(--dashboard-surface)',
      borderRight: '1px solid var(--dashboard-border)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      zIndex: 50,
      transition: 'transform 0.3s ease-in-out'
    }}>
      <div className="flex justify-center items-center relative" style={{ paddingBottom: '2.5rem', width: '100%', textAlign: 'center' }}>
        <NavLink to="/" style={{ textDecoration: 'none' }}>
           <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--dashboard-primary)', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: '1.2' }}>
             THE SELF STATION
           </h1>
        </NavLink>
        <button className="mobile-close-btn absolute right-0" onClick={() => setIsOpen(false)} style={{ display: 'none', color: 'var(--dashboard-text-main)', top: '-5px' }}>
           <X size={24} />
        </button>
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ul className="flex-col gap-2" style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                onClick={() => setIsOpen(false)} // Auto close on mobile after click
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-text-muted)',
                  backgroundColor: isActive ? 'var(--dashboard-primary-light)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s, color 0.2s'
                })}
              >
                <item.icon size={20} />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Nút Đăng Xuất ở đáy */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--dashboard-border)' }}>
           <button 
             style={{
               width: '100%',
               display: 'flex',
               alignItems: 'center',
               gap: '0.75rem',
               padding: '0.75rem 1rem',
               borderRadius: '8px',
               color: 'var(--dashboard-danger-text)',
               backgroundColor: 'transparent',
               fontWeight: '600',
               cursor: 'pointer',
               transition: 'background-color 0.2s'
             }}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffdad6'}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
             onClick={handleLogout}
           >
             <LogOut size={20} />
             {t.logout}
           </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
