import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import { type ToastType } from './Toast';
// import { ProtectedRoute } from './ProtectedRoute';

interface AppRoutesProps {
  addToast: (message: string, type: ToastType) => void;
  handleLoginSuccess: (token: string) => void;
  handleLogout: () => Promise<void>;
}

export function AppRoutes({ addToast, handleLoginSuccess, handleLogout }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/api/register" element={<Register addToast={addToast} />} />
      <Route path="/api/login" element={<Login onLoginSuccess={handleLoginSuccess} addToast={addToast} />} />
      <Route path="/api/dashboard" element={
        // <ProtectedRoute>
          <Dashboard onLogout={handleLogout} addToast={addToast} />
        // </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
