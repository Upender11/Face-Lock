import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { User, Mail, Calendar, LogOut } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface UserProfile {
  name: string;
  email: string;
  createdAt: string;
}

export default function Dashboard({ onLogout, addToast }: DashboardProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get('/profile');
        setProfile(response.data.user);
      } catch (err: any) {
        console.error(err);
        const errMsg = err.response?.data?.message || 'Failed to load profile';
        setError(errMsg);
        addToast(errMsg, 'error');
        // If unauthorized, log out immediately
        if (err.response?.status === 401) {
          onLogout();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [navigate, onLogout, addToast]);

  const handleLogout = () => {
    onLogout();
    addToast('Logged out successfully', 'success');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center align-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="card">
          <div className="alert alert-error">
            {error || 'Unable to retrieve profile data.'}
          </div>
          <button onClick={handleLogout} className="btn btn-primary" style={{ width: '100%' }}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 flex justify-center">
      <div className="card" style={{ maxWidth: '440px' }}>
        <h2 className="mb-4" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
          USER DASHBOARD
        </h2>

        <div className="flex flex-column gap-3 mb-4">
          <div className="flex align-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <User size={16} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Name</p>
              <p style={{ fontWeight: 500 }}>{profile.name}</p>
            </div>
          </div>

          <div className="flex align-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Email</p>
              <p style={{ fontWeight: 500 }}>{profile.email}</p>
            </div>
          </div>

          <div className="flex align-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Registration Date</p>
              <p style={{ fontWeight: 500 }}>
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-primary flex align-center justify-center gap-2" style={{ width: '100%' }}>
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
