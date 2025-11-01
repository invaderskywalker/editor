/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { getOrCreateUser } from '../api/api';

interface Props {
  onLogin: (user: any) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const user = await getOrCreateUser(name.trim(), email.trim());
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      console.error('Login failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg,#eef3ff,#cfd9ff)'
    }}>
      <form onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: '2rem 3rem',
          borderRadius: '0.9rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
        <h2 style={{ textAlign: 'center', color: '#204093', marginBottom: '0.5rem' }}>Welcome</h2>
        <input
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="ui-panel-btn"
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? 'Logging in...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default Login;
