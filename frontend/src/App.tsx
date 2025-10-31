/* eslint-disable @typescript-eslint/no-explicit-any */
// src/App.tsx
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import CommentPanel from './components/CommentPanel';
import { useDesign } from './hooks/useDesign';
import { addLayer, addComment } from './api/api';
import { useDispatch } from 'react-redux';
import { setCanvasData } from './redux/designSlice';

const App: React.FC = () => {
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('id') || undefined;
  const { design, loading } = useDesign(designId);
  const dispatch = useDispatch();

  const [layers, setLayers] = React.useState<any[]>([]);
  const [comments, setComments] = React.useState<any[]>([]);

  useEffect(() => {
    if (!design) return;
    setLayers(design.layers || []);
    setComments(design.comments || []);
    dispatch(setCanvasData(design.canvas));
  }, [design, dispatch]);

  const handleAddLayer = async (layer: any) => {
    if (!design?._id) return;
    const newLayer = await addLayer(design._id, layer);
    setLayers(prev => [...prev, newLayer]);
  };

  const handleAddComment = async (comment: any) => {
    if (!design?._id) return;
    const newComment = await addComment(design._id, comment);
    setComments(prev => [...prev, newComment]);
  };

  if (loading) return <div className="p-4">Loading design...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LayerPanel layers={layers} onAddLayer={handleAddLayer} />
        <CanvasEditor designId={design._id} />
        <CommentPanel comments={comments} onAddComment={handleAddComment} />
      </div>
    </div>
  );
};

export default App;