import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Clock, Wifi, WifiOff, Receipt, Utensils, History, Settings, Timer, Info, FileText, AlertTriangle, CheckCircle, Bell, LogOut } from 'lucide-react';
import KDSMenu from './KDSMenu';

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
    <div className="font-sans text-[#1b1c1c] bg-[#FDFCF8] h-screen flex flex-col overflow-hidden">
      {/* Network Loss Banner */}
      {!isConnected && (
        <div className="bg-[#ba1a1a] text-white p-2 text-center font-bold flex items-center justify-center gap-2 shadow-md fixed top-0 left-0 right-0 z-[60]">
          <WifiOff size={20} /> Mất kết nối dữ liệu. Đang thử kết nối lại...
        </div>
      )}

      {/* TopAppBar Shell */}
      <header className={`flex justify-between items-center px-8 h-20 w-full z-50 bg-[#fdfaf0] border-b border-stone-200 shadow-sm transition-all ${!isConnected ? 'top-10' : 'top-0'}`}>
        <div className="flex items-center gap-6">
          <span className="text-2xl font-black text-[#4F6F52]" style={{marginLeft: 50}}>The Self Restaurant</span>
          {isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#c8ecc8] rounded-full" style = {{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div className="w-2 h-2 rounded-[8px] bg-[#4F6F52] animate-pulse" style={{marginLeft: 4}}></div>
              <span className="text-[12px] leading-[16px] tracking-[0.05em] font-[600] text-[#2f4e33]" style={{padding: 2, marginRight: 4}}>Đang kết nối</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#ffdad6] rounded-full">
              <div className="w-2 h-2 rounded-[8px] bg-[#ba1a1a] animate-pulse"></div>
              <span className="text-[12px] leading-[16px] tracking-[0.05em] font-[600] text-[#93000a]" style={{padding: 2}}>Mất mạng</span>
            </div>
          )}
        </div>
        
        {activePage === 'orders' && (
          <nav className="absolute left-1/2 -translate-x-1/2 flex gap-8 items-center h-full">
            {['Tất cả', 'Mới nhận', 'Đang chế biến'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex flex-col items-center justify-center h-full px-2 transition-all tracking-tight text-[17px] ${
                  activeTab === tab 
                    ? 'font-bold text-[#4F6F52]' 
                    : 'font-medium text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab}
                {/* Thanh gạch chân màu xanh xuất hiện khi active */}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full bg-[#4F6F52] rounded-full"></span>
                )}
              </button>
            ))}
          </nav>
        )}
        
        <div className="flex items-center gap-6 text-[#4F6F52]">
          <div className="flex items-center gap-2">
            <Clock size={24} />
            <span className="text-[18px] leading-[22px] font-[700] tabular-nums">{new Date(now).toLocaleTimeString('vi-VN')}</span>
          </div>
          
          <div className="relative cursor-pointer hover:bg-stone-100/50 p-2 rounded-full transition-colors" onClick={() => {
            setShowNotifications(prev => !prev);
            setHasUnread(false); // Clear red dot when user opens notifications
          }}>
            <Bell size={24} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#ffffff] shadow-[0_12px_16px_rgba(0,0,0,0.06)] border border-[#e4e2e2]/20 rounded-[8px] overflow-hidden z-50" style={{padding: '5px'}}>
                <div className="p-3 border-b border-[#e4e2e2]/30 font-semibold text-[#37563b]" style={{padding: '5px'}}>Thông báo hệ thống</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-stone-400 text-sm" style = {{padding: '5px'}}>Không có thông báo mới</div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-3 border-b border-stone-100 text-sm" style = {{padding: '5px'}}>
                        <div className="text-[#1b1c1c]">{notif.message}</div>
                        <div className="text-xs text-stone-400 mt-1">{notif.time.toLocaleTimeString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Wifi size={24} className={isConnected ? '' : 'text-[#ba1a1a]'} style = {{marginRight: 20}} />
        </div>
      </header>

      {/* Main Container */}
      <main className={`flex flex-1 overflow-hidden bg-[#fdfaf0] relative ${!isConnected ? 'pt-[128px]' : 'pt-[80px]'}`}>
        {/* SideNavBar Shell */}
        <aside className={`left-0 w-24 flex flex-col justify-between py-6 z-40 bg-[#f6f4ea] border-r border-stone-200 shadow-inner transition-all ${!isConnected ? 'top-[120px] h-[calc(100vh-120px)]' : 'top-20 h-[calc(100vh-80px)]'}`}>
          <div className="space-y-4">
            <div 
              onClick={() => setActivePage('orders')}
              className={`flex flex-col items-center justify-center rounded-xl mx-2 py-4 shadow-sm transition-opacity cursor-pointer ${
                activePage === 'orders' ? 'bg-[#c8ecc8] text-[#4f6f52] shadow-lg' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
              style={{marginTop: 25, marginLeft: 10, marginRight: 10, paddingTop: 20, paddingBottom: 20}}
            >
              <Receipt size={24} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider" style = {{marginTop: 5}}>Đơn hàng</span>
            </div>
            <div 
              onClick={() => setActivePage('menu')}
              className={`flex flex-col items-center justify-center rounded-xl mx-2 py-4 shadow-sm transition-all cursor-pointer ${
                activePage === 'menu' ? 'bg-[#c8ecc8] text-[#4f6f52] shadow-lg' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
              style={{marginTop: 25, marginLeft: 10, marginRight: 10, paddingTop: 20, paddingBottom: 20}}
            >
              <Utensils size={24} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider" style = {{marginTop: 5}}>Thực đơn</span>
            </div>
          </div>
          
          <div className="mb-6" style={{marginBottom: 20}}>
            <div 
              onClick={handleLogout}
              className="flex flex-col items-center justify-center rounded-xl mx-2 py-4 text-[#ba1a1a] hover:bg-[#ffdad6] shadow-sm transition-all cursor-pointer"
              style={{marginLeft: 10, marginRight: 10, paddingTop: 20, paddingBottom: 20}}
            >
              <LogOut size={24} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{marginTop: 5}}>Đăng xuất</span>
            </div>
          </div>
        </aside>

        {/* Content Area — offset by sidebar width (96px = w-24) */}
        <div className="flex-1 overflow-y-auto relative ml-24 pb-24" style={{margin: 20}}>
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
        </div>
      </main>

      {/* Global Toast Notification */}
      {toast && (
        <div className={`fixed bottom-28 right-8 p-4 rounded-lg shadow-xl font-semibold flex items-center gap-3 z-50 animate-bounce-in
          ${toast.type === 'error' ? 'bg-[#ba1a1a] text-white' : 'bg-[#c8ecc8] text-[#03210b] border border-[#acd0ad]'}`} style = {{width: 'fit-content', padding: '10px'}}
        >
          {toast.type === 'error' ? <AlertTriangle size={24} /> : <CheckCircle size={24} color="#37563b" />}
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
