import React from 'react';
import Modal from '../Shared/Modal';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading, title = 'Delete Item', message = 'Are you sure you want to delete this item? This action cannot be undone.' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>
        {message}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button className="btn" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button 
          className="btn" 
          style={{ background: 'var(--error-color)', color: 'white' }} 
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
