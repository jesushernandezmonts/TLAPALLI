import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, User, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';

function AlumnoPerfil() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const { data } = await api.get('/alumnos/me/perfil');
        setPerfil(data);
      } catch (err) {
        console.error('Error loading perfil', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-violet-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
          Mi Perfil
        </h1>
        <p className="mt-1 text-base font-semibold text-white/75">
          Tus datos personales registrados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto y nombre */}
        <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 mx-auto mb-4 flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-white">
            {perfil?.nombre} {perfil?.apellidoPaterno}
          </h2>
          {perfil?.apellidoMaterno && (
            <p className="text-white/50 text-sm">{perfil.apellidoMaterno}</p>
          )}
          {perfil?.email && (
            <p className="text-violet-400 text-sm mt-2">{perfil.email}</p>
          )}
        </div>

        {/* Detalles */}
        <div className="lg:col-span-2 bg-slate-900/95 border border-white/20 rounded-2xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white/90 mb-6">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Nombre Completo</p>
                <p className="text-white/80 font-medium">{perfil?.nombre} {perfil?.apellidoPaterno} {perfil?.apellidoMaterno || ''}</p>
              </div>
              {perfil?.curp && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">CURP</p>
                  <p className="text-white/80 font-mono text-sm">{perfil.curp}</p>
                </div>
              )}
              {perfil?.fechaNacimiento && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Fecha de Nacimiento</p>
                  <p className="text-white/80">{new Date(perfil.fechaNacimiento).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {perfil?.telefono && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Teléfono</p>
                  <p className="text-white/80">{perfil.telefono}</p>
                </div>
              )}
              {perfil?.email && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Correo Electrónico</p>
                  <p className="text-white/80">{perfil.email}</p>
                </div>
              )}
              {perfil?.padecimientos && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Padecimientos</p>
                  <p className="text-white/80 text-sm">{perfil.padecimientos}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlumnoPerfil;
