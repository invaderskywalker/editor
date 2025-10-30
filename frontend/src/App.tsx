import React from 'react';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import CommentPanel from './components/CommentPanel';

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <LayerPanel />
        <CanvasEditor />
        <CommentPanel />
      </div>
    </div>
  );
};

export default App;
