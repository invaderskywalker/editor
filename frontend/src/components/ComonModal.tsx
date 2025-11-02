import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const CommonModal: React.FC<Props> = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          width: '80%',
          maxWidth: 900,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          padding: 20,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            border: 'none',
            background: 'transparent',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        {title && (
          <h2 style={{ margin: '0 0 16px 0', color: '#2a3692' }}>{title}</h2>
        )}

        {children}
      </div>
    </div>
  );
};

export default CommonModal;
