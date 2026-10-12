import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Skeleton from './Skeleton.jsx';

export default function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Skeleton />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
