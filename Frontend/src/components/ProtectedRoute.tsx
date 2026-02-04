import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // If admin tries to access customer route or vice versa
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return <>{children}</>;
}
