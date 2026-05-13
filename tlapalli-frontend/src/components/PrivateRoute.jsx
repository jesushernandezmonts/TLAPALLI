import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles y el usuario no tiene el rol adecuado
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir al dashboard correspondiente según su rol
    if (user.rol === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/mis-grupos" replace />;
    }
  }

  return <Outlet />;
}

export default PrivateRoute;
