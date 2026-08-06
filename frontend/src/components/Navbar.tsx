import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function Navbar({ isAuthenticated, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner flex align-center justify-between">
        <Link to="/" className="logo flex align-center gap-2">
          <Shield size={20} strokeWidth={2.5} />
          <span>FACELOCK</span>
        </Link>
        
        <div className="flex align-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
