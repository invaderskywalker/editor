/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

interface Props {
  canvas: any;
  designId: string;
  selectedId?: string | null;
  onColorSelect?: (color: string) => void;
}

const DEFAULT_PALETTE = [
  '#FF5733',
  '#FFC300',
  '#4CAF50',
  '#2196F3',
  '#9C27B0',
  '#000000',
  '#FFFFFF',
];

const ColorSystemPanel: React.FC<Props> = ({
  canvas,
  designId,
  selectedId,
  onColorSelect,
}) => {
  const socket = useSocket();
  const [customColors, setCustomColors] = useState<string[]>([]);

  const colors = useMemo(() => {
    const set = new Set<string>();
    // Extract colors used in canvas
    canvas?.layers?.forEach((layer: any) => {
      layer.objects?.forEach((obj: any) => {
        if (obj.fill) set.add(obj.fill);
      });
    });
    // Add presets + custom colors
    return Array.from(new Set([...DEFAULT_PALETTE, ...Array.from(set), ...customColors]));
  }, [canvas, customColors]);

  const handleColorPick = (color: string) => {
    if (!selectedId) {
      alert('Please select an object first.');
      return;
    }

    // Local update
    if (onColorSelect) onColorSelect(color);

    // Broadcast
    socket.current?.emit('canvas:colorChange', {
      designId,
      objectId: selectedId,
      color,
      source: 'ui',
    });
  };

  const handleAddColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColors((prev) =>
      prev.includes(color) ? prev : [...prev, color]
    );
    handleColorPick(color);
  };

  return (
    <div className="ui-panel color-system-panel" style={{ padding: 18 }}>
      <h3 style={{ color: '#2a3692', marginBottom: 12 }}>🎨 Color Palette</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {colors.map((color, i) => (
          <div
            key={i}
            onClick={() => handleColorPick(color)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: '2px solid #ccc',
              background: color,
              cursor: 'pointer',
              boxShadow: '0 0 3px rgba(0,0,0,0.2)',
            }}
            title={color}
          />
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            color: '#666',
            fontWeight: 500,
          }}
        >
          ➕ Add Custom Color
        </label>
        <input
          type="color"
          onChange={handleAddColor}
          style={{
            width: 50,
            height: 30,
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        />
      </div>

      {!selectedId && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
          Select a shape to apply colors.
        </div>
      )}
    </div>
  );
};

export default ColorSystemPanel;
