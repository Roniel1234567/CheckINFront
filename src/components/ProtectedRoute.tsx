import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = authService.getToken();
  const user = authService.getCurrentUser();

  if (!token || !user) {
    // Redirigir a login si no hay token o usuario
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    // Si el usuario no tiene el rol requerido, redirigir a una página de acceso denegado
    return <Navigate to="/acceso-denegado" replace />;
  }

  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute; 