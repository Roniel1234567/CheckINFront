import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

// Importa ACCESOS_POR_ROL si está en otro archivo, o define aquí si es necesario
const ACCESOS_POR_ROL: Record<number, string[]> = {
  1: ['calificacion', 'pasantias', 'evaluaciones', 'subirdoc'],
  2: ['companies', 'plazas', 'evaluaciones', 'pasantias'],
  3: ['pasantias', 'estudiante', 'calificacion', 'reports', 'supervisores'],
  4: ['*'],
  5: ['*'] // Observador tiene acceso a todo, pero en modo solo lectura
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
  routeId?: string;
}

const ProtectedRoute = ({ children, allowedRoles = [], routeId }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = authService.getToken();
  const user = authService.getCurrentUser();

  if (!token || !user) {
    // Redirigir a login si no hay token o usuario
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // Si el usuario es Observador (rol 5), permitir acceso pero en modo solo lectura
  if (user.rol === 5) {
    // El componente hijo tendrá acceso a isReadOnly a través del contexto
    return <>{children}</>;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    // Si el usuario no tiene el rol requerido, redirigir a una página de acceso denegado
    return <Navigate to="/acceso-denegado" replace />;
  }

  // Nueva lógica: si se pasa routeId, verificar acceso según ACCESOS_POR_ROL
  if (routeId && user.rol !== 4 && user.rol !== 5) {
    const accesos = ACCESOS_POR_ROL[user.rol] || [];
    if (!accesos.includes(routeId)) {
      return <Navigate to="/acceso-denegado" replace />;
    }
  }

  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute; 