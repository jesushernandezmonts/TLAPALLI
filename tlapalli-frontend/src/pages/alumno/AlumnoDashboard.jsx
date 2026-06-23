import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Loader2,
  Palette,
  CreditCard,
  ClipboardList,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

function AlumnoDashboard() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    perfil: null,
    talleres: [],
    pagos: [],
    asistencias: [],
    servicioSocial: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfilRes, talleresRes, pagosRes, asistenciasRes, ssRes] = await Promise.all([
          api.get('/alumnos/me/perfil'),
          api.get('/alumnos/me/talleres'),
          api.get('/alumnos/me/pagos'),
          api.get('/alumnos/me/asistencias'),
          api.get('/alumnos/me/servicio-social'),
        ]);
        setData({
          perfil: perfilRes.data,
          talleres: talleresRes.data,
          pagos: pagosRes.data,
          asistencias: asistenciasRes.data,
          servicioSocial: ssRes.data,
        });
      } catch (err) {
        console.error('Error loading alumno data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
      </div>
    );
  }

  const totalPagado = data.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  const asistenciasTotales = data.asistencias.length;
  const asistenciasPresentes = data.asistencias.filter(a => a.estado === 'asistencia').length;
  const porcentajeAsistencia = asistenciasTotales > 0 ? Math.round((asistenciasPresentes / asistenciasTotales) * 100) : 0;

  const ss = data.servicioSocial[0];
  const progresoSS = ss ? Math.round((ss.horasCompletadas / ss.horasRequeridas) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
          ¡Bienvenido, {data.perfil?.nombre || alumno?.nombre}!
        </h1>
        <p className="mt-1 text-base font-semibold text-white/75">
          Este es tu panel de alumno en TLAPALLI
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/10 border border-violet-500/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-violet-500/20">
              <Palette size={24} className="text-violet-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-violet-300">Talleres</span>
          </div>
          <p className="text-3xl font-black text-white">{data.talleres.length}</p>
          <p className="text-xs text-white/50 mt-1">Talleres inscritos</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <DollarSign size={24} className="text-emerald-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">Pagos</span>
          </div>
          <p className="text-3xl font-black text-white">${totalPagado.toFixed(2)}</p>
          <p className="text-xs text-white/50 mt-1">Total pagado</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-600/20 to-sky-600/10 border border-cyan-500/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/20">
              <ClipboardList size={24} className="text-cyan-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">Asistencia</span>
          </div>
          <p className="text-3xl font-black text-white">{porcentajeAsistencia}%</p>
          <p className="text-xs text-white/50 mt-1">{asistenciasPresentes}/{asistenciasTotales} clases</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <HeartHandshake size={24} className="text-amber-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">S. Social</span>
          </div>
          <p className="text-3xl font-black text-white">{ss ? `${progresoSS}%` : '—'}</p>
          <p className="text-xs text-white/50 mt-1">{ss ? `${ss.horasCompletadas}/${ss.horasRequeridas} hrs` : 'Sin asignar'}</p>
        </div>
      </div>

      {/* Mis Talleres */}
      <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <Palette size={22} className="text-violet-400" />
            Mis Talleres
          </h2>
          <Link to="/alumno/talleres" className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider">
            Ver todos →
          </Link>
        </div>
        {data.talleres.length === 0 ? (
          <p className="text-white/40 italic">No estás inscrito en ningún taller aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.talleres.slice(0, 4).map((insc) => (
              <div key={insc.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                  <h3 className="font-bold text-white/90">{insc.taller?.nombreTaller}</h3>
                </div>
                <p className="text-xs text-white/50 flex items-center gap-1">
                  <Calendar size={12} /> {insc.taller?.horarioDescripcion || 'Sin horario'}
                </p>
                <p className="text-xs text-emerald-400 font-bold mt-1">
                  ${Number(insc.taller?.costoMensual).toFixed(2)}/mes
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Últimos Pagos */}
      <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <CreditCard size={22} className="text-emerald-400" />
            Últimos Pagos
          </h2>
          <Link to="/alumno/pagos" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider">
            Ver todos →
          </Link>
        </div>
        {data.pagos.length === 0 ? (
          <p className="text-white/40 italic">No hay pagos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-white/40 uppercase tracking-wider border-b border-white/10">
                  <th className="py-3 px-2">Mes</th>
                  <th className="py-3 px-2">Monto</th>
                  <th className="py-3 px-2">Método</th>
                  <th className="py-3 px-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.pagos.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-white/80 font-medium capitalize">{p.mesCorrespondiente}</td>
                    <td className="py-3 px-2 text-emerald-400 font-bold">${Number(p.monto).toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] uppercase tracking-wider text-white/50">{p.metodoPago}</span>
                    </td>
                    <td className="py-3 px-2 text-white/40 text-sm">{new Date(p.fechaPago).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlumnoDashboard;
