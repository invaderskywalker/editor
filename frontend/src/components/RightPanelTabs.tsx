/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import CommentPanel from './CommentPanel';
import ColorSystemPanel from './ColorSystemPanel';
import '../styles/ui-panels.css';

interface Props {
  comments: any[];
  designId: string;
  canvas: any;
  selectedId?: string | null; // 👈 add this
  onColorSelect?: (color: string) => void;
}

const TABS = ['Comments', 'Color System'] as const;

const RightPanelTabs: React.FC<Props> = ({
  comments,
  designId,
  canvas,
  selectedId,
  onColorSelect,
}) => {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>('Color System');

  return (
    <div
      className="ui-panel right-panel-tabs"
      style={{
        width: 340,
        background: '#fff',
        borderLeft: '1px solid #e1e4ef',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="ui-panel-header"
        style={{
          display: 'flex',
          borderBottom: '1px solid #edeef2',
          background: '#f5f7ff',
          minHeight: 44,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              border: 'none',
              background: 'none',
              padding: '10px 18px',
              fontWeight: 600,
              color: activeTab === tab ? '#2668d7' : '#45537b',
              borderBottom:
                activeTab === tab
                  ? '3px solid #2668d7'
                  : '3px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'Comments' && (
          <CommentPanel comments={comments} designId={designId} />
        )}
        {activeTab === 'Color System' && (
          <ColorSystemPanel
            canvas={canvas}
            designId={designId}
            selectedId={selectedId}
            onColorSelect={onColorSelect}
          />
        )}
      </div>
    </div>
  );
};

export default RightPanelTabs;
