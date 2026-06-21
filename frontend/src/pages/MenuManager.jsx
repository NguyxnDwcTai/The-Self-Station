import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import api from '../api/api';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import './AdminTheme.css';

const MenuManager = () => {
  const { language, t } = useLanguage();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // States cho tính năng Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    itemID: '',
    itemName: '',
    categoryID: '',
    price: '',
    imageURL: '',
    isActive: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        api.get('/menu'),
        api.get('/menu/categories')
      ]);
      setItems(menuRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    categoryID: '',
    categoryName: '',
    description: '',
    sortOrder: ''
  });

  const handleAddNewClick = () => {
    setIsEditing(false);
    setEditingItemId(null);
    setFormData({ itemID: '', itemName: '', categoryID: '', price: '', imageURL: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleAddCategoryClick = () => {
    setCategoryFormData({ categoryID: '', categoryName: '', description: '', sortOrder: '' });
    setIsCategoryModalOpen(true);
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (!categoryFormData.categoryID || !categoryFormData.categoryName) {
         alert("Vui lòng nhập Mã danh mục và Tên danh mục!");
         return;
      }
      await api.post('/menu/categories', categoryFormData);
      setIsCategoryModalOpen(false);
      setCategoryFormData({ categoryID: '', categoryName: '', description: '', sortOrder: '' });
      loadData();
    } catch (error) {
      alert("Lỗi khi lưu danh mục mới. Mã danh mục có thể đã tồn tại.");
    }
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setEditingItemId(item.itemID);
    setFormData({
      itemID: item.itemID,
      itemName: item.itemName,
      categoryID: item.categoryID,
      price: item.price,
      imageURL: item.imageURL || '',
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if(!formData.itemID || !formData.itemName || !formData.categoryID || !formData.price) {
         alert("Vui lòng nhập đầy đủ Mã món, Tên món, Phân loại và Giá!");
         return;
      }
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (isEditing) {
        await api.put(`/menu/${editingItemId}`, payload);
      } else {
        await api.post('/menu', payload);
      }
      
      setIsModalOpen(false);
      setFormData({ itemID: '', itemName: '', categoryID: '', price: '', imageURL: '', isActive: true });
      setIsEditing(false);
      setEditingItemId(null);
      loadData();
    } catch (error) {
      if (isEditing) {
        alert("Lỗi khi cập nhật thông tin món ăn.");
      } else {
        alert("Lỗi khi lưu món mới. Có thể Mã món (itemID) đã tồn tại.");
      }
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm(`Bạn có chắc chắn muốn xóa món ${id} không?`)) {
      try {
        await api.delete(`/menu/${id}`);
        loadData();
      } catch (error) {
        alert("Thất bại khi xóa. Món này có thể đã được lưu trong Hóa đơn.");
      }
    }
  };

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = useMemo(() => {
    return safeItems.filter(item => {
      const matchSearch = (item.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.itemID || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (categoryFilter !== '' && item.categoryID !== categoryFilter) return false;
      if (statusFilter !== '') {
         const isActiveReq = statusFilter === 'ACTIVE';
         if(item.isActive !== isActiveReq) return false;
      }
      return true;
    });
  }, [safeItems, searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{t.menuMgmtTitle || "Quản lý Thực đơn"}</h1>
      </div>
 
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
         <div style={{ flex: 1, minWidth: '200px' }}>
            <CustomDropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder={t.menuFilterCategory || "Lọc theo Danh mục"}
              options={categories.map(c => ({ label: c.categoryName, value: c.categoryID }))}
            />
         </div>
         <div style={{ flex: 1, minWidth: '150px' }}>
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={t.menuFilterStatus || "Lọc theo Trạng thái"}
              options={[
                { label: language === 'vi' ? 'Đang phục vụ' : 'Serving', value: 'ACTIVE' },
                { label: language === 'vi' ? 'Ngừng bán'   : 'Inactive', value: 'INACTIVE' }
              ]}
            />
         </div>
         <div style={{ flex: 2, minWidth: '250px' }}>
            <div style={{ position: 'relative', height: '44px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dashboard-text-muted)' }} />
              <input
                type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                placeholder={t.menuSearch || "Tìm kiếm món..."}
                style={{ width: '100%', height: '100%', padding: '0 10px 0 36px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface)', outline: 'none', color: 'var(--dashboard-text-main)' }}
              />
            </div>
         </div>
      </div>
 
      {/* Action Buttons */}
      <div className="action-strip">
         <button className="action-btn" onClick={handleAddNewClick} style={{ backgroundColor: 'var(--dashboard-primary)', color: 'white', borderColor: 'var(--dashboard-primary)' }}>
            <Plus size={18} color="white" /> {t.menuAddBtn || 'Thêm Món Mới'}
         </button>
         <button className="action-btn" onClick={handleAddCategoryClick}>
            <Plus size={18} /> {language === 'vi' ? 'Thêm Danh Mục' : 'Add Category'}
         </button>
      </div>
 
      <div className="dashboard-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxWidth: '100vw' }}>
          <table className="full-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--dashboard-surface-hover)' }}>
                <th>{t.menuColItem || "Món ăn"}</th>
                <th>{t.menuColCode || "Mã món"}</th>
                <th>{t.menuColCategory || "Danh mục"}</th>
                <th>{t.menuColPrice || "Giá bán"}</th>
                <th>{t.menuColStatus || "Trạng thái"}</th>
                <th style={{ textAlign: 'center' }}>{t.menuColAction || "Thao tác"}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan="6" style={{padding: '2rem', textAlign: 'center', color: 'var(--dashboard-text-muted)'}}>
                    {language === 'vi' ? 'Đang tải Menu...' : 'Loading menu...'}
                  </td></tr>
                : filteredItems.length === 0
                ? <tr><td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: 'var(--dashboard-text-muted)'}}>
                    {language === 'vi' ? 'Không tìm thấy món ăn nào khớp với lựa chọn.' : 'No items match your selection.'}
                  </td></tr>
                : filteredItems.map((item, idx) => {
                 let badgeClass = 'status-badge ';
                 let badgeLabel = '';
                 if (item.isActive) {
                   badgeClass += 'badge-success';
                   badgeLabel = language === 'vi' ? 'Đang phục vụ' : 'Serving';
                 } else {
                   badgeClass += 'badge-danger'; // or a muted badge
                   badgeLabel = language === 'vi' ? 'Ngừng bán' : 'Inactive';
                 }

                 return (
                  <tr key={item.itemID}>
                    <td style={{ fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--dashboard-surface-hover)', borderRadius: '8px', overflow: 'hidden' }}>
                           {item.imageURL ? <img src={item.imageURL} alt={item.itemName} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : null}
                         </div>
                         <span style={{ fontSize: '0.95rem', color: 'var(--dashboard-text-main)' }}>{item.itemName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--dashboard-text-muted)', fontWeight: '600' }}>
                       <div style={{ backgroundColor: 'var(--dashboard-surface-hover)', display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {item.itemID}
                       </div>
                    </td>
                    <td style={{ color: 'var(--dashboard-text-main)', fontWeight: '500' }}>{item.category?.categoryName || item.categoryID}</td>
                    <td style={{ fontWeight: '700', color: 'var(--dashboard-primary)' }}>{parseFloat(item.price||0).toLocaleString('vi-VN')} ₫</td>
                    <td>
                       <span className={badgeClass} style={{ padding: '6px 12px' }}>
                        {badgeLabel}
                       </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                          <button onClick={() => handleEditClick(item)} style={{ color: 'var(--dashboard-text-muted)', cursor: 'pointer', border: 'none', background: 'none' }} title="Chỉnh sửa"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(item.itemID)} style={{ color: 'var(--dashboard-danger-text)', cursor: 'pointer', border: 'none', background: 'none' }} title="Xóa"><Trash2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                 )
              })}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* Drawer: Thêm/Sửa Món */}
      <div className={`drawer-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="drawer-title">{isEditing ? (language === 'vi' ? 'Cập Nhật Món Ăn' : 'Update Item') : (t.menuAddBtn || "Khởi Tạo Món Mới")}</h2>
            <button className="drawer-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="drawer-body">
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Mã Món (itemID)</label>
                  <input type="text" name="itemID" value={formData.itemID} onChange={handleInputChange} placeholder="VD: M01" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>{language === 'vi' ? 'Danh mục phân loại' : 'Category'}</label>
                  <select name="categoryID" value={formData.categoryID} onChange={handleInputChange} required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none', backgroundColor: '#fff' }}>
                    <option value="">{language === 'vi' ? '-- Chọn Phân Loại --' : '-- Select Category --'}</option>
                    {categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>{language === 'vi' ? 'Tên Món Ăn' : 'Item Name'}</label>
                  <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} placeholder={language === 'vi' ? 'VD: Trà Đào Cam Sả' : 'E.g: Peach Tea'} required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>{language === 'vi' ? 'Đơn Giá (VNĐ)' : 'Price (VND)'}</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="55000" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>{language === 'vi' ? 'Đường dẫn Hình ảnh' : 'Image URL'}</label>
                <input type="text" name="imageURL" value={formData.imageURL} onChange={handleInputChange} placeholder="https://..." style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                {formData.imageURL && (
                  <div style={{ marginTop: '12px', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--dashboard-border)' }}>
                     <img src={formData.imageURL} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} id="activeCheck" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label htmlFor="activeCheck" style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, cursor: 'pointer', color: 'var(--dashboard-text-main)' }}>
                    {language === 'vi' ? 'Đang phục vụ' : 'Serving'}
                  </label>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="action-btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text-muted)' }}>
                    {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                 </button>
                 <button type="submit" className="action-btn" style={{ backgroundColor: 'var(--dashboard-primary)', color: 'white', border: 'none' }}>
                    {isEditing ? (language === 'vi' ? 'Cập Nhật' : 'Update') : (language === 'vi' ? 'Khởi Tạo' : 'Create')}
                 </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Drawer: Thêm Danh Mục Mới */}
      <div className={`drawer-overlay ${isCategoryModalOpen ? 'open' : ''}`} onClick={() => setIsCategoryModalOpen(false)}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="drawer-title">{language === 'vi' ? 'Thêm Danh Mục Mới' : 'Add New Category'}</h2>
            <button className="drawer-close" onClick={() => setIsCategoryModalOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="drawer-body">
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Mã Danh Mục</label>
                  <input type="text" name="categoryID" value={categoryFormData.categoryID} onChange={handleCategoryInputChange} placeholder="VD: CAT_NEW" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>{language === 'vi' ? 'Tên Danh Mục' : 'Category Name'}</label>
                  <input type="text" name="categoryName" value={categoryFormData.categoryName} onChange={handleCategoryInputChange} placeholder={language === 'vi' ? 'VD: Topping' : 'E.g: Topping'} required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>{language === 'vi' ? 'Mô tả' : 'Description'}</label>
                  <input type="text" name="description" value={categoryFormData.description} onChange={handleCategoryInputChange} placeholder={language === 'vi' ? 'Tuỳ chọn' : 'Optional'} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Thứ tự hiển thị</label>
                  <input type="number" name="sortOrder" value={categoryFormData.sortOrder} onChange={handleCategoryInputChange} placeholder="VD: 8" style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                 <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="action-btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text-muted)' }}>
                    {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                 </button>
                 <button type="submit" className="action-btn" style={{ backgroundColor: 'var(--dashboard-primary)', color: 'white', border: 'none' }}>
                    {language === 'vi' ? 'Khởi Tạo' : 'Create'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MenuManager;