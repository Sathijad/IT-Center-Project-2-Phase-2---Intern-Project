import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    const userGroups = user?.groups || [];
    const hasAccess = roles.some((role) => userGroups.includes(role));

    if (!hasAccess) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children || <Outlet />}</>;
};

