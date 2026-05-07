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
      background: 'var(--color-surface-container-lowest)',
      fontFamily: '"Inter", sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        background: '#fff',
        borderRadius: '24px',
        boxShadow: '0 20px 40px color-mix(in srgb, var(--color-primary) 12%, transparent)',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px', 
          background: 'var(--color-primary)', 
          margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 16px color-mix(in srgb, var(--color-primary) 30%, transparent)'
        }}>
          <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '32px' }}>school</span>
        </div>

        <h1 style={{ 
          fontSize: '28px', fontWeight: 800, color: 'var(--color-on-surface)',
          marginBottom: '8px', fontFamily: '"Space Grotesk", sans-serif'
        }}>
          Welcome Back
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          Sign in to continue your AI study journey
        </p>

        {error && (
          <div style={{
            padding: '12px', borderRadius: '12px', background: '#fee2e2',
            color: '#dc2626', fontSize: '13px', marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-on-surface-variant)' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '1.5px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent)',
                fontSize: '15px', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'color-mix(in srgb, var(--color-outline-variant) 60%, transparent)'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-on-surface-variant)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '1.5px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent)',
                fontSize: '15px', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'color-mix(in srgb, var(--color-outline-variant) 60%, transparent)'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              border: 'none', background: 'var(--color-primary)',
              color: '#fff', fontSize: '16px', fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px color-mix(in srgb, var(--color-primary) 35%, transparent)',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => !isLoading && (e.target.style.opacity = '0.9')}
            onMouseLeave={e => !isLoading && (e.target.style.opacity = '1')}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Don't have an account? <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
