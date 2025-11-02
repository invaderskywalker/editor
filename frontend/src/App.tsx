/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CanvasEditor from './components/CanvasEditor';
import RightPanelTabs from './components/RightPanelTabs';
import { useDesign } from './hooks/useDesign';
import { useUser } from './hooks/useUser';
import Login from './pages/Login';
import ActiveUserBar from './components/ActiveUserbar';
import './styles/App.css';

const App: React.FC = () => {
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('id') || undefined;
  const { canvas, loading, designId: currentId, comments } = useDesign(designId);
  const { user, setUser } = useUser();

  const [checking, setChecking] = useState(true);
  const [rightPanelOverlayOpen, setRightPanelOverlayOpen] = useState(false);

  // 🎯 new: selection + color communication
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  // ---- Check localStorage on load ----
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setChecking(false);
  }, [setUser]);

  const handleLogin = (u: any) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (checking) return <div className="app-loading">Loading...</div>;
  if (!user) return <Login onLogin={handleLogin} />;
  if (loading) return <div className="app-loading">Loading…</div>;

  // ---- MAIN RENDER ----
  return (
    <div
      className="app-root"
      style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1rem',
          background: '#f5f7ff',
          borderBottom: '1px solid #e1e4ef',
        }}
      >
        <h3 style={{ margin: 0, color: '#2a3692' }}>Collaborative Canvas</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ActiveUserBar />
          <button
            onClick={handleLogout}
            style={{
              border: 'none',
              background: '#f44336',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <CanvasEditor
          designId={currentId!}
          canvasData={canvas}
          onSelectObject={setSelectedId}
          onColorSelect={setSelectedColor}
          selectedColor={selectedColor}
        />

        {/* Floating button to open right panel */}
        {!rightPanelOverlayOpen && (
          <button
            className="floating-right-panel-overlay-open"
            aria-label="Open right panel"
            style={{
              position: 'fixed',
              top: 70,
              right: 18,
              zIndex: 1205,
              width: 46,
              height: 46,
              borderRadius: '50%',
              border: '1.7px solid #b6c2e3',
              boxShadow: '0 4px 24px 0 rgba(44,79,168,0.10)',
              background: '#fff',
              color: '#2869cb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.12s, box-shadow 0.13s, border 0.13s',
            }}
            onClick={() => setRightPanelOverlayOpen(true)}
            tabIndex={0}
          >
            {/* Panel icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3.2"
                y="4.3"
                width="15.2"
                height="15.2"
                rx="3.6"
                fill="#f6f9ff"
                stroke="#6c93dd"
                strokeWidth="1.5"
              />
              <rect
                x="16.2"
                y="6.6"
                width="3.1"
                height="10.7"
                rx="1.2"
                fill="#d6e4fc"
                stroke="#3477f4"
                strokeWidth="1.4"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Floating Right Panel Overlay */}
      <div
        className={
          'floating-right-panel-overlay' +
          (rightPanelOverlayOpen ? ' open' : '')
        }
        style={rightPanelOverlayOpen ? {} : { pointerEvents: 'none' }}
        tabIndex={-1}
        aria-label="Right panel overlay"
        role="dialog"
      >
        {/* Close button */}
        <button
          className="floating-right-panel-overlay-close"
          aria-label="Close right panel"
          onClick={() => setRightPanelOverlayOpen(false)}
          style={{
            position: 'absolute',
            top: 18,
            right: 19,
            zIndex: 1310,
            width: 38,
            height: 38,
            background: '#fff',
            borderRadius: '50%',
            border: '1.7px solid #dae3f9',
            boxShadow: '0 3px 20px 0 rgba(44,79,168,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="4"
              y1="4"
              x2="12"
              y2="12"
              stroke="#2e3878"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="4"
              x2="4"
              y2="12"
              stroke="#2e3878"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Panel content */}
        {rightPanelOverlayOpen && (
          <div style={{ flex: 1, minHeight: 0 }}>
            <RightPanelTabs
              comments={comments}
              designId={currentId!}
              canvas={canvas}
              selectedId={selectedId}
              onColorSelect={(color) => setSelectedColor(color)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
