import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

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
    <div className="w-64 bg-white border-r p-4 overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Layers</h3>

      {layers.map((l, i) => (
        <div key={l._id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm group">
          {editingId === l._id ? (
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={() => rename(l._id)}
              onKeyDown={e => e.key === 'Enter' && rename(l._id)}
              className="flex-1 px-1"
              autoFocus
            />
          ) : (
            <span onDoubleClick={() => { setEditingId(l._id); setEditName(l.name); }} className="flex-1 cursor-text">
              {l.name}
            </span>
          )}

          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
            <button onClick={() => move(i, 'up')} className="text-xs">Up</button>
            <button onClick={() => move(i, 'down')} className="text-xs">Down</button>
            <button onClick={() => remove(l._id)} className="text-xs text-red-600">X</button>
          </div>
        </div>
      ))}

      <button onClick={add} className="mt-4 w-full px-3 py-1.5 bg-blue-600 text-white rounded">
        + Add Layer
      </button>
    </div>
  );
};

export default LayerPanel;