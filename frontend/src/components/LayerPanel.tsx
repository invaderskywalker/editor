/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react';
import '../styles/ui-panels.css';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

interface Props {
  layers: Layer[];
  designId: string;
  selectedLayerId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (layers: Layer[]) => void;
}

const LayerPanel: React.FC<Props> = ({
  layers,
  designId,
  selectedLayerId,
  onSelect,
  onUpdate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [minimized, setMinimized] = useState(false);
  const socket = useSocket();

  const add = () => {
    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
    };
    const updated = [...layers, newLayer];
    onUpdate(updated);
    socket.current?.emit('layer:add', { designId, layer: newLayer });
  };

  const move = (idx: number, dir: 'up' | 'down') => {
    const copy = [...layers];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= copy.length) return;
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onUpdate(copy);
    socket.current?.emit('layers:reorder', { designId, layers: copy });
  };

  const rename = (layerId: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    const updated = layers.map((l) =>
      l.id === layerId ? { ...l, name: editName } : l
    );
    onUpdate(updated);
    socket.current?.emit('layer:update', {
      designId,
      layerId,
      updates: { name: editName },
    });
    setEditingId(null);
  };

  const toggleVisible = (layerId: string) => {
    const updated = layers.map((l) =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    );
    onUpdate(updated);
    socket.current?.emit('layer:update', {
      designId,
      layerId,
      updates: { visible: !layers.find((l) => l.id === layerId)?.visible },
    });
  };

  const toggleLock = (layerId: string) => {
    const updated = layers.map((l) =>
      l.id === layerId ? { ...l, locked: !l.locked } : l
    );
    onUpdate(updated);
    socket.current?.emit('layer:update', {
      designId,
      layerId,
      updates: { locked: !layers.find((l) => l.id === layerId)?.locked },
    });
  };

  const remove = (layerId: string) => {
    const updated = layers.filter((l) => l.id !== layerId);
    onUpdate(updated);
    socket.current?.emit('layer:delete', { designId, layerId });
  };

  return (
    <div
      className={`ui-panel layer-panel${minimized ? ' minimized' : ''}`}
      aria-label={minimized ? 'Minimized layer panel' : 'Layer panel'}
    >
      <div className="ui-panel-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 className="ui-panel-title">Layers</h3>
        <button
          className="ui-action-btn"
          onClick={() => setMinimized((m) => !m)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {minimized ? (
            <ChevronRight size={20} stroke="#3678fa" />
          ) : (
            <ChevronLeft size={20} stroke="#3678fa" />
          )}
        </button>
      </div>

      {minimized ? null : (
        <>
          <div className="layer-list">
            {layers.map((l, i) => (
              <div
                key={l.id}
                className={`ui-item layer-item ${
                  selectedLayerId === l.id ? 'selected' : ''
                }`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background:
                    selectedLayerId === l.id ? 'rgba(54,120,250,0.1)' : 'transparent',
                  padding: '4px 6px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={() => onSelect(l.id)}
              >
                {editingId === l.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => rename(l.id)}
                    onKeyDown={(e) => e.key === 'Enter' && rename(l.id)}
                    className="ui-input layer-input"
                    autoFocus
                    style={{ flex: 1 }}
                  />
                ) : (
                  <span
                    onDoubleClick={() => {
                      setEditingId(l.id);
                      setEditName(l.name);
                    }}
                    style={{ flex: 1 }}
                  >
                    {l.name}
                  </span>
                )}

                <button
                  className="ui-action-btn"
                  onClick={() => toggleVisible(l.id)}
                  title={l.visible ? 'Hide layer' : 'Show layer'}
                >
                  {l.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  className="ui-action-btn"
                  onClick={() => toggleLock(l.id)}
                  title={l.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  {l.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <button
                  className="ui-action-btn"
                  onClick={() => move(i, 'up')}
                  disabled={i === 0}
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  className="ui-action-btn"
                  onClick={() => move(i, 'down')}
                  disabled={i === layers.length - 1}
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  className="ui-action-btn delete"
                  onClick={() => remove(l.id)}
                  title="Delete layer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={add}
            className="ui-panel-btn"
            style={{ width: '100%', marginTop: 6 }}
          >
            + Add Layer
          </button>
        </>
      )}
    </div>
  );
};

export default LayerPanel;
