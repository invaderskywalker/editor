// src/components/LayerPanel.tsx
import React from 'react';
import { type LayerDTO } from '../api/api';

interface Props {
  layers: LayerDTO[];
  onAddLayer: (layer: Omit<LayerDTO, '_id'>) => void;
}

const LayerPanel: React.FC<Props> = ({ layers, onAddLayer }) => {
  return (
    <div className="w-64 bg-white border-r p-4 overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Layers</h3>
      <div className="space-y-1">
        {layers.map((l) => (
          <div
            key={l._id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
          >
            <span className="text-sm">{l.name}</span>
            <input type="checkbox" checked={l.visible} readOnly />
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