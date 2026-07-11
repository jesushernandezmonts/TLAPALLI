import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, ClipboardList, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

function AlumnoAsistencias() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [asistencias, setAsistencias] = useState([]);

  useEffect(() => {
    const fetchAsistencias = async () => {
      try {
        const { data } = await api.get('/alumnos/me/asistencias');
        setAsistencias(data);
      } catch (err) {
        console.error('Error loading asistencias', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsistencias();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-violet-500" /></div>;
  }

  const totales = asistencias.length;
  const presentes = asistencias.filter(a => a.estado === 'asistencia').length;
  const faltas = asistencias.filter(a => a.estado === 'falta').length;
  const porcentaje = totales > 0 ? Math.round((presentes / totales) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
          Mi Asistencia
        </h1>
        <p className="mt-1 text-base font-semibold text-white/75">
          Registro de tus asistencias a clases
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-600/20 to-sky-600/10 border border-cyan-500/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-white">{totales}</p>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">Total Registros</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-emerald-400">{presentes}</p>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">Asistencias</p>
        </div>
        <div className="bg-gradient-to-br from-rose-600/20 to-pink-600/10 border border-rose-500/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-rose-400">{faltas}</p>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">Faltas</p>
        </div>
        <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/10 border border-violet-500/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-violet-400">{porcentaje}%</p>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">Asistencia</p>
        </div>
      </div>

      {asistencias.length === 0 ? (
        <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-12 text-center">
          <ClipboardList size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 font-medium">No hay registros de asistencia aún.</p>
        </div>
      ) : (
        <div className="bg-slate-900/95 border border-white/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/80 border-b border-white/15">
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Fecha</th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Taller / Grupo</th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Estado</th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {asistencias.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-white/80">
                        <Calendar size={14} className="text-white/40" />
                        {new Date(a.fecha).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white/70">
                      {a.inscripcion?.taller?.nombreTaller || a.grupoAlumno?.grupo?.nombre || '—'}
                    </td>
                    <td className="py-4 px-6">
                      {a.estado === 'asistencia' ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 size={14} /> Presente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-bold text-xs">
                          <XCircle size={14} /> Falta
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-white/40 text-sm">{a.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumnoAsistencias;
