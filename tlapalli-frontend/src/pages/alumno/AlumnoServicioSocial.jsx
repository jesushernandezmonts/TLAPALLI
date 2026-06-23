import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import {
  Loader2,
  HeartHandshake,
  Clock,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

function AlumnoServicioSocial() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [ssList, setSsList] = useState([]);

  useEffect(() => {
    const fetchSS = async () => {
      try {
        const { data } = await api.get('/alumnos/me/servicio-social');
        setSsList(data);
      } catch (err) {
        console.error('Error loading servicio social', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSS();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-violet-500" /></div>;
  }

  const ss = ssList[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
          Servicio Social
        </h1>
        <p className="mt-1 text-base font-semibold text-white/75">
          Progreso de tus horas de servicio social
        </p>
      </div>

      {!ss ? (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-12 text-center">
          <HeartHandshake size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 font-medium">No tienes un registro de servicio social activo.</p>
          <p className="text-white/30 text-sm mt-2">Contacta al administrador si deseas iniciar tu servicio social.</p>
        </div>
      ) : (
        <>
          {/* Progreso */}
          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-8 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target size={20} className="text-amber-400" />
                  Progreso
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  {ss.institucion && `${ss.institucion}`}
                  {ss.programa && ` — ${ss.programa}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                ss.estatus === 'completado'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : ss.estatus === 'en_curso'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : ss.estatus === 'suspendido'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {ss.estatus === 'completado' ? '✅ Completado' : ss.estatus === 'en_curso' ? 'En curso' : ss.estatus === 'suspendido' ? 'Suspendido' : 'Baja'}
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70 font-medium">{ss.horasCompletadas} hrs completadas</span>
                <span className="text-white/50">{ss.horasRequeridas} hrs requeridas</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    ss.estatus === 'completado'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((ss.horasCompletadas / ss.horasRequeridas) * 100))}%` }}
                />
              </div>
              <p className="text-right text-xs text-white/40 mt-1">
                {Math.round((ss.horasCompletadas / ss.horasRequeridas) * 100)}% completado
              </p>
            </div>

            {ss.supervisor && (
              <p className="text-sm text-white/60 mt-4">
                <span className="text-white/40">Supervisor:</span> {ss.supervisor}
              </p>
            )}
            {ss.fechaInicio && (
              <p className="text-sm text-white/60 mt-1">
                <span className="text-white/40">Inicio:</span> {new Date(ss.fechaInicio).toLocaleDateString()}
              </p>
            )}
            {ss.fechaFin && (
              <p className="text-sm text-white/60 mt-1">
                <span className="text-white/40">Fin:</span> {new Date(ss.fechaFin).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Actividades */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white/90 flex items-center gap-2 mb-6">
              <BookOpen size={20} className="text-amber-400" />
              Actividades Registradas
            </h2>
            {ss.actividades.length === 0 ? (
              <p className="text-white/40 italic">Aún no se han registrado actividades.</p>
            ) : (
              <div className="space-y-4">
                {ss.actividades.map((act) => (
                  <div key={act.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-white/90 text-sm">{act.descripcion}</h4>
                        {act.comentarios && (
                          <p className="text-xs text-white/50 mt-1">{act.comentarios}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-amber-400 font-black text-lg">{act.horas} hrs</span>
                        <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                          <Calendar size={10} />
                          {new Date(act.fecha).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total horas registradas</span>
                    <span className="text-amber-400 font-bold">{ss.horasCompletadas} hrs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AlumnoServicioSocial;
