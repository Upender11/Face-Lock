
import { Link } from 'react-router-dom';
import { Shield, Key, Eye } from 'lucide-react';

export default function Landing() {
  return (
    <div className="container">
      <div className="landing-grid">
        <div className="flex flex-column gap-3">
          <h1 style={{ fontSize: '3rem', fontWeight: 600, lineHeight: 1.1 }}>
            BIOMETRIC ACCESS CONTROL.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '440px' }}>
            A high-security, passwordless authentication system using pre-trained deep neural face embeddings.
          </p>
          <div className="flex gap-3 mt-2">
            <Link to="/login" className="btn btn-primary">
              Face Sign In
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Register Face
            </Link>
          </div>
        </div>
        
        <div className="flex flex-column gap-4" style={{ borderLeft: '1px solid var(--border-secondary)', paddingLeft: '3rem' }}>
          <div className="flex gap-3">
            <Shield size={24} style={{ marginTop: '0.2rem' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>SECURE EMBEDDINGS</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Images are processed locally to generate mathematical face embeddings. No raw photos are stored permanently.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Key size={24} style={{ marginTop: '0.2rem' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>PASSWORDLESS LOGINS</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Access your dashboard instantly. Verification is performed using high-dimensional cosine similarity matching.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Eye size={24} style={{ marginTop: '0.2rem' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>OPEN SOURCE AI</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Built on open-source Deep FaceNet architecture. No commercial APIs or third-party cloud face verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
