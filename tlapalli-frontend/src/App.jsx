import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import Instructores from './pages/Instructores';
import Talleres from './pages/Talleres';
import Inscripciones from './pages/Inscripciones';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ActivarCuenta from './pages/ActivarCuenta';
import AcceptInvitation from './pages/AcceptInvitation';
import AuthSuccess from './pages/AuthSuccess';
import Pagos from './pages/Pagos';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/activar-cuenta" element={<ActivarCuenta />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* Rutas compartidas (Admin y Profesor) */}
      <Route element={<PrivateRoute allowedRoles={['admin', 'profesor']} />}>
        <Route element={<Layout />}>
          <Route path="/pagos" element={<Pagos />} />
        </Route>
      </Route>

      {/* Rutas del ADMIN */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/instructores" element={<Instructores />} />
          <Route path="/talleres" element={<Talleres />} />
          <Route path="/inscripciones" element={<Inscripciones />} />
        </Route>
      </Route>

      {/* Rutas del PROFESOR */}
      <Route element={<PrivateRoute allowedRoles={['profesor']} />}>
        <Route element={<Layout />}>
          <Route path="/mis-grupos" element={<div className="text-white p-8 text-center"><h2 className="text-2xl font-bold mb-2">Panel del Profesor</h2><p className="text-white/60">Próximamente</p></div>} />
          <Route path="/asistencia" element={<div className="text-white p-8 text-center"><h2 className="text-2xl font-bold mb-2">Pasar Lista</h2><p className="text-white/60">Próximamente</p></div>} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
