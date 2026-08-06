import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container py-8 flex justify-center align-center" style={{ minHeight: '60vh' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="flex justify-center mb-2">
          <HelpCircle size={40} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>404 PAGE NOT FOUND</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          The requested page does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%' }}>
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
