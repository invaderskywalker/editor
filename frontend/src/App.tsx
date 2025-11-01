/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/App.tsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CanvasEditor from './components/CanvasEditor';
import LayerPanel from './components/LayerPanel';
import CommentPanel from './components/CommentPanel';
import { useDesign } from './hooks/useDesign';
import { addLayer, addComment } from './api/api';

const App: React.FC = () => {
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('id') || undefined;

  // Now returns comments and appendCommentLocal
  const { layers, canvas, loading, designId: currentId, comments, appendCommentLocal } = useDesign(designId);

  const handleAddLayer = async (layer: { name: string; visible: boolean; locked: boolean }) => {
    if (!currentId) return;
    await addLayer(currentId, layer);
  };

  const handleAddComment = async (comment: Omit<any, '_id'>) => {
    if (!currentId) return;
    const saved = await addComment(currentId, comment);
    appendCommentLocal(saved);
  };

  if (loading) return <div className="p-4">Loading designâ¦</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <LayerPanel layers={layers} designId={currentId!} onAddLayer={handleAddLayer} />
      <CanvasEditor designId={currentId!} canvasData={canvas} />
      <CommentPanel comments={comments} onAddComment={handleAddComment} />
    </div>
  );
};

export default App;
