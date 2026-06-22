import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Monitor, FileText, LogOut } from 'lucide-react';

const POSSidebar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'POS', path: '/pos', icon: Monitor },
    { name: 'Báo cáo ca', path: '/pos/report', icon: FileText }
  ];

  return (
    <aside className="app-sidebar" style={{
      width: '260px',
      backgroundColor: 'var(--dashboard-surface)',
      borderRight: '1px solid var(--dashboard-border)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      zIndex: 50,
      transition: 'transform 0.3s ease-in-out',
      flexShrink: 0
    }}>
      <div className="flex justify-center items-center relative" style={{ paddingBottom: '2.5rem', width: '100%', textAlign: 'center' }}>
        <NavLink to="/pos" style={{ textDecoration: 'none' }}>
           <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--dashboard-primary)', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: '1.2' }}>
             THE SELF STATION
           </h1>
        </NavLink>
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ul className="flex flex-col gap-2" style={{ flex: 1, padding: 0, margin: 0, listStyle: 'none' }}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                end={item.path === '/pos'}
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
             Thoát
           </button>
        </div>
      </nav>
    </aside>
  );
};

export default POSSidebar;
