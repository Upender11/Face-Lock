import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera } from '../components/Camera';
import api from '../utils/api';
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';

interface RegisterProps {
  addToast: (message: string, type: 'success' | 'error') => void;
}

export default function Register({ addToast }: RegisterProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Info, 2: Camera Capture
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (emailStr: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setStep(2);
  };

  const handleCapture = (base64Image: string) => {
    setError(null);
    const newCount = capturedImages.length + 1;
    setCapturedImages((prev) => [...prev, base64Image]);
    addToast(`Face scan #${newCount} captured`, 'success');
  };

  const resetCaptures = () => {
    setCapturedImages([]);
    setError(null);
  };

  const handleSubmit = async () => {
    if (capturedImages.length < 5) {
      setError(`Please capture at least 5 scans. You currently have ${capturedImages.length}.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        images: capturedImages,
      });

      addToast('Profile registered successfully!', 'success');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Server unavailable. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 flex justify-center">
      <div className="card">
        <div className="flex align-center gap-2 mb-3">
          <UserPlus size={20} />
          <h2 style={{ fontSize: '1.25rem' }}>CREATE ACCOUNT</h2>
        </div>

        {error && (
          <div className="alert alert-error mb-3">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNextStep}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="flex justify-between align-center">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ fontSize: '0.75rem', textDecoration: 'underline', color: 'var(--text-secondary)' }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Face Scan
            </button>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1.5rem' }}>
              Already registered? <Link to="/login" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>Sign In</Link>
            </p>
          </form>
        ) : (
          <div className="flex flex-column gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex align-center gap-1"
              style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}
              disabled={isLoading}
            >
              <ArrowLeft size={12} />
              <span>Back to Details</span>
            </button>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
              <p>Capture 5-10 distinct angles of your face (front, slightly tilted, etc.) under clear lighting.</p>
              <div className="capture-steps mt-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`capture-step-dot ${capturedImages.length > i ? 'active' : ''}`}
                    title={`Scan ${i + 1}`}
                  />
                ))}
              </div>
              <p className="mt-2" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                Captured: {capturedImages.length} scans
              </p>
            </div>

            {capturedImages.length < 5 ? (
              <Camera onCapture={handleCapture} isLoading={isLoading} />
            ) : (
              <div className="flex flex-column gap-3 py-2 align-center">
                  <div className="flex align-center gap-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    <CheckCircle size={18} />
                  <span>5 scans recorded successfully</span>
                  </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`btn btn-primary ${isLoading ? 'btn-disabled' : ''}`}
                  style={{ width: '100%' }}
                >
                  {isLoading ? 'Creating Account...' : 'Register Profile'}
                </button>
                
                <button
                  onClick={resetCaptures}
                  disabled={isLoading}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Clear and Rescan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
