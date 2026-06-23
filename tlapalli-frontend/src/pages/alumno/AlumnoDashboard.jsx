import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import {
  Loader2,
  Palette,
  CreditCard,
  ClipboardList,
  HeartHandshake,
  Calendar,
  DollarSign,
} from 'lucide-react';

/* ── KPI Card — estilo idéntico al admin ── */
function KpiCard({ title, value, color, subtitle }) {
  const colorClasses = {
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-100 hover:shadow-pink-500/20',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100 hover:shadow-emerald-500/20',
    cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100 hover:shadow-cyan-500/20',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-100 hover:shadow-amber-500/20',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl p-6 border backdrop-blur-md ${colorClasses[color] || colorClasses.pink} shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative group`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
      <p className="text-sm opacity-60 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-black mt-2 tracking-tighter">{value}</p>
      {subtitle && (
        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-white/40">
          <span>{subtitle}</span>
        </div>
      )}
    </motion.div>
  );
}

function AlumnoDashboard() {
  const { alumno, tipo } = useOutletContext();
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
          tipo !== 'servicio_social' ? api.get('/alumnos/me/talleres') : { data: [] },
          tipo !== 'servicio_social' ? api.get('/alumnos/me/pagos') : { data: [] },
          tipo !== 'servicio_social' ? api.get('/alumnos/me/asistencias') : { data: [] },
          tipo !== 'talleres' ? api.get('/alumnos/me/servicio-social') : { data: [] },
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
    if (tipo) fetchData();
  }, [tipo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
      </div>
    );
  }

  const tieneTalleres = tipo === 'talleres' || tipo === 'ambos';
  const tieneSS = tipo === 'servicio_social' || tipo === 'ambos';

  const totalPagado = data.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  const asistenciasTotales = data.asistencias.length;
  const asistenciasPresentes = data.asistencias.filter(a => a.estado === 'asistencia').length;
  const porcentajeAsistencia = asistenciasTotales > 0
    ? Math.round((asistenciasPresentes / asistenciasTotales) * 100)
    : 0;

  const ss = data.servicioSocial[0];
  const progresoSS = ss ? Math.round((ss.horasCompletadas / ss.horasRequeridas) * 100) : 0;
  const horasRestantes = ss ? ss.horasRequeridas - ss.horasCompletadas : 0;

  return (
    <div className="space-y-6">

      {/* Header principal con título */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white/90">
          ¡Bienvenido, {data.perfil?.nombre || alumno?.nombre}!
        </h1>
      </div>

      {/* KPIs dinámicos según tipo */}
      <div className={`grid grid-cols-1 ${tieneTalleres && tieneSS ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
        {tieneTalleres && (
          <KpiCard
            title="Talleres"
            value={data.talleres.length}
            color="pink"
            subtitle={`${data.talleres.length} taller${data.talleres.length !== 1 ? 'es' : ''}`}
          />
        )}
        {tieneTalleres && (
          <KpiCard
            title="Total Pagado"
            value={`$${totalPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            color="emerald"
            subtitle="Acumulado"
          />
        )}
        {tieneTalleres && (
          <KpiCard
            title="Asistencia"
            value={`${porcentajeAsistencia}%`}
            color="cyan"
            subtitle={`${asistenciasPresentes}/${asistenciasTotales} clases`}
          />
        )}
        {tieneSS && (
          <KpiCard
            title="Servicio Social"
            value={`${progresoSS}%`}
            color="amber"
            subtitle={ss ? `${horasRestantes} hrs restantes` : 'Sin datos'}
          />
        )}
      </div>

      {/* Mis Talleres — solo si aplica */}
      {tieneTalleres && (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white/90">Mis Talleres</h2>
            <Link
              to="/alumno/talleres"
              className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors uppercase tracking-wider"
            >
              Ver todos →
            </Link>
          </div>

          {data.talleres.length === 0 ? (
            <p className="text-white/40 italic text-sm">No estás inscrito en ningún taller aún.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.talleres.slice(0, 4).map((insc) => (
                <motion.div
                  key={insc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/40 group-hover:bg-pink-500 transition-all" />
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-pink-400" />
                    <h3 className="font-bold text-white/90 group-hover:text-pink-400 transition-colors uppercase tracking-tight text-sm">
                      {insc.taller?.nombreTaller}
                    </h3>
                  </div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> {insc.taller?.horarioDescripcion || 'Sin horario'}
                  </p>
                  <p className="text-xs text-emerald-400 font-bold">
                    ${Number(insc.taller?.costoMensual).toFixed(2)}/mes
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Últimos Pagos — solo si tiene talleres */}
      {tieneTalleres && data.pagos.length > 0 && (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white/90">Últimos Pagos</h2>
            <Link
              to="/alumno/pagos"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
            >
              Ver todos →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                  <th className="py-3 px-4">Mes</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.pagos.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white/80 font-medium capitalize">
                      {p.mesCorrespondiente}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      ${Number(p.monto).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">
                        {p.metodoPago}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/40 text-sm">
                      {new Date(p.fechaPago).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección informativa si es solo servicio social */}
      {tieneSS && !tieneTalleres && (
        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-8 shadow-xl text-center">
          <HeartHandshake size={48} className="mx-auto text-amber-400/60 mb-4" />
          <h2 className="text-xl font-bold text-white/90">Bienvenido a tu Servicio Social</h2>
          <p className="text-white/60 mt-2">
            Desde tu menú lateral puedes registrar tus horas y dar seguimiento a tu progreso.
          </p>
          <Link
            to="/alumno/servicio-social"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/20 transition-all"
          >
            <HeartHandshake size={18} /> Ir a Servicio Social
          </Link>
        </div>
      )}

      {/* Mensaje si no tiene nada */}
      {tipo === 'ninguno' && (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-12 text-center">
          <p className="text-white/40 text-lg font-medium">Aún no tienes actividades asignadas.</p>
          <p className="text-white/30 text-sm mt-2">Contacta al administrador para más información.</p>
        </div>
      )}

    </div>
  );
}

export default AlumnoDashboard;
