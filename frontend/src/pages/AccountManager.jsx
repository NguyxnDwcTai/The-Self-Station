import { useState, useEffect, useMemo } from 'react';
import { Shield, Lock, Unlock, Edit3, UserPlus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../api/api';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import './AdminTheme.css';

const AccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { language, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState(null);

  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    accountID: '',
    username: '',
    passwordHash: '',
    role: 3
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/accounts/me');
      const currentUserData = meRes.data;
      setCurrentUser(currentUserData);

      if (currentUserData && currentUserData.branchID) {
        const res = await api.get(`/accounts?branchID=${currentUserData.branchID}`);
        setAccounts(res.data);
      } else {
        const res = await api.get('/accounts');
        setAccounts(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu accounts:", error);
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

  const handleAddNewClick = () => {
    setIsEditing(false);
    setEditingAccountId(null);
    setFormData({ accountID: '', username: '', passwordHash: '', role: 3 });
    setIsModalOpen(true);
  };

  const handleEditClick = (acc) => {
    setIsEditing(true);
    setEditingAccountId(acc.accountID);
    setFormData({
      accountID: acc.accountID,
      username: acc.username,
      passwordHash: '',
      role: acc.role
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!formData.accountID || !formData.username) {
        alert("Vui lòng điền đủ các trường ID, Username!");
        return;
      }

      if (!isEditing && !formData.passwordHash) {
        alert("Vui lòng nhập mật khẩu cho tài khoản mới!");
        return;
      }

      if (!currentUser || !currentUser.branchID) {
        alert("Lỗi: Hệ thống chưa lấy được thông tin chi nhánh của bạn. Vui lòng F5 tải lại trang!");
        return;
      }

      const payload = {
        ...formData,
        role: parseInt(formData.role),
        branchID: currentUser.branchID
      };

      if (isEditing) {
        await api.put(`/accounts/${editingAccountId}`, payload);
      } else {
        await api.post('/accounts', payload);
      }

      setIsModalOpen(false);
      setFormData({ accountID: '', username: '', passwordHash: '', role: 3 });
      setIsEditing(false);
      setEditingAccountId(null);
      loadData();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Không thể kết nối đến máy chủ hoặc Route chưa được cấu hình.";
      console.error("Chi tiết lỗi:", errorMsg);
      alert("Cập nhật thất bại: " + errorMsg);
    }
  };

  const toggleLock = async (id, currentStatus) => {
    if (currentUser && currentUser.accountID === id) {
      alert(language === 'vi' ? "Bạn không thể khóa tài khoản đang đăng nhập!" : "You cannot lock the currently logged-in account!");
      return;
    }

    if (window.confirm(`Bạn có chắc muốn ${currentStatus ? 'KHOÁ' : 'MỞ KHOÁ'} tài khoản này?`)) {
      try {
        await api.put(`/accounts/${id}/lock`, { isActive: !currentStatus });
        loadData();
      } catch (error) {
        alert("Lỗi khi thay đổi trạng thái!");
      }
    }
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 1: return { bg: 'var(--dashboard-primary)', color: '#fff', label: t.accRoleManager };
      case 2: return { bg: 'var(--dashboard-surface-hover)', color: 'var(--dashboard-text-main)', label: t.accRoleCashier };
      case 3: return { bg: '#f4f1e7', color: 'var(--dashboard-text-muted)', label: t.accRoleChef };
      default: return { bg: '#eee', color: '#333', label: 'Khác' };
    }
  };

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const filteredAccounts = useMemo(() => {
    return safeAccounts.filter(acc => {
      if (roleFilter !== '' && acc.role.toString() !== roleFilter) return false;
      if (statusFilter !== '') {
        const wantActive = statusFilter === 'ACTIVE';
        if (acc.isActive !== wantActive) return false;
      }
      return true;
    });
  }, [safeAccounts, roleFilter, statusFilter]);

  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalItems, currentPage, totalPages]);

  const currentAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  const totalActiveStaff = safeAccounts.filter(acc => acc.isActive).length;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{t.accTitle || "Quản lý Nhân sự"}</h1>
        <button className="action-btn" onClick={handleAddNewClick} style={{ backgroundColor: 'var(--dashboard-primary)', color: 'white', borderColor: 'var(--dashboard-primary)' }}>
          <UserPlus size={18} color='white' /> {t.accCreateBtn || "Tạo tài khoản"}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--dashboard-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{t.accFilterRoleLabel || "Phân quyền"}</div>
            <CustomDropdown
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder={t.accFilterAllRoles || "Tất cả vai trò"}
              options={[
                { label: t.accRoleManager || "Quản lý", value: '1' },
                { label: t.accRoleCashier || "Thu ngân", value: '2' },
                { label: t.accRoleChef || "Bếp", value: '3' }
              ]}
            />
          </div>

          <div style={{ minWidth: '200px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--dashboard-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{t.accFilterStatusLabel || "Trạng thái"}</div>
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={t.accFilterAllStatus || "Tất cả trạng thái"}
              options={[
                { label: t.accStatusActive || "Đang hoạt động", value: 'ACTIVE' },
                { label: t.accStatusLocked || "Đã khóa", value: 'INACTIVE' }
              ]}
            />
          </div>
        </div>

        <div style={{ padding: '0.5rem 0' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--dashboard-text-muted)', fontWeight: '500' }}>{t.accSummaryTotal || "Tổng cộng:"} <strong style={{ color: 'var(--dashboard-text-main)', fontSize: '1rem' }}>{totalActiveStaff}</strong> {t.accSummaryBranch || "nhân sự đang hoạt động"}</span>
        </div>
      </div>

      <div className="dashboard-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="full-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--dashboard-surface-hover)' }}>
                <th style={{ width: '25%' }}>{t.accColAccount || "Tài khoản"}</th>
                <th style={{ width: '20%' }}>{t.accColRole || "Vai trò"}</th>
                <th style={{ width: '25%' }}>{t.accColSign || "Đăng nhập"}</th>
                <th style={{ width: '15%' }}>{t.accColStatus || "Trạng thái"}</th>
                <th style={{ textAlign: 'center', width: '15%' }}>{t.accColAction || "Thao tác"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--dashboard-text-muted)' }}>...</td></tr> :
                currentAccounts.length === 0 ? <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--dashboard-text-muted)' }}>Trống</td></tr> :
                  currentAccounts.map((acc, idx) => {
                    const rStyle = getRoleStyle(acc.role);
                    const isCurrentUser = currentUser && currentUser.accountID === acc.accountID;

                    let badgeClass = 'status-badge ';
                    let badgeLabel = '';
                    if (acc.isActive) {
                      badgeClass += 'badge-success';
                      badgeLabel = t.accStatusActive || 'Đang hoạt động';
                    } else {
                      badgeClass += 'badge-danger';
                      badgeLabel = t.accStatusLocked || 'Đã khóa';
                    }

                    return (
                      <tr key={acc.accountID} style={{ opacity: acc.isActive ? 1 : 0.65 }}>
                        <td style={{ fontWeight: '600' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--dashboard-surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                              <Shield size={18} color={acc.role === 1 ? "var(--dashboard-primary)" : "var(--dashboard-text-muted)"} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {acc.username}
                                {isCurrentUser && <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--dashboard-primary-light)', color: 'var(--dashboard-primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>YOU</span>}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--dashboard-text-muted)', fontWeight: '500', marginTop: '2px' }}>{acc.accountID}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ backgroundColor: rStyle.bg, color: rStyle.color, padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                            {rStyle.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ backgroundColor: 'var(--dashboard-surface-hover)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--dashboard-text-muted)', fontFamily: 'monospace', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {acc.passwordHash ? '••••••••' : 'Chưa thiết lập'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={badgeClass}>{badgeLabel}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                            <button onClick={() => handleEditClick(acc)} title="Sửa thông tin / Quyền" style={{ color: 'var(--dashboard-text-muted)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Edit3 size={18} /></button>
                            {!isCurrentUser && (
                              acc.isActive
                                ? <button onClick={() => toggleLock(acc.accountID, acc.isActive)} title="Vô Hiệu Hóa" style={{ color: 'var(--dashboard-danger-text)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Lock size={18} /></button>
                                : <button onClick={() => toggleLock(acc.accountID, acc.isActive)} title="Khôi Phục" style={{ color: 'var(--dashboard-primary)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Unlock size={18} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderTop: '1px solid var(--dashboard-border)', backgroundColor: '#fff' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--dashboard-text-muted)', fontWeight: '500' }}>
            {t.accPaginationDisplay} {startIdx}-{endIdx} {t.accPaginationOf} {totalItems} {t.accPaginationResults}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px',
                border: '1px solid var(--dashboard-border)', backgroundColor: currentPage === 1 ? 'var(--dashboard-surface-hover)' : '#fff',
                color: currentPage === 1 ? '#ccc' : 'var(--dashboard-text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px',
                border: '1px solid var(--dashboard-border)', backgroundColor: currentPage === totalPages || totalPages === 0 ? 'var(--dashboard-surface-hover)' : '#fff',
                color: currentPage === totalPages || totalPages === 0 ? '#ccc' : 'var(--dashboard-text-main)', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer: Thêm/Sửa Tài Khoản */}
      <div className={`drawer-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="drawer-title">{isEditing ? (language === 'vi' ? "Cập Nhật Tài Khoản" : "Update Account") : "Tạo tài khoản nhân sự"}</h2>
            <button className="drawer-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="drawer-body">
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Mã Định Danh (accountID)</label>
                  <input type="text" name="accountID" value={formData.accountID} onChange={handleInputChange} disabled={isEditing} placeholder="VD: ACC_NV05" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none', backgroundColor: isEditing ? 'var(--dashboard-surface-hover)' : '#fff' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Phân Quyền (Role Level)</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none', backgroundColor: '#fff' }}>
                    <option value={1}>MANAGER - {t.accRoleManager || 'Quản lý'}</option>
                    <option value={2}>CASHIER - {t.accRoleCashier || 'Thu ngân'}</option>
                    <option value={3}>CHEF - {t.accRoleChef || 'Bếp'}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Tên Đăng Nhập (Username)</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="VD: tuan_staff" required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dashboard-text-muted)' }}>Mật Khẩu</label>
                  <input type="password" name="passwordHash" value={formData.passwordHash} onChange={handleInputChange} placeholder={isEditing ? "Bỏ trống nếu không đổi" : "Nhập mật khẩu an toàn"} required={!isEditing} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--dashboard-border)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="action-btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--dashboard-border)', color: 'var(--dashboard-text-muted)' }}>
                  {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button type="submit" className="action-btn" style={{ backgroundColor: 'var(--dashboard-primary)', color: 'white', border: 'none' }}>
                  {isEditing ? (language === 'vi' ? "Cập Nhật" : "Update") : (language === 'vi' ? "Tạo Tài Khoản" : "Create Account")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;