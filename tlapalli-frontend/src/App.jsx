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
import Reportes from './pages/Reportes';
import MisGrupos from './pages/MisGrupos';
import Asistencia from './pages/Asistencia';
import MiPerfil from './pages/MiPerfil';
import ServicioSocial from './pages/ServicioSocial';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Alumno pages
import AlumnoLogin from './pages/alumno/AlumnoLogin';
import AlumnoDashboard from './pages/alumno/AlumnoDashboard';
import AlumnoTalleres from './pages/alumno/AlumnoTalleres';
import AlumnoPagos from './pages/alumno/AlumnoPagos';
import AlumnoAsistencias from './pages/alumno/AlumnoAsistencias';
import AlumnoPerfil from './pages/alumno/AlumnoPerfil';
import AlumnoServicioSocial from './pages/alumno/AlumnoServicioSocial';
import AlumnoActivarCuenta from './pages/alumno/AlumnoActivarCuenta';
import AlumnoLayout from './pages/alumno/AlumnoLayout';
import AlumnoPrivateRoute from './pages/alumno/AlumnoPrivateRoute';

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

      {/* Rutas del ADMIN */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/instructores" element={<Instructores />} />
          <Route path="/talleres" element={<Talleres />} />
          <Route path="/inscripciones" element={<Inscripciones />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/servicio-social" element={<ServicioSocial />} />
        </Route>
      </Route>

      {/* Rutas del PROFESOR */}
      <Route element={<PrivateRoute allowedRoles={['profesor']} />}>
        <Route element={<Layout />}>
          <Route path="/mis-grupos" element={<MisGrupos />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/pagos" element={<Pagos />} />
        </Route>
      </Route>

      {/* Mi Perfil - accesible para ambos roles */}
      <Route element={<PrivateRoute allowedRoles={['admin', 'profesor']} />}>
        <Route element={<Layout />}>
          <Route path="/mi-perfil" element={<MiPerfil />} />
        </Route>
      </Route>

      {/* Rutas del ALUMNO */}
      <Route path="/alumno/login" element={<AlumnoLogin />} />
      <Route path="/alumno/activar-cuenta" element={<AlumnoActivarCuenta />} />
      <Route element={<AlumnoPrivateRoute />}>
        <Route element={<AlumnoLayout />}>
          <Route path="/alumno/dashboard" element={<AlumnoDashboard />} />
          <Route path="/alumno/talleres" element={<AlumnoTalleres />} />
          <Route path="/alumno/pagos" element={<AlumnoPagos />} />
          <Route path="/alumno/asistencias" element={<AlumnoAsistencias />} />
          <Route path="/alumno/perfil" element={<AlumnoPerfil />} />
          <Route path="/alumno/servicio-social" element={<AlumnoServicioSocial />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
