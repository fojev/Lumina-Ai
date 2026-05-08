import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(username, password);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: '"Inter", sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow Effects */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40%',
        height: '40%',
        background: 'var(--primary)',
        filter: 'blur(150px)',
        opacity: 0.15,
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        background: 'var(--secondary)',
        filter: 'blur(150px)',
        opacity: 0.15,
        borderRadius: '50%'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px 40px',
        background: 'rgba(26, 26, 36, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 24px 40px rgba(0, 0, 0, 0.4), 0 0 40px var(--glow)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px', 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
          margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px var(--glow)'
        }}>
          <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '32px' }}>school</span>
        </div>

        <h1 style={{ 
          fontSize: '28px', fontWeight: 800, color: 'var(--text)',
          marginBottom: '8px', fontFamily: '"Poppins", sans-serif',
          letterSpacing: '-0.02em'
        }}>
          Welcome Back
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginBottom: '36px' }}>
          Sign in to continue your AI study journey
        </p>

        {error && (
          <div style={{
            padding: '12px', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.1)',
            color: '#ef4444', fontSize: '13px', marginBottom: '24px',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-2)' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '14px',
                background: 'var(--input-bg)', color: 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: '15px', outline: 'none', transition: 'all 0.2s ease'
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--glow)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'var(--input-bg)';
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-2)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '14px',
                background: 'var(--input-bg)', color: 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: '15px', outline: 'none', transition: 'all 0.2s ease'
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--glow)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'var(--input-bg)';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '14px', borderRadius: '14px',
              border: 'none', background: 'var(--primary)',
              color: '#fff', fontSize: '16px', fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px var(--glow)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => !isLoading && (e.target.style.background = 'var(--primary-h)', e.target.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => !isLoading && (e.target.style.background = 'var(--primary)', e.target.style.transform = 'translateY(0)')}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '28px', fontSize: '14px', color: 'var(--text-3)' }}>
          Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary-h)'} onMouseLeave={e => e.target.style.color = 'var(--primary)'}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
