import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import CustomDropdown from '../components/ui/CustomDropdown';

const API_BASE_URL = 'http://localhost:5000/api';

const KDSMenu = ({ showToast }) => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/menu/categories`),
        axios.get(`${API_BASE_URL}/menu`)
      ]);
      setCategories(catsRes.data);
      setMenuItems(itemsRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thực đơn:", error);
      showToast('Không thể tải thực đơn. Vui lòng thử lại!', 'error');
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = !item.isActive;
    
    // Optimistic UI update
    setMenuItems(prev => prev.map(m => 
      m.itemID === item.itemID ? { ...m, isActive: newStatus } : m
    ));

    try {
      await axios.put(`${API_BASE_URL}/menu/${item.itemID}`, {
        isActive: newStatus
      });
      showToast('Cập nhật trạng thái thành công', 'success');
    } catch (error) {
      // Rollback
      setMenuItems(prev => prev.map(m => 
        m.itemID === item.itemID ? { ...m, isActive: item.isActive } : m
      ));
      showToast('Lỗi khi cập nhật trạng thái món ăn', 'error');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.categoryID === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.categoryID]) {
      acc[item.categoryID] = {
        categoryInfo: categories.find(c => c.categoryID === item.categoryID) || { categoryName: 'Khác' },
        items: []
      };
    }
    acc[item.categoryID].items.push(item);
    return acc;
  }, {});

  const categoryOptions = categories.map(cat => ({
    value: cat.categoryID,
    label: cat.categoryName
  }));

  return (
    <div className="w-full font-['Inter']">
      <style>{`
        /* Custom Toggle Switch Styles */
        .toggle-checkbox:checked {
            right: 0;
            border-color: #4f6f52;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #4f6f52;
        }
        .toggle-checkbox:checked + .toggle-label:after {
            transform: translateX(100%);
            border-color: white;
        }
        .toggle-label:after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background-color: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }
      `}</style>
      
      {/* Search & Filter Controls */}
      <div className="flex sm:flex-row justify-between items-center gap-4 py-4" style = {{marginTop: '5px'}}>
          <div className="w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737971]" size={20} />
              <input 
                className="w-full h-10 bg-[#ffffff] border border-[#c2c8bf] rounded-[8px] pl-10 pr-4 text-[16px] leading-[20px] font-[400] text-[#1b1c1c] focus:outline-none focus:ring-2 focus:ring-[#4f6f52] focus:border-transparent shadow-sm" style={{ paddingLeft: '48px', marginLeft: '2px' }}
                placeholder="Tìm kiếm món ăn..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        <div className="flex items-center gap-4 shrink-0 w-48" style={{marginRight: '5px'}}>
           <CustomDropdown 
              options={categoryOptions} 
              value={selectedCategory} 
              onChange={setSelectedCategory} 
              placeholder="Danh mục" 
           />
        </div>
      </div>

      {/* Menu Content Canvas */}
      <div className="space-y-12 pb-12">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center text-stone-400 py-12">Không tìm thấy món ăn nào</div>
        ) : (
          Object.values(groupedItems)
            .sort((a, b) => (a.categoryInfo?.sortOrder || 0) - (b.categoryInfo?.sortOrder || 0))
            .map((group, idx) => (
            <section key={idx}>
              <div className="sticky top-0 z-20 bg-[#c8ecc8]/80 backdrop-blur-md rounded-[8px] p-4 mb-10 shadow-sm flex items-center justify-between border border-[#acd0ad]/30" style = {{marginTop: '25px', marginBottom: '25px' ,padding: '10px'}}>
                <h2 className="text-[24px] leading-[36px] tracking-[-0.02em] font-[800] text-[#03210b]">{group.categoryInfo.categoryName}</h2>
                <span className="text-[12px] leading-[16px] tracking-[0.05em] font-[600] text-[#2f4e33] bg-[#ffffff] px-3 py-1 rounded-full shadow-sm" style = {{padding: '5px', marginRight: '10px'}}>{group.items.length} items</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {group.items.map(item => (
                  <div key={item.itemID} className={`bg-[#ffffff] rounded-[8px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] border border-[#c2c8bf]/30 flex flex-col gap-4 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300 ${!item.isActive ? 'opacity-75 grayscale-[0.2]' : ''}`}>
                    <div className="w-full h-80 rounded-[8px] overflow-hidden bg-[#efeded] relative">
                      {!item.isActive && (
                        <div className="absolute inset-0 bg-[#e4e2e2]/50 z-10 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="bg-[#ffffff] px-3 py-1 rounded-full text-[12px] leading-[16px] tracking-[0.05em] font-[600] text-[#1b1c1c] shadow-sm" style={{padding: '10px'}}>Hết hàng</span>
                        </div>
                      )}
                      <img 
                        alt={item.itemName} 
                        className="w-full h-full object-cover" 
                        src={
                          !item.imageURL
                            ? '/img/foodimg.jpg'
                            : item.imageURL.startsWith('http')
                              ? item.imageURL
                              : item.imageURL.startsWith('/')
                                ? item.imageURL
                                : `/img/${item.imageURL}`
                        }
                        onError={(e) => { e.target.src = '/img/foodimg.jpg' }}  
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[20px] leading-[24px] font-[600] text-[#1b1c1c] mb-1" style = {{marginLeft: '10px', marginBottom: '10px'}}>{item.itemName}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#e4e2e2]">
                      <span className="text-[22px] leading-[28px] font-[600] text-[#1b1c1c]" style={{marginLeft: '10px', paddingTop: '10px', paddingBottom: '10px'}}>{Number(item.price).toLocaleString()} VNĐ</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] leading-[16px] tracking-[0.05em] font-[600] text-[#424841] uppercase">{item.isActive ? 'Còn hàng' : 'Hết hàng'}</span>
                        <label 
  htmlFor={`toggle-${item.itemID}`} 
  className="relative inline-flex items-center cursor-pointer" 
  style={{ marginRight: '10px' }}
>
  {/* Thẻ input được ẩn đi nhưng dùng class 'peer' để truyền trạng thái */}
  <input 
    id={`toggle-${item.itemID}`} 
    type="checkbox" 
    className="sr-only peer" 
    checked={item.isActive}
    onChange={() => handleToggleStatus(item)}
  />
  
  {/* Giao diện nút toggle */}
  <div className="w-12 h-6 bg-[#e4e2e2] rounded-full peer 
                  peer-checked:bg-[#4F6F52] 
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                  after:bg-white after:rounded-full after:h-5 after:w-5 
                  after:transition-all after:duration-300 
                  peer-checked:after:translate-x-6 shadow-inner">
  </div>
</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default KDSMenu;