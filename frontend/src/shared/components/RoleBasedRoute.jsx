import { Navigate } from 'react-router-dom';
import { getUser } from '../utils/auth';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const user = getUser();
  
  if (!user) {
    // Redirect based on route
    if (allowedRoles.includes('department')) {
      return <Navigate to="/login/department" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'department') {
      return <Navigate to="/login/department" replace />;
    }
    if (user.role === 'super_admin') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleBasedRoute;
