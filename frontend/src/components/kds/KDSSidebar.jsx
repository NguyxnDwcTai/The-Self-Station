import React from 'react';
import { Receipt, Utensils, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const KDSSidebar = ({ activePage, setActivePage, handleLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'orders', name: 'Đơn hàng', icon: Receipt },
    { id: 'menu', name: 'Thực đơn', icon: Utensils }
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
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--dashboard-primary)', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: '1.2' }}>
          THE SELF STATION
        </h1>
        <button className="mobile-close-btn absolute right-0" onClick={() => setIsOpen(false)} style={{ display: 'none', color: 'var(--dashboard-text-main)', top: '-5px' }}>
           <X size={24} />
        </button>
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ul className="flex-col gap-2" style={{ flex: 1, listStyle: 'none', padding: 0, margin: 0, display: 'flex' }}>
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false); // Auto close on mobile after click
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    width: '100%',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-text-muted)',
                    backgroundColor: isActive ? 'var(--dashboard-primary-light)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s, color 0.2s',
                    fontSize: '1rem',
                    justifyContent: 'flex-start'
                  }}
                >
                  <item.icon size={20} />
                  {item.name}
                </button>
              </li>
            );
          })}
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
               transition: 'background-color 0.2s',
               border: 'none',
               fontSize: '1rem'
             }}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffdad6'}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
             onClick={handleLogout}
           >
             <LogOut size={20} />
             Đăng xuất
           </button>
        </div>
      </nav>
    </aside>
  );
};

export default KDSSidebar;
