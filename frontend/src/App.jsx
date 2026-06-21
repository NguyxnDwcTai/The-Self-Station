import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import AccountManager from './pages/AccountManager';
import PromotionManager from './pages/PromotionManager';
import ReportManager from './pages/ReportManager';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import StorePage from './pages/StorePage';
import MenuTodayPage from './pages/MenuTodayPage';
import PromotionsPage from './pages/PromotionsPage';

import KioskTerminal from './pages/KioskTerminal';
import KDS from './pages/KDS';
import POS from './pages/POS';
import POSCashier from './pages/POSCashier';
import POSReport from './pages/POSReport';
import './assets/styles/App.css';

const PageTitle = ({ title, children }) => {
  useEffect(() => {
    document.title = title ? `${title} | The Self Restaurant` : 'The Self Restaurant';
  }, [title]);
  return children;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === 1) return <Navigate to="/admin" replace />;
      if (user.role === 2) return <Navigate to="/pos" replace />;
      if (user.role === 3) return <Navigate to="/kds" replace />;
      return <Navigate to="/login" replace />;
    }
    return children;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const AdminLayout = ({ children }) => (
    <div className="app-container" style={{ display: 'flex', backgroundColor: 'var(--dashboard-bg)' }}>
      {isSidebarOpen && (
        <div 
           className="sidebar-overlay"
           onClick={() => setIsSidebarOpen(false)}
           style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(59, 47, 47, 0.4)', zIndex: 40 }}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', width: '100%' }}>
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="main-content" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={<PageTitle title="Trang chủ"><LandingPage /></PageTitle>} />
        <Route path="/store" element={<PageTitle title="Cửa Hàng"><StorePage /></PageTitle>} />
        <Route path="/menu-today" element={<PageTitle title="Món ăn hôm nay"><MenuTodayPage /></PageTitle>} />
        <Route path="/promotions" element={<PageTitle title="Khuyến Mãi"><PromotionsPage /></PageTitle>} />

        {/* KIOSK ROUTE */}
        <Route path="/kiosk" element={<PageTitle title="Kiosk Terminal"><KioskTerminal /></PageTitle>} />

        {/* KDS ROUTE */}
        <Route path="/kds" element={
          <ProtectedRoute allowedRoles={[1, 3]}>
            <PageTitle title="Kitchen Display System"><KDS /></PageTitle>
          </ProtectedRoute>
        } />

        {/* POS ROUTE */}
        <Route path="/pos" element={
          <ProtectedRoute allowedRoles={[1, 2]}>
            <PageTitle title="POS Cashier"><POSCashier /></PageTitle>
          </ProtectedRoute>
        } />

        {/* POS REPORT ROUTE */}
        <Route path="/pos/report" element={
          <ProtectedRoute allowedRoles={[1, 2]}>
            <PageTitle title="Báo cáo ca"><POSReport /></PageTitle>
          </ProtectedRoute>
        } />

        {/* LOGIN ROUTE */}
        <Route path="/login" element={<PageTitle title="Đăng nhập"><Login /></PageTitle>} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={[1]}>
            <PageTitle title="Dashboard"><AdminLayout><Dashboard /></AdminLayout></PageTitle>
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute allowedRoles={[1]}>
            <PageTitle title="Quản lý thực đơn"><AdminLayout><MenuManager /></AdminLayout></PageTitle>
          </ProtectedRoute>
        } />
        <Route path="/admin/accounts" element={
          <ProtectedRoute allowedRoles={[1]}>
            <PageTitle title="Quản lý nhân viên"><AdminLayout><AccountManager /></AdminLayout></PageTitle>
          </ProtectedRoute>
        } />
        <Route path="/admin/promotions" element={
          <ProtectedRoute allowedRoles={[1]}>
            <PageTitle title="Quản lý khuyến mãi"><AdminLayout><PromotionManager /></AdminLayout></PageTitle>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={[1, 2]}>
            <PageTitle title="Báo cáo thống kê"><AdminLayout><ReportManager /></AdminLayout></PageTitle>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
