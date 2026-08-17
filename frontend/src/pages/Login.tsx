import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera } from '../components/Camera';
import api from '../utils/api';
import { KeyRound, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

type LoginMethod = 'password' | 'face';

export default function Login({ onLoginSuccess, addToast }: LoginProps) {
  const navigate = useNavigate();
  const [method, setMethod] = useState<LoginMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('isAuthenticated', 'true');
      onLoginSuccess(token);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      // Return generic authentication error (do not reveal if email or password was incorrect)
      const errMsg = err.response?.data?.message || 'Invalid credentials';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceLogin = async (base64Image: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/face-login', {
        image: base64Image,
      });

      const { token, user } = response.data;
      localStorage.setItem('isAuthenticated', 'true');
      onLoginSuccess(token);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Face not recognized';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 flex justify-center">
      <div className="card" style={{ maxWidth: '480px' }}>
        <div className="flex align-center gap-2 mb-3">
          <KeyRound size={20} />
          <h2 style={{ fontSize: '1.25rem', letterSpacing: '0.02em' }}>SECURE LOGIN</h2>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Choose Login Method
        </p>

        {/* Login Method Toggle Switch */}
        <div className="flex gap-2 mb-4" style={{ borderBottom: '1px solid var(--border-secondary)', paddingBottom: '1rem' }}>
          <button
            onClick={() => {
              setMethod('password');
              setError(null);
              setEmail('');
              setPassword('');
            }}
            className="btn"
            style={{
              flex: 1,
              backgroundColor: method === 'password' ? 'var(--accent)' : 'transparent',
              color: method === 'password' ? 'var(--accent-text)' : 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              fontSize: '0.75rem',
            }}
            disabled={isLoading}
          >
            Email & Password
          </button>
          <button
            onClick={() => {
              setMethod('face');
              setError(null);
              setEmail('');
              setPassword('');
            }}
            className="btn"
            style={{
              flex: 1,
              backgroundColor: method === 'face' ? 'var(--accent)' : 'transparent',
              color: method === 'face' ? 'var(--accent-text)' : 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              fontSize: '0.75rem',
            }}
            disabled={isLoading}
          >
            Face Recognition
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-3 flex align-center gap-2">
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        {/* Smooth simple conditional render */}
        <div style={{ transition: 'opacity 0.2s ease', opacity: isLoading ? 0.6 : 1 }}>
          {method === 'password' ? (
             <form onSubmit={handlePasswordLogin} autoComplete="off">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <div className="flex justify-between align-center">
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ fontSize: '0.75rem', textDecoration: 'underline', color: 'var(--text-secondary)' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`btn btn-primary ${isLoading ? 'btn-disabled' : ''}`}
                style={{ width: '100%' }}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div className="flex flex-column gap-3">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Align your face within the camera guide box to scan.
              </p>
              <Camera onCapture={handleFaceLogin} isLoading={isLoading} />
            </div>
          )}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1.5rem' }}>
          New user? <Link to="/register" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>Register Face Profile</Link>
        </p>
      </div>
    </div>
  );
}
