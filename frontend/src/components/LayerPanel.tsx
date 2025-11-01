import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import '../../styles/ui-panels.css';

interface Layer { _id: string; name: string; visible: boolean; locked: boolean; }
interface Props {
  layers: Layer[];
  designId: string;
}

const LayerPanel: React.FC<Props> = ({ layers, designId }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const socket = useSocket();

  const add = () => socket.current?.emit('layer:add', {
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
    const newLayers = layers.map(l => l._id === layerId ? { ...l, name: editName } : l);
    socket.current?.emit('layer:update', { designId, layerId, updates: { name: editName } });
    setEditingId(null);
  };

  const remove = (layerId: string) => {
    socket.current?.emit('layer:delete', { designId, layerId });
  };

  return (
    <div className="ui-panel layer-panel">
      <h3 className="ui-panel-title">Layers</h3>
      {layers.map((l, i) => (
        <div key={l._id} className="ui-item layer-item">
          {editingId === l._id ? (
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={() => rename(l._id)}
              onKeyDown={e => e.key === 'Enter' && rename(l._id)}
              className="ui-input layer-input"
              autoFocus
            />
          ) : (
            <span onDoubleClick={() => { setEditingId(l._id); setEditName(l.name); }} className="layer-name">
              {l.name}
            </span>
          )}
          <div className="layer-actions">
            <button onClick={() => move(i, 'up')} className="ui-action-btn">Up</button>
            <button onClick={() => move(i, 'down')} className="ui-action-btn">Down</button>
            <button onClick={() => remove(l._id)} className="ui-action-btn delete">X</button>
          </div>
        </div>
      ))}
      <button onClick={add} className="ui-panel-btn">
        + Add Layer
      </button>
    </div>
  );
};

export default LayerPanel;
