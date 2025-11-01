import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';

// Custom Tooltip positioned BELOW the element
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            top: '120%', // 👈 show below
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#222',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 4,
            fontSize: 13,
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
};

const ActiveUserBar: React.FC = () => {
  const { activeUsers, user } = useUser();

  if (!activeUsers.length) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.35rem',
        alignItems: 'center',
        marginLeft: 'auto',
        paddingRight: '10px',
      }}
    >
      {activeUsers.map((u) => {
        const isMe = u._id === user?._id;
        const tooltipText = u.name + (isMe ? ' (You)' : '');
        return (
          <Tooltip key={u._id || u.id || u.email} content={tooltipText}>
            <div
              tabIndex={0}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: isMe ? '#22d47e' : '#2668d7',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                textTransform: 'uppercase',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {u.name?.charAt(0) || '?'}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default ActiveUserBar;
