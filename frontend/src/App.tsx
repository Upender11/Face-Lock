import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ToastContainer, type ToastType } from './components/Toast';
// import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
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
    console.log(token)
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
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register addToast={addToast} />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} addToast={addToast} />} />
            <Route path="/dashboard" element={
              // <ProtectedRoute>
                <Dashboard onLogout={handleLogout} addToast={addToast} />
              // </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Router>
  );
}

export default App;
