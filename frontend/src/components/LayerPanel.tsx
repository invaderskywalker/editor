import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import '../styles/ui-panels.css';

interface Layer { _id: string; name: string; visible: boolean; locked: boolean; }
interface Props {
  layers: Layer[];
  designId: string;
}

const LayerPanel: React.FC<Props> = ({ layers, designId }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [minimized, setMinimized] = useState(false);
  const socket = useSocket();

  const add = () =>
    socket.current?.emit('layer:add', {
      designId,
      layer: { name: `Layer ${layers.length + 1}`, visible: true, locked: false },
    });

  const move = (idx: number, dir: 'up' | 'down') => {
    const copy = [...layers];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= copy.length) return;
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    socket.current?.emit('layers:reorder', { designId, layers: copy });
  };

  const rename = (layerId: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    socket.current?.emit('layer:update', { designId, layerId, updates: { name: editName } });
    setEditingId(null);
  };

  const remove = (layerId: string) => {
    socket.current?.emit('layer:delete', { designId, layerId });
  };

  // Allow hiding content in minimized state for accessibility (no tab stops inside)
  return (
    <div
      className={"ui-panel layer-panel" + (minimized ? " minimized" : "")}
      aria-label={minimized ? 'Minimized layer panel' : 'Layer panel'}
      tabIndex={-1}
    >
      {/* Panel Header with minimizer */}
      <div className="ui-panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: minimized ? 0 : 8, paddingBottom: '16px' }}>
        <h3 className="ui-panel-title" style={{ margin: 0 }}>Layers</h3>
        <div
          className="layer-panel-toggle"
          aria-label={minimized ? 'Expand Layer Panel' : 'Minimize Layer Panel'}
          role="button"
          tabIndex={0}
          onClick={() => setMinimized(m => !m)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setMinimized(m => !m); }}
          style={{ marginLeft: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', border: 'none', background: 'none', padding: 2 }}
        >
          {!minimized ? (
            <ChevronLeft size={22} stroke="#3678fa" aria-hidden="true" />
          ) : (
            <ChevronRight size={22} stroke="#3678fa" aria-hidden="true" />
          )}
        </div>
      </div>
      {/* Content hidden when minimized */}
      {minimized ? null : (
        <>
          <div className="layer-list">
            {layers.map((l, i) => (
              <div key={l._id} className="ui-item layer-item" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {editingId === l._id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => rename(l._id)}
                    onKeyDown={e => e.key === 'Enter' && rename(l._id)}
                    className="ui-input layer-input"
                    autoFocus
                    aria-label="Edit layer name"
                    style={{ flex: 1, minWidth: 0 }}
                  />
                ) : (
                  <span
                    onDoubleClick={() => { setEditingId(l._id); setEditName(l.name); }}
                    className="layer-name"
                    tabIndex={0}
                    style={{ flex: 1, minWidth: 0, outline: 'none' }}
                    aria-label={`Layer name: ${l.name}. Double click to rename.`}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { setEditingId(l._id); setEditName(l.name); }
                    }}
                  >
                    {l.name}
                  </span>
                )}
                <div className="layer-actions" style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => move(i, 'up')}
                    className="ui-action-btn"
                    aria-label="Move layer up"
                    disabled={i === 0}
                    tabIndex={0}
                    type="button"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    onClick={() => move(i, 'down')}
                    className="ui-action-btn"
                    aria-label="Move layer down"
                    disabled={i === layers.length - 1}
                    tabIndex={0}
                    type="button"
                  >
                    <ChevronDown size={18} />
                  </button>
                  <button
                    onClick={() => remove(l._id)}
                    className="ui-action-btn delete"
                    aria-label="Delete layer"
                    tabIndex={0}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={add}
            className="ui-panel-btn"
            aria-label="Add new layer"
            type="button"
            style={{ width: '100%', marginTop: 6, minWidth: 0 }}
          >
            + Add Layer
          </button>
        </>
      )}
    </div>
  );
};

export default LayerPanel;
