import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, maxWidth }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: maxWidth || '1000px' }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
