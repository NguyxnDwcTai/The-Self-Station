import { X } from 'lucide-react';

/**
 * ModalWrapper - HOC dùng chung cho tất cả Modal trong hệ thống.
 * Đảm bảo đồng nhất 100% về: Backdrop blur, bo tròn, shadow, nút X, typography.
 * Usage:
 *   <ModalWrapper isOpen={bool} onClose={fn} title="Tiêu đề" maxWidth="600px">
 *     {children}
 *   </ModalWrapper>
 */
const ModalWrapper = ({ isOpen, onClose, title, children, maxWidth = '520px' }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease-out',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid var(--outline-faint)',
          flexShrink: 0
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'var(--surface-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-soft)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ModalWrapper;
