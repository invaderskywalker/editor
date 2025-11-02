/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { getAllDesigns, createDesign } from '../api/api';
import CommonModal from './ComonModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DesignListModal: React.FC<Props> = ({ open, onClose }) => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAllDesigns()
      .then(setDesigns)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  const handleOpenDesign = (id: string) => {
    onClose();
    window.location.href = `/?id=${id}`;
  };

  const handleNewDesign = async () => {
    const newDesign = await createDesign('Untitled');
    handleOpenDesign(newDesign._id);
  };

  return (
    <CommonModal open={open} onClose={onClose} title="🗂️ Your Designs">
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleNewDesign} className="ui-panel-btn">
          + New Design
        </button>
      </div>

      {loading && <p>Loading designs...</p>}

      {!loading && designs.length === 0 && (
        <p style={{ color: '#666' }}>No designs found.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {designs.map((d) => (
          <div
            key={d._id}
            onClick={() => handleOpenDesign(d._id)}
            className="ui-item"
            style={{
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: 8,
              background: '#fafafa',
              padding: 10,
              transition: 'transform 0.1s ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = 'scale(1.02)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = 'scale(1)')
            }
          >
            <img
              src={
                d.thumbnail || 'https://placehold.co/300x200?text=No+Preview'
              }
              alt={d.title}
              style={{
                width: '100%',
                borderRadius: 6,
                marginBottom: 8,
                height: 120,
                objectFit: 'cover',
              }}
            />
            <h4
              style={{
                margin: '0 0 4px 0',
                color: '#2a3692',
                fontSize: 15,
              }}
            >
              {d.title} ({d?._id})
            </h4>
            <p style={{ fontSize: 12, color: '#777' }}>
              Updated {new Date(d.updatedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </CommonModal>
  );
};

export default DesignListModal;
