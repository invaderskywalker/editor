import React, { useEffect, useState } from 'react';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import CommentPanel from './components/CommentPanel';
import {
  fetchCanvasData,
  saveCanvasData,
  fetchLayers,
  fetchComments,
  addLayerAPI,
  addCommentAPI,
  type CanvasDataDTO,
  type LayerDTO,
  type CommentDTO,
} from './api/api';

const App: React.FC = () => {
  const [canvasData, setCanvasData] = useState<CanvasDataDTO | null>(null);
  const [layers, setLayers] = useState<LayerDTO[]>([]);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [canvasRes, layerRes, commentRes] = await Promise.all([
          fetchCanvasData(),
          fetchLayers(),
          fetchComments(),
        ]);
        setCanvasData(canvasRes[0] || { version: '1.0', objects: [] });
        setLayers(layerRes);
        setComments(commentRes);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Auto-save canvas every 15 s
  useEffect(() => {
    if (!canvasData) return;
    const id = setInterval(() => saveCanvasData(canvasData), 15000);
    return () => clearInterval(id);
  }, [canvasData]);

  const handleAddLayer = async (layer: LayerDTO) => {
    const newLayer = await addLayerAPI(layer);
    setLayers((prev) => [...prev, newLayer]);
  };

  const handleAddComment = async (comment: CommentDTO) => {
    const newComment = await addCommentAPI(comment);
    setComments((prev) => [...prev, newComment]);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading design…
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LayerPanel layers={layers} onAddLayer={handleAddLayer} />
        <CanvasEditor
          canvasData={canvasData}
          onCanvasChange={setCanvasData}
        />
        <CommentPanel comments={comments} onAddComment={handleAddComment} />
      </div>
    </div>
  );
};

export default App;
