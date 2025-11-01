/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CanvasEditor from './components/CanvasEditor';
import LayerPanel from './components/LayerPanel';
import CommentPanel from './components/CommentPanel';
import { useDesign } from './hooks/useDesign';
import { useUser } from './hooks/useUser';
import Login from './pages/Login';
import ActiveUserBar from './components/ActiveUserbar';
import './styles/App.css';

const App: React.FC = () => {
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('id') || undefined;
  const { layers, canvas, loading, designId: currentId, comments } = useDesign(designId);
  const { user, setUser } = useUser();
  const [checking, setChecking] = useState(true);

  // Check localStorage on load
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

  const handleLogin = (u: any) => {
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (checking) return <div className="app-loading">Loading...</div>;

  // If no user → show login page
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // If design still loading
  if (loading) return <div className="app-loading">Loading…</div>;

  // Main editor when user is logged in
  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top bar with active users + logout */}
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
        <h3 style={{ margin: 0, color: '#2a3692' }}>🎨 Collaborative Canvas</h3>
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

      {/* Main editor layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        <LayerPanel layers={layers} designId={currentId!} />
        <CanvasEditor designId={currentId!} canvasData={canvas} />
        <CommentPanel comments={comments} designId={currentId!} />
      </div>
    </div>
  );
};

export default App;
