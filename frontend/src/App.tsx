/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/App.tsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CanvasEditor from './components/CanvasEditor';
import LayerPanel from './components/LayerPanel';
import { useDesign } from './hooks/useDesign';
import { addLayer } from './api/api';

const App: React.FC = () => {
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('id') || undefined;

  const { design, layers, canvas, loading, designId: currentId } = useDesign(designId);

  const handleAddLayer = async (layer: { name: string; visible: boolean; locked: boolean }) => {
    if (!currentId) return;
    await addLayer(currentId, layer);
  };

  if (loading) return <div className="p-4">Loading design…</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <LayerPanel layers={layers} designId={currentId!} onAddLayer={handleAddLayer} />
      <CanvasEditor designId={currentId!} canvasData={canvas} />
    </div>
  );
};

export default App;