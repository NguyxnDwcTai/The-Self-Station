import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const dictionary = {
  vi: {
    // Menu Sidebar
    menuDashboard: 'Dashboard',
    menuPromotions: 'Khuyến mãi',
    menuMenu: 'Quản lý Thực đơn',
    menuAccounts: 'Quản lý Tài khoản',
    menuReports: 'Báo cáo & Thống kê',
    logout: 'Đăng xuất',
    
    // Reports
    reportTitle: 'Báo cáo & Thống kê',
    downloadReport: 'Tải báo cáo',
    totalRevenue: 'Doanh thu tổng',
    completedOrders: 'Số hóa đơn đã hoàn thành',
    avgOrder: 'Giá trị đơn trung bình',
    revenueMomentum: 'Động lượng doanh thu',
    period30Days: '30 ngày',
    period6Months: '6 tháng đầu năm',
    period1Year: '1 năm',
    categoryShare: 'Tỷ trọng danh mục',
    total: 'Tổng thu',
    top5Title: 'Top 5 món bán chạy nhất',
    viewDetails: 'Xem chi tiết',
    rank: 'Rank',
    item: 'Món ăn',
    category: 'Danh mục',
    qty: 'Số lượng',
    revenue: 'Doanh thu',
    modalTitle: 'Hiệu suất tất cả món ăn',

    // Dashboard
    dashOverview: 'Tổng quan hoạt động',
    dashRevToday: 'DOANH THU HÔM NAY',
    dashTotalOrders: 'TỔNG HÓA ĐƠN',
    dashQuickAction: 'Thao tác nhanh',
    dashAddMenu: 'Thêm món',
    dashAddPromo: 'Tạo khuyến mãi',
    dashAddStaff: 'Thêm nhân sự',
    dashRevChart: 'Doanh thu theo ngày',
    dashRecentOrders: 'Giao dịch gần nhất',
    dashViewAll: 'Xem tất cả',
    dashTopSelling: 'Top món bán chạy',
    dashOrderEmpty: 'Trống',
    dashOrderSys: 'Hóa đơn & Giao dịch Toàn hệ thống',

    // --- BỔ SUNG MỚI ---

    // Promotions (Quản lý Khuyến mãi)
    promoTitle: 'Quản lý Khuyến mãi',
    promoActive: 'Khuyến mãi đang chạy',
    promoUsedToday: 'Lượt sử dụng hôm nay',
    promoTabAll: 'Tất cả',
    promoTabOngoing: 'Đang diễn ra',
    promoTabUpcoming: 'Sắp tới',
    promoTabEnded: 'Kết thúc',
    promoSearch: 'Tìm Voucher...',
    promoCreateBtn: 'Tạo mã khuyến mãi',
    promoAvailable: 'MÃ KHẢ DỤNG',
    promoDisabled: 'ĐÃ BỊ VÔ HIỆU HÓA',
    promoTime: 'Thời gian:',
    promoCondition: 'Điều kiện:',
    promoUsed: 'Đã dùng:',
    promoStatusActive: 'Trạng thái Kích hoạt',
    promoMinOrder: 'Đơn từ 0đ',
    promoUnlimited: 'Không giới hạn',

    // Menu Management (Quản lý Thực đơn)
    menuMgmtTitle: 'Quản lý Thực đơn',
    menuFilterCategory: 'Tất cả danh mục',
    menuFilterStatus: 'Tất cả trạng thái',
    menuSearch: 'Tìm kiếm theo Tên Hoặc Mã Mới...',
    menuAddBtn: 'Thêm Món Mới',
    menuColItem: 'MÓN ĂN',
    menuColCode: 'MÃ CODE',
    menuColCategory: 'PHÂN LOẠI',
    menuColPrice: 'ĐƠN GIÁ',
    menuColStatus: 'TRẠNG THÁI',
    menuColAction: 'THAO TÁC',
    menuStatusServing: 'ĐANG PHỤC VỤ',

    // Accounts (Quản lý Tài khoản)
    accTitle: 'Quản lý Tài khoản',
    accCreateBtn: 'Tạo tài khoản',
    accFilterRoleLabel: 'NHÓM QUYỀN',
    accFilterAllRoles: 'Tất cả vai trò',
    accFilterStatusLabel: 'TRẠNG THÁI TÀI KHOẢN',
    accFilterAllStatus: 'Tất cả trạng thái',
    accSummaryTotal: 'Tổng nhân sự hiện có đang hoạt động:',
    accSummaryBranch: '(Chi nhánh trung tâm)',
    accColAccount: 'TÀI KHOẢN',
    accColRole: 'VAI TRÒ',
    accColSign: 'KÝ HIỆU NỘI BỘ',
    accColStatus: 'TRẠNG THÁI',
    accColAction: 'HÀNH ĐỘNG',
    accRoleManager: 'QUẢN LÝ',
    accRoleCashier: 'THU NGÂN',
    accRoleChef: 'ĐẦU BẾP',
    accStatusActive: 'Đang hoạt động',
    accStatusLocked: 'Bị khóa',
    accPaginationDisplay: 'Hiển thị',
    accPaginationOf: 'của',
    accPaginationResults: 'kết quả',

    // --- KIOSK (Giai đoạn 3) ---
    kioskWelcomeMsg: 'Chạm để bắt đầu gọi món',
    kioskStartBtn: '👉 Bắt đầu',
    kioskMenuTitle: 'Thực đơn',
    kioskCartTitle: 'Đơn hàng của bạn',
    kioskAddToCart: 'Thêm',
    kioskCheckout: 'Thanh toán',
    kioskTotal: 'Tổng cộng',
    kioskScanCardBtn: 'Quét thẻ tích điểm',
    kioskScanPrompt: 'Đưa thẻ lại gần để tích điểm',
    kioskSkipBtn: 'Bỏ qua',
    kioskPayMethodTitle: 'Chọn Phương Thức Thanh Toán',
    kioskPayCash: 'Tiền mặt tại quầy',
    kioskPayCard: 'Thẻ Ngân Hàng / QR',
    kioskProcessing: 'Đơn hàng đang được chuẩn bị...',
    kioskOrderNum: 'Đơn #',
    kioskStatusDone: '✅ Đã xong',
    kioskStatusWaiting: '⏳ Đang chờ bếp',
    kioskEarnedPoints: 'Điểm thưởng đạt được:',
    kioskOrderMore: 'Gọi thêm món',
    kioskAllReady: 'Tất cả đã sẵn sàng. Vui lòng đến quầy nhận món!'
  },
  en: {
    // Menu Sidebar
    menuDashboard: 'Dashboard',
    menuPromotions: 'Promotions',
    menuMenu: 'Menu Management',
    menuAccounts: 'Accounts',
    menuReports: 'Reports & Analytics',
    logout: 'Log out',
    
    // Reports
    reportTitle: 'Reports & Analytics',
    downloadReport: 'Export Report',
    totalRevenue: 'Total Revenue',
    completedOrders: 'Completed Orders',
    avgOrder: 'Avg Order Value',
    revenueMomentum: 'Revenue Momentum',
    period30Days: 'Last 30 Days',
    period6Months: 'First 6 Months',
    period1Year: '1 Year',
    categoryShare: 'Category Share',
    total: 'Total',
    top5Title: 'Top 5 Best Sellers',
    viewDetails: 'View All',
    rank: 'Rank',
    item: 'Item',
    category: 'Category',
    qty: 'QTY',
    revenue: 'Revenue',
    modalTitle: 'All Items Performance',

    // Dashboard
    dashOverview: 'Overview',
    dashRevToday: 'TODAY REVENUE',
    dashTotalOrders: 'TOTAL ORDERS',
    dashQuickAction: 'Quick Actions',
    dashAddMenu: 'Add Item',
    dashAddPromo: 'Add Promo',
    dashAddStaff: 'Add Staff',
    dashRevChart: 'Revenue by Day',
    dashRecentOrders: 'Recent Transactions',
    dashViewAll: 'View All',
    dashTopSelling: 'Top Selling Items',
    dashOrderEmpty: 'Empty',
    dashOrderSys: 'System Transactions',

    // --- BỔ SUNG MỚI ---

    // Promotions (Quản lý Khuyến mãi)
    promoTitle: 'Promotions Management',
    promoActive: 'Active Promotions',
    promoUsedToday: 'Used Today',
    promoTabAll: 'All',
    promoTabOngoing: 'Ongoing',
    promoTabUpcoming: 'Upcoming',
    promoTabEnded: 'Ended',
    promoSearch: 'Search Voucher...',
    promoCreateBtn: 'Create Promo Code',
    promoAvailable: 'AVAILABLE',
    promoDisabled: 'DISABLED',
    promoTime: 'Time:',
    promoCondition: 'Condition:',
    promoUsed: 'Used:',
    promoStatusActive: 'Activation Status',
    promoMinOrder: 'Orders from 0đ',
    promoUnlimited: 'Unlimited',

    // Menu Management (Quản lý Thực đơn)
    menuMgmtTitle: 'Menu Management',
    menuFilterCategory: 'All Categories',
    menuFilterStatus: 'All Statuses',
    menuSearch: 'Search by Name or Code...',
    menuAddBtn: 'Add New Item',
    menuColItem: 'ITEM',
    menuColCode: 'CODE',
    menuColCategory: 'CATEGORY',
    menuColPrice: 'PRICE',
    menuColStatus: 'STATUS',
    menuColAction: 'ACTION',
    menuStatusServing: 'SERVING',

    // Accounts (Quản lý Tài khoản)
    accTitle: 'Account Management',
    accCreateBtn: 'Create Account',
    accFilterRoleLabel: 'ROLE GROUP',
    accFilterAllRoles: 'All Roles',
    accFilterStatusLabel: 'ACCOUNT STATUS',
    accFilterAllStatus: 'All Statuses',
    accSummaryTotal: 'Total active personnel:',
    accSummaryBranch: '(Main Branch)',
    accColAccount: 'ACCOUNT',
    accColRole: 'ROLE',
    accColSign: 'INTERNAL SIGN',
    accColStatus: 'STATUS',
    accColAction: 'ACTION',
    accRoleManager: 'MANAGER',
    accRoleCashier: 'CASHIER',
    accRoleChef: 'CHEF',
    accStatusActive: 'Active',
    accStatusLocked: 'Locked',
    accPaginationDisplay: 'Showing',
    accPaginationOf: 'of',
    accPaginationResults: 'results',

    // --- KIOSK (Phase 3) ---
    kioskWelcomeMsg: 'Tap to start ordering',
    kioskStartBtn: '👉 Start',
    kioskMenuTitle: 'Menu',
    kioskCartTitle: 'Your Order',
    kioskAddToCart: 'Add',
    kioskCheckout: 'Checkout',
    kioskTotal: 'Total',
    kioskScanCardBtn: 'Scan Reward Card',
    kioskScanPrompt: 'Bring your card near to earn points',
    kioskSkipBtn: 'Skip',
    kioskPayMethodTitle: 'Select Payment Method',
    kioskPayCash: 'Cash at Counter',
    kioskPayCard: 'Credit Card / QR',
    kioskProcessing: 'Your order is being prepared...',
    kioskOrderNum: 'Order #',
    kioskStatusDone: '✅ Done',
    kioskStatusWaiting: '⏳ Waiting for kitchen',
    kioskEarnedPoints: 'Earned Points:',
    kioskOrderMore: 'Order More',
    kioskAllReady: 'All items are ready. Please collect at counter!'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi'); // 'vi' or 'en'
  
  const toggleLanguage = (lang) => {
    if(lang === 'vi' || lang === 'en') {
      setLanguage(lang);
    } else {
      setLanguage(prev => prev === 'vi' ? 'en' : 'vi');
    }
  };

  const t = dictionary[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error("LỖI: Bạn đang dùng useLanguage ở một Component nằm ngoài <LanguageProvider>. Hãy kiểm tra lại file App.jsx!");
  }
  
  return context;
};