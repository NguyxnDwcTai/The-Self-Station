import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';
import KioskSidebar from '../components/Kiosk/KioskSidebar';
import KioskMenu from '../components/Kiosk/KioskMenu';
import KioskStatus from '../components/Kiosk/KioskStatus';
import KioskScan from '../components/Kiosk/KioskScan';
import KioskReady from '../components/Kiosk/KioskReady';
import KioskBill from '../components/Kiosk/KioskBill';
import { useRef } from 'react';

const API_BASE = 'http://localhost:5000/api/kiosk';

export default function KioskTerminal() {
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem('kiosk_currentView') || 'menu';
  });
  
  const [menuItems, setMenuItems] = useState([]);
  
  const [cart, setCart] = useState(() => {
    const saved = sessionStorage.getItem('kiosk_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [orderTracking, setOrderTracking] = useState(() => {
    const saved = sessionStorage.getItem('kiosk_orderTracking');
    return saved ? JSON.parse(saved) : null;
  });

  const [isReadOnly, setIsReadOnly] = useState(() => {
    return sessionStorage.getItem('kiosk_isReadOnly') === 'true';
  });

  const orderTrackingRef = useRef(orderTracking);

  useEffect(() => {
    sessionStorage.setItem('kiosk_currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    sessionStorage.setItem('kiosk_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (orderTracking) {
      sessionStorage.setItem('kiosk_orderTracking', JSON.stringify(orderTracking));
    } else {
      sessionStorage.removeItem('kiosk_orderTracking');
    }
    orderTrackingRef.current = orderTracking;
  }, [orderTracking]);

  useEffect(() => {
    sessionStorage.setItem('kiosk_isReadOnly', isReadOnly ? 'true' : 'false');
  }, [isReadOnly]);

  useEffect(() => {
    axios.get(`${API_BASE}/menu`)
      .then(res => {
        if (res.data && res.data.length > 0) setMenuItems(res.data);
      })
      .catch(err => console.error("Kiosk API fetch error:", err));

    const socket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('orderStatusUpdated', (data) => {
      const { orderID, itemID, status, detailId } = data;
      setOrderTracking(prev => {
        if (prev && prev.orderID === orderID) {
          return {
            ...prev,
            orderDetails: prev.orderDetails.map(item => 
              // Ưu tiên khớp detailId nếu có, nếu không thì fallback theo itemID (cho an toàn)
              (detailId ? item.id === detailId : item.itemID === itemID) ? { ...item, status } : item
            )
          };
        }
        return prev;
      });
    });

    socket.on('newOrderItem', (data) => {
      const { orderID, detail } = data;
      setOrderTracking(prev => {
        if (prev && prev.orderID === orderID) {
          // Kiểm tra tránh bị trùng id (trường hợp API axios đã thêm vào rồi)
          if (!prev.orderDetails.find(d => d.id === detail.id)) {
            return {
              ...prev,
              orderDetails: [...prev.orderDetails, detail]
            };
          }
        }
        return prev;
      });
    });

    socket.on('menuItemChanged', (data) => {
      setMenuItems(prev => prev.map(item => 
        item.itemID === data.itemID ? { ...item, isActive: data.isActive } : item
      ));
    });

    socket.on('menuDailyReset', () => {
      axios.get(`${API_BASE}/menu`).then(res => {
         if (res.data && res.data.length > 0) setMenuItems(res.data);
      });
    });

    socket.on('orderPaid', (data) => {
      if (orderTrackingRef.current && orderTrackingRef.current.orderID === data.orderID) {
        setCart([]);
        setOrderTracking(null);
        setIsReadOnly(false);
        setCurrentView('menu');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const [toastError, setToastError] = useState(null);

  const handleUpdateCart = async (item, delta) => {
    // 1. CHƯA ĐẶT HÀNG: Cập nhật local cart bình thường
    if (!orderTracking) {
      setCart(prev => {
        const existing = prev.find(i => i.itemID === item.itemID);
        if (existing) {
          const nextQty = existing.quantity + delta;
          if (nextQty <= 0) return prev.filter(i => i.itemID !== item.itemID);
          return prev.map(i => i.itemID === item.itemID ? { ...i, quantity: nextQty } : i);
        }
        if (delta > 0) {
          return [...prev, { ...item, quantity: 1 }];
        }
        return prev;
      });
      return;
    }

    // 2. ĐÃ ĐẶT HÀNG: Cập nhật API ngầm + Optimistic UI
    const orderID = orderTracking.orderID;
    const detailId = item.id; // Có thể undefined nếu là món mới hoàn toàn

    // Lưu lại state cũ để rollback
    const previousOrderTracking = JSON.parse(JSON.stringify(orderTracking));

    // Cập nhật Optimistic UI
    setOrderTracking(prev => {
      const details = [...prev.orderDetails];
      if (!detailId) {
        // Thêm món mới tinh trên UI từ menu
        if (delta > 0) {
           // Tìm xem có món WAITING cùng itemID không để gộp
           const existingWaitingIdx = details.findIndex(d => d.itemID === item.itemID && d.status === 'WAITING');
           if (existingWaitingIdx >= 0) {
               details[existingWaitingIdx].quantity += delta;
           } else {
               details.push({ ...item, quantity: 1, status: 'WAITING', isTemp: true });
           }
        }
      } else {
        const idx = details.findIndex(d => d.id === detailId);
        if (idx >= 0) {
          if (details[idx].status === 'WAITING') {
             const nextQty = details[idx].quantity + delta;
             if (nextQty <= 0) {
                details[idx].status = 'CANCELLED';
             } else {
                details[idx].quantity = nextQty;
             }
          } else if (delta > 0) {
             // Không cập nhật số lượng của món Đang làm/Đã xong. Thêm 1 thẻ mới WAITING
             details.push({ ...details[idx], id: 'temp_' + Date.now(), quantity: delta, status: 'WAITING', isTemp: true });
          }
        }
      }
      return { ...prev, orderDetails: details };
    });

    try {
      if (!detailId) {
        // Gọi API tạo mới item
        await axios.post(`${API_BASE}/orders/${orderID}/items`, {
          itemID: item.itemID,
          quantity: delta,
          unitPrice: item.price
        });
      } else {
        // Gọi API update detailId
        await axios.put(`${API_BASE}/orders/${orderID}/details/${detailId}`, {
          delta
        });
      }
      // Reload lại data từ server để đồng bộ chính xác (lấy ID thực của các món split)
      const res = await axios.get(`${API_BASE}/orders/${orderID}`);
      setOrderTracking(res.data);
    } catch (error) {
      // Rollback
      setOrderTracking(previousOrderTracking);
      const errMsg = error.response?.data?.error || 'Lỗi mạng, không thể cập nhật món ăn lúc này!';
      setToastError(errMsg);
      setTimeout(() => setToastError(null), 4000);
      
      // Fetch latest state just in case
      try {
        const res = await axios.get(`${API_BASE}/orders/${orderID}`);
        setOrderTracking(res.data);
      } catch (e) {}
    }
  };

  const submitOrder = async () => {
    // Nếu đã có order, nút Submit ở Menu sẽ không có tác dụng hoặc chuyển hướng
    if (orderTracking) {
       setCurrentView('status');
       return;
    }
    
    if (cart.length === 0) return;
    try {
      const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const itemsPayload = cart.map(i => ({ itemID: i.itemID, quantity: i.quantity, unitPrice: i.price }));
      // Lấy tableID từ tham số URL, ví dụ: /kiosk?table=TB_02. Mặc định là TB_01 nếu không có param.
      const queryParams = new URLSearchParams(window.location.search);
      const tableID = queryParams.get('table') || "TB_01";
      
      const order = await axios.post(`${API_BASE}/orders`, { tableID, totalAmount, items: itemsPayload });
      
      setOrderTracking({ ...order.data, startTime: Date.now() });
      setCart([]); // Xóa giỏ hàng ảo vì orderTracking đã quản lý
      setCurrentView('status');
    } catch(err) {
       console.error(err);
       setToastError('Không thể tạo đơn hàng, vui lòng thử lại.');
       setTimeout(() => setToastError(null), 4000);
    }
  };

  useEffect(() => {
     // Removed mock status timer
  }, [orderTracking]);

  // Fallback data
  const safeMenuItems = menuItems.length > 0 ? menuItems : [
    { itemID: 'F01', itemName: 'Salad Cá Hồi Áp Chảo', price: 145000, categoryID: 'CAT_FOOD', category: { categoryName: 'Món chính' }, imageURL: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300' },
    { itemID: 'F02', itemName: 'Bánh Pancakes Mật Ong', price: 85000, categoryID: 'CAT_FOOD', category: { categoryName: 'Món chính' }, imageURL: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300' },
    { itemID: 'F03', itemName: 'Bát Ngũ Cốc Thuần Chay', price: 120000, categoryID: 'CAT_FOOD', category: { categoryName: 'Món chính' }, imageURL: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300' },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-[#383831] font-sans antialiased bg-[#fdfaf0] select-none">
      
      <KioskSidebar currentView={currentView} setView={setCurrentView} />

      <div className="flex-1 relative flex overflow-hidden">
         {currentView === 'menu' && (
            <KioskMenu 
               menuItems={safeMenuItems} 
               cart={orderTracking ? orderTracking.orderDetails.map(d => ({
                 id: d.id,
                 itemID: d.itemID,
                 itemName: d.menuItem?.itemName || d.itemName || 'Unknown',
                 price: d.unitPrice || d.price,
                 quantity: d.quantity,
                 imageURL: d.menuItem?.imageURL || d.imageURL,
                 status: d.status,
                 isTemp: d.isTemp
               })) : cart} 
               handleUpdateCart={handleUpdateCart} 
               submitOrder={submitOrder} 
               setView={setCurrentView} 
               isSubmitted={!!orderTracking}
               isReadOnly={isReadOnly}
            />
         )}
         
         {currentView === 'scan' && (
            <KioskScan setView={setCurrentView} />
         )}

         {currentView === 'status' && (
            <KioskStatus orderTracking={orderTracking} setView={setCurrentView} isReadOnly={isReadOnly} />
         )}

         {currentView === 'bill' && (
            <KioskBill orderTracking={orderTracking} setView={setCurrentView} isReadOnly={isReadOnly} />
         )}
      </div>

      <KioskReady
        orderTracking={orderTracking}
        isReadOnly={isReadOnly}
        onComplete={() => {
          setIsReadOnly(true);
          setCurrentView('status');
        }}
      />

      {toastError && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#ba1a1a] text-white px-6 py-3 rounded-lg shadow-xl font-bold flex items-center gap-3 z-50 animate-bounce-in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {toastError}
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: translate(-50%, 100%); opacity: 0; }
          60% { transform: translate(-50%, -10%); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
