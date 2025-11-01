import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CanvasEditor from './components/CanvasEditor';
import LayerPanel from './components/LayerPanel';
import CommentPanel from './components/CommentPanel';
import { useDesign } from './hooks/useDesign';
import './App.css';

const App: React.FC = () => {
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('id') || undefined;
  const { layers, canvas, loading, designId: currentId, comments } = useDesign(designId);

  if (loading) return <div className="app-loading">Loadingâ¦</div>;

  return (
    <div className="app-root">
      <LayerPanel layers={layers} designId={currentId!} />
      <CanvasEditor designId={currentId!} canvasData={canvas} />
      <CommentPanel comments={comments} designId={currentId!} />
    </div>
  );
};

export default App;
