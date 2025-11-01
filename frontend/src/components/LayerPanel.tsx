// src/components/LayerPanel.tsx
import React, { useState } from 'react';
import { updateDesign, deleteLayer } from '../api/api';
import { useSocket } from '../hooks/useSocket';

interface Layer {
  _id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

interface Props {
  layers: Layer[];
  designId: string;
  onAddLayer: (layer: { name: string; visible: boolean; locked: boolean }) => void;
}

const SOCKET_URL = 'http://localhost:5001';

const LayerPanel: React.FC<Props> = ({ layers, designId, onAddLayer }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const socket = useSocket(SOCKET_URL);

  const moveLayer = async (index: number, direction: 'up' | 'down') => {
    const newLayers = [...layers];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newLayers.length) return;

    [newLayers[index], newLayers[target]] = [newLayers[target], newLayers[index]];
    await updateDesign(designId, { layers: newLayers });
    // Notify others
    socket.current?.emit('layers:reordered', { designId, layers: newLayers });
  };

  const startRename = (layer: Layer) => {
    setEditingId(layer._id);
    setEditName(layer.name);
  };

  const saveRename = async (layerId: string) => {
    const newLayers = layers.map(l =>
      l._id === layerId ? { ...l, name: editName } : l
    );
    await updateDesign(designId, { layers: newLayers });
    setEditingId(null);
    // Notify others
    socket.current?.emit('layer:updated', { designId, layers: newLayers });
  };

  const removeLayer = async (layerId: string) => {
    await deleteLayer(designId, layerId);
    // Notify others
    socket.current?.emit('layer:deleted', { designId, layerId });
  };

  return (
    <div className="w-64 bg-white border-r p-4 overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Layers</h3>

      <div className="space-y-1">
        {layers.map((layer, idx) => (
          <div
            key={layer._id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm group"
          >
            {editingId === layer._id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => saveRename(layer._id)}
                onKeyDown={(e) => e.key === 'Enter' && saveRename(layer._id)}
                className="flex-1 px-1 text-sm"
                autoFocus
              />
            ) : (
              <span
                onDoubleClick={() => startRename(layer)}
                className="flex-1 cursor-text"
              >
                {layer.name}
              </span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => moveLayer(idx, 'up')}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Up
              </button>
              <button
                onClick={() => moveLayer(idx, 'down')}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Down
              </button>
              <button
                onClick={() => removeLayer(layer._id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          onAddLayer({
            name: `Layer ${layers.length + 1}`,
            visible: true,
            locked: false,
          })
        }
        className="mt-4 w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        + Add Layer
      </button>
    </div>
  );
};

export default LayerPanel;
