import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Clock, Wifi, WifiOff, Receipt, Utensils, History, Settings, Timer, Info, FileText, AlertTriangle, CheckCircle, Bell, LogOut } from 'lucide-react';
import KDSMenu from './KDSMenu';
import KDSSidebar from '../components/kds/KDSSidebar';
import KDSHeader from '../components/kds/KDSHeader';

const SOCKET_SERVER_URL = 'http://localhost:5000'; // Fallback, usually window.location.origin
const API_BASE_URL = 'http://localhost:5000/api';

const formatTimeDiff = (startTime, now) => {
  const diff = Math.floor((now - new Date(startTime).getTime()) / 1000);
  if (diff < 0) return '00:00';
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const KDS = () => {
  const [orders, setOrders] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [isConnected, setIsConnected] = useState(true);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false); // controls red dot
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activePage, setActivePage] = useState('orders'); // 'orders' | 'menu'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Setup Timer for auto-refreshing wait times
    const timerInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // 2. Fetch Initial Orders
    fetchOrders();

    // 3. Setup Socket.IO
    socketRef.current = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      fetchOrders(); // Re-fetch to ensure we haven't missed anything while offline
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('orderStatusUpdated', (data) => {
      const { orderID, detailId, status } = data;
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.orderID === orderID) {
            return {
              ...order,
              orderDetails: order.orderDetails.map(item => 
                item.id === detailId ? { ...item, status } : item
              )
            };
          }
          return order;
        });
      });
    });

    socketRef.current.on('orderQuantityUpdated', (data) => {
      const { orderID, detailId, quantity } = data;
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.orderID === orderID) {
          return {
            ...order,
            orderDetails: order.orderDetails.map(item =>
              item.id === detailId ? { ...item, quantity } : item
            )
          };
        }
        return order;
      }));
    });

    socketRef.current.on('newOrderItem', (data) => {
      const { orderID, detail } = data;
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.orderID === orderID) {
          return {
            ...order,
            orderDetails: [...order.orderDetails, detail]
          };
        }
        return order;
      }));
    });

    socketRef.current.on('newKioskOrder', (newOrder) => {
      showToast(`Có order mới từ ${newOrder.tableID || 'Kiosk'}!`, 'success');
      setOrders(prevOrders => {
        if (!prevOrders.some(o => o.orderID === newOrder.orderID)) {
          return [...prevOrders, newOrder];
        }
        return prevOrders;
      });
    });

    socketRef.current.on('menuItemChanged', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        message: `Món ăn "${data.itemName}" đã bị ${data.action}`,
        time: new Date()
      }, ...prev]);
      setHasUnread(true);
    });

    // Listen for the daily midnight reset broadcast from server
    socketRef.current.on('menuDailyReset', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        message: `🌅 Sang ngày mới! ${data.count} món ăn đã được reset về "Còn hàng".`,
        time: new Date()
      }, ...prev]);
      setHasUnread(true);
      // Re-fetch orders and refresh UI
      fetchOrders();
    });

    // 4. Polling fallback just in case socket misses a new order
    const pollInterval = setInterval(fetchOrders, 10000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(pollInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders`);
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleMarkAsDone = async (orderId, detailId, currentStatus) => {
    if (!isConnected) {
      showToast('Lỗi cập nhật trạng thái. Vui lòng kiểm tra lại kết nối mạng!', 'error');
      return;
    }

    // Optimistic UI update (Rollback prep)
    const previousOrders = [...orders];
    
    // Instantly hide the item or mark as done in UI
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.orderID === orderId) {
        return {
          ...order,
          orderDetails: order.orderDetails.map(item => 
            item.id === detailId ? { ...item, status: 'DONE' } : item
          )
        };
      }
      return order;
    }));

    try {
      await axios.put(`${API_BASE_URL}/orders/${orderId}/details/${detailId}/status`, {
        status: 'DONE'
      });
      showToast('Cập nhật trạng thái thành công', 'success');
    } catch (error) {
      setOrders(previousOrders);
      showToast('Lỗi kết nối mạng. Không thể cập nhật trạng thái món ăn lúc này!', 'error');
    }
  };

  const handleMarkAsCooking = async (orderId, detailId) => {
    if (!isConnected) {
      showToast('Lỗi cập nhật trạng thái. Vui lòng kiểm tra lại kết nối mạng!', 'error');
      return;
    }

    const previousOrders = [...orders];
    
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.orderID === orderId) {
        return {
          ...order,
          orderDetails: order.orderDetails.map(item => 
            item.id === detailId ? { ...item, status: 'COOKING' } : item
          )
        };
      }
      return order;
    }));

    try {
      await axios.put(`${API_BASE_URL}/orders/${orderId}/details/${detailId}/status`, {
        status: 'COOKING'
      });
      showToast('Đã chuyển sang trạng thái đang chế biến', 'success');
    } catch (error) {
      setOrders(previousOrders);
      showToast('Lỗi kết nối mạng. Không thể cập nhật trạng thái món ăn lúc này!', 'error');
    }
  };

  const handleMarkAsOutOfStock = async (orderId, detailId) => {
    if (!isConnected) {
      showToast('Lỗi cập nhật trạng thái. Vui lòng kiểm tra lại kết nối mạng!', 'error');
      return;
    }
    
    const previousOrders = [...orders];
    
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.orderID === orderId) {
        return {
          ...order,
          orderDetails: order.orderDetails.map(item => 
            item.id === detailId ? { ...item, status: 'OUT_OF_STOCK' } : item
          )
        };
      }
      return order;
    }));

    try {
      await axios.put(`${API_BASE_URL}/orders/${orderId}/details/${detailId}/status`, {
        status: 'OUT_OF_STOCK'
      });
      showToast('Đã đánh dấu hết hàng', 'success');
    } catch (error) {
      setOrders(previousOrders);
      showToast('Lỗi kết nối mạng. Không thể cập nhật trạng thái món ăn lúc này!', 'error');
    }
  };

  const handleMarkOrderDone = async (order) => {
    // Mark all waiting items as done
    const waitingItems = order.orderDetails.filter(item => item.status === 'WAITING');
    for (const item of waitingItems) {
      await handleMarkAsDone(order.orderID, item.id, item.status);
    }
  };

  // Filter out orders that have no active items (DONE or CANCELLED only = hide)
  const activeOrders = orders.filter(order => 
    order.orderDetails && order.orderDetails.some(item => item.status === 'WAITING' || item.status === 'OUT_OF_STOCK' || item.status === 'COOKING')
  ).sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));

  return (
    <div className="dashboard-wrapper" style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--dashboard-bg)' }}>
      {/* Network Loss Banner */}
      {!isConnected && (
        <div className="bg-[var(--dashboard-danger-bg)] text-[var(--dashboard-danger-text)] p-2 text-center font-bold flex items-center justify-center gap-2 shadow-sm absolute top-0 left-0 right-0 z-[60]">
          <WifiOff size={18} /> Mất kết nối dữ liệu. Đang thử kết nối lại...
        </div>
      )}

      {/* Sidebar */}
      <KDSSidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        handleLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      <div className="dashboard-main flex-1 flex flex-col overflow-hidden relative">
        <KDSHeader 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isConnected={isConnected}
          now={now}
          hasUnread={hasUnread}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          setHasUnread={setHasUnread}
          activePage={activePage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto" style={{ padding: '1.5rem' }}>
          {activePage === 'orders' ? (
            activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[70vh] text-center opacity-70">
                <CheckCircle size={80} color="#acd0ad" className="mb-6" />
                <h2 className="text-3xl font-bold text-[#37563b] mb-2">Bếp đang rảnh rỗi!</h2>
                <p className="text-xl text-[#605f4e]">Hiện tại chưa có yêu cầu gọi món nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-6">
                {activeOrders.map(order => {
                  const waitTime = formatTimeDiff(order.orderDate, now);
                  const diffMs = now - new Date(order.orderDate).getTime();
                  const isUrgent = diffMs > 15 * 60 * 1000;
                  let activeItems = order.orderDetails.filter(i => i.status === 'WAITING' || i.status === 'OUT_OF_STOCK' || i.status === 'COOKING' || i.status === 'CANCELLED');
                  
                  if (activeTab === 'Mới nhận') {
                     activeItems = activeItems.filter(i => i.status === 'WAITING');
                  } else if (activeTab === 'Đang chế biến') {
                     activeItems = activeItems.filter(i => i.status === 'COOKING');
                  }

                  if (activeItems.length === 0) return null;

                  const statusOrder = { 'WAITING': 1, 'COOKING': 2, 'DONE': 3, 'OUT_OF_STOCK': 4, 'CANCELLED': 5 };
                  activeItems.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

                  return (
                    <div key={order.orderID} className={`bg-[#ffffff] rounded-[8px] shadow-[0_12px_16px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden border ${isUrgent ? 'border-[#ffdad6]/50' : 'border-[#e4e2e2]/20'}`}>
                      {/* Card Header */}
                      <div className="p-5 flex justify-between items-start border-b border-[#e4e2e2]/30" style ={{padding: '10px'}}>
                        <div>
                          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-[600] text-[#424841]">BÀN</span>
                          <h2 className="text-[32px] leading-[36px] tracking-[-0.02em] font-[800] text-[#1b1c1c]">{order.table?.tableName || 'Mang đi'}</h2>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`flex items-center gap-1 ${isUrgent ? 'text-[#875f35] animate-pulse' : 'text-[#4F6F52]'}`} style = {{marginBottom: '5px'}}>
                            {isUrgent ? <AlertTriangle size={20} /> : <Timer size={20} />}
                            <span className="text-[18px] leading-[22px] font-[700] tabular-nums">{waitTime}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[12px] leading-[16px] tracking-[0.05em] font-[600] mt-1 uppercase ${isUrgent ? 'bg-[#ffdcbd] text-[#2c1600]' : 'bg-[#e3e1cb] text-[#646352]'}`} style = {{padding: '3px'}}>
                            {order.tableID ? 'ĂN TẠI CHỖ' : 'GIAO HÀNG'}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-5 flex-grow space-y-4" style ={{padding: '10px'}}>
                        {activeItems.map((item, idx) => {
                          const isOutOfStock = item.status === 'OUT_OF_STOCK';
                          const isCooking = item.status === 'COOKING';
                          const isCancelled = item.status === 'CANCELLED';
                          return (
                            <div key={`${order.orderID}-${item.id || item.itemID}-${idx}`} className={`flex items-start gap-4 group ${(isOutOfStock || isCancelled) ? 'opacity-50 grayscale' : ''}`} style={{marginTop: '10px'}}>
                              {item.quantity > 1 ? (
                                <span className={`text-[24px] leading-[28px] font-[700] ${isCancelled ? 'text-[#ba1a1a] bg-[#ffdad6] line-through' : 'text-[#2f4e33] bg-[#c8ecc8]'} w-10 h-10 flex items-center justify-center rounded-lg shrink-0`}>{item.quantity}</span>
                              ) : (
                                <span className={`text-[24px] leading-[28px] font-[700] ${isCancelled ? 'text-[#ba1a1a] bg-[#ffdad6] line-through' : 'text-[#424841] bg-[#efeded]'} w-10 h-10 flex items-center justify-center rounded-lg shrink-0`}>{item.quantity}</span>
                              )}
                              <div className="pt-1 flex-1">
                                <p className={`text-[20px] leading-[24px] font-[600] ${isCancelled ? 'text-[#ba1a1a] line-through' : 'text-[#1b1c1c]'}`}>
                                  {item.menuItem?.itemName || 'Món không xác định'}
                                  {isOutOfStock && <span className="ml-2 text-[12px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Hết hàng</span>}
                                  {isCancelled && <span className="float-right text-[12px] bg-[#ba1a1a] text-white px-2 py-0.5 rounded font-bold animate-pulse" style = {{padding: 5}}>HỦY</span>}
                                  {isCooking && <span className="float-right text-[12px] bg-[#ffdcbd] text-[#9d4f00] px-2 py-0.5 rounded font-bold" style = {{padding: 5}}>Đang nấu</span>}
                                </p>
                                {!(isOutOfStock || isCancelled) && (
                                  <div className="flex gap-2 mt-2" style = {{marginTop: 10}}>
                                    {item.status === 'WAITING' && (
                                      <button onClick={() => handleMarkAsCooking(order.orderID, item.id)} className="px-4 py-1 text-white text-sm font-bold rounded-[4px] shadow-sm hover:bg-[#8b5300] transition-colors" style={{backgroundColor: '#b26b00', padding: '3px'}}>Bắt đầu chế biến</button>
                                    )}
                                    <button onClick={() => handleMarkAsDone(order.orderID, item.id, item.status)} className="px-4 py-1 text-white text-sm font-bold rounded-[4px] shadow-sm hover:bg-[#3d5a40] transition-colors" style = {{backgroundColor: '#4f6f52', padding: '3px'}}>Xong món này</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Card Footer */}
                      <div className="p-4 bg-[#4F6F52]" style = {{marginTop: '10px'}}>
                        <button onClick={() => handleMarkOrderDone(order)} className="w-full bg-[#4F6F52] text-white py-4 rounded-[8px] font-bold text-lg shadow-md active:scale-95 transition-transform hover:bg-[#3d5a40]" style = {{padding: '10px'}}>
                          Đã xong
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="px-8 py-4">
              <KDSMenu showToast={showToast} />
            </div>
          )}
        </main>
      </div>

      {/* Toasts */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300
          ${toast.type === 'error' ? 'bg-[var(--dashboard-danger-bg)] text-[var(--dashboard-danger-text)]' : 'bg-[var(--dashboard-success-bg)] text-[var(--dashboard-success-text)]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: translateY(100%); opacity: 0; }
          60% { transform: translateY(-10%); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default KDS;
