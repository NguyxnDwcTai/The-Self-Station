import React from 'react';
import { Menu as MenuIcon, Clock, Bell, Wifi, WifiOff } from 'lucide-react';

const KDSHeader = ({ 
  toggleSidebar, 
  isConnected, 
  now, 
  hasUnread, 
  notifications, 
  showNotifications, 
  setShowNotifications, 
  setHasUnread,
  activePage,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="app-header" style={{
      height: '70px',
      backgroundColor: 'var(--dashboard-surface)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--dashboard-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div className="flex items-center gap-4" style={{ flex: 1 }}>
        <button className="mobile-menu-btn" onClick={toggleSidebar} style={{ display: 'none', padding: '8px', color: 'var(--dashboard-text-main)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
           <MenuIcon size={24} />
        </button>
        
        {/* Network Status Badge */}
        {isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--dashboard-success-bg)', borderRadius: '999px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--dashboard-success-text)' }} className="animate-pulse"></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--dashboard-success-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Đang kết nối</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--dashboard-danger-bg)', borderRadius: '999px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--dashboard-danger-text)' }} className="animate-pulse"></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--dashboard-danger-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mất mạng</span>
          </div>
        )}
      </div>

      {/* Center Tabs - Only show when activePage is 'orders' */}
      <div style={{ flex: 2, display: 'flex', justifyContent: 'center', height: '100%' }}>
        {activePage === 'orders' && (
          <nav style={{ display: 'flex', gap: '2rem', height: '100%' }}>
            {['Tất cả', 'Mới nhận', 'Đang chế biến'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  padding: '0 8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.05rem',
                  fontWeight: activeTab === tab ? '700' : '600',
                  color: activeTab === tab ? 'var(--dashboard-primary)' : 'var(--dashboard-text-muted)',
                  transition: 'color 0.2s'
                }}
              >
                {tab}
                {activeTab === tab && (
                  <span style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', height: '3px', backgroundColor: 'var(--dashboard-primary)', borderRadius: '3px 3px 0 0' }}></span>
                )}
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-6" style={{ flex: 1, justifyContent: 'flex-end' }}>
        
        {/* Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dashboard-text-main)' }}>
          <Clock size={20} />
          <span style={{ fontSize: '1.1rem', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>
            {new Date(now).toLocaleTimeString('vi-VN')}
          </span>
        </div>
        
        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s', color: 'var(--dashboard-text-main)' }}
             onClick={() => {
               setShowNotifications(prev => !prev);
               setHasUnread(false);
             }}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-surface-hover)'}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bell size={20} />
          {hasUnread && (
            <span style={{ position: 'absolute', top: '0px', right: '0px', backgroundColor: 'var(--dashboard-danger-text)', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '50%', height: '18px', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--dashboard-surface)' }}>
              {notifications.length}
            </span>
          )}
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div style={{ position: 'absolute', right: 0, top: '110%', width: '320px', backgroundColor: 'var(--dashboard-surface)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--dashboard-border)', borderRadius: '12px', overflow: 'hidden', zIndex: 50, cursor: 'default' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--dashboard-border)', fontWeight: '700', color: 'var(--dashboard-text-main)', fontSize: '0.95rem' }}>
                Thông báo hệ thống
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--dashboard-text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                    Không có thông báo mới
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--dashboard-border)' }}>
                      <div style={{ color: 'var(--dashboard-text-main)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>{notif.message}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--dashboard-text-muted)', fontWeight: '500' }}>{notif.time.toLocaleTimeString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Network icon fallback */}
        <Wifi size={20} style={{ color: isConnected ? 'var(--dashboard-text-muted)' : 'var(--dashboard-danger-text)' }} />
      </div>
    </header>
  );
};

export default KDSHeader;
