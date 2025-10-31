import React from 'react';
import { type LayerDTO } from '../api/api';

interface Props {
  layers: LayerDTO[] | null | undefined;
  onAddLayer: (layer: LayerDTO) => void;
}

const LayerPanel: React.FC<Props> = ({ layers, onAddLayer }) => {
  const safeLayers = Array.isArray(layers) ? layers : [];

  return (
    <div className="w-48 bg-white border-r p-2">
      <h3 className="font-bold mb-2">Layers</h3>
      <ul>
        {safeLayers.map((l) => (
          <li key={l._id || l.name}>{l.name}</li>
        ))}
      </ul>
      <button
        onClick={() =>
          onAddLayer({
            name: `Layer ${safeLayers.length + 1}`,
            visible: true,
            locked: false,
          })
        }
        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
      >
        + Add Layer
      </button>
    </div>
  );
};

export default LayerPanel;
