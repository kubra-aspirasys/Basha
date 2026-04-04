import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect based on actual role
    return <Navigate to={role === 'customer' ? '/' : '/admin/dashboard'} replace />;
  }

  return <>{children}</>;
}
