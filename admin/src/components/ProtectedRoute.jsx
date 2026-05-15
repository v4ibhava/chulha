import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  if (!auth) return null;
  const { user, loading } = auth;
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" /></div>;
  return user ? children : <Navigate to="/login" />;
}
