import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ToastContainer, type ToastType } from './components/Toast';
import { AppRoutes } from './components/AppRoutes';
import api from './utils/api';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    console.log("Token: ",token)
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="flex flex-column" style={{ minHeight: '100vh' }}>
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AppRoutes
            addToast={addToast}
            handleLoginSuccess={handleLoginSuccess}
            handleLogout={handleLogout}
          />
        </main>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Router>
  );
}

export default App;
