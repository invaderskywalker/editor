/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import '../styles/ui-panels.css';

interface Props {
  addObject: (type: 'rect' | 'circle' | 'text') => void;
  undo: () => void;
  redo: () => void;
  exportPNG: () => void;
  deleteSelected: () => void;
}

const Toolbar: React.FC<Props> = ({
  addObject,
  undo,
  redo,
  exportPNG,
  deleteSelected,
}) => {
  return (
    <div className="toolbar">
      <button onClick={() => addObject('text')} className="toolbar-btn toolbar-btn-blue">Text</button>
      <button onClick={() => addObject('rect')} className="toolbar-btn toolbar-btn-green">Rect</button>
      <button onClick={() => addObject('circle')} className="toolbar-btn toolbar-btn-orange">Circle</button>
      <div className="toolbar-divider" />
      <button onClick={undo} className="toolbar-btn toolbar-btn-gray">Undo</button>
      <button onClick={redo} className="toolbar-btn toolbar-btn-gray">Redo</button>
      <div className="toolbar-divider" />
      <button onClick={deleteSelected} className="toolbar-btn toolbar-btn-red">Delete</button>
      <button onClick={exportPNG} className="toolbar-btn toolbar-btn-indigo">Export PNG</button>
    </div>
  );
};

export default Toolbar;
