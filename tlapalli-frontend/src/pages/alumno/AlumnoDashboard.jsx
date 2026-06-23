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
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

/* ── KPI Card — estilo idéntico al admin ── */
function KpiCard({ title, value, color, icon: Icon, subtitle }) {
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
        <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
      </div>
    );
  }

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

      {/* Header principal con título — igual al admin */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white/90">
          ¡Bienvenido, {data.perfil?.nombre || alumno?.nombre}!
        </h1>
      </div>

      {/* KPIs — grid de 4 columnas igual al admin */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard
          title="Talleres"
          value={data.talleres.length}
          color="pink"
          icon={Palette}
          subtitle={`${data.talleres.length} taller${data.talleres.length !== 1 ? 'es' : ''} inscrito${data.talleres.length !== 1 ? 's' : ''}`}
        />
        <KpiCard
          title="Total Pagado"
          value={`$${totalPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          color="emerald"
          icon={DollarSign}
          subtitle="Acumulado"
        />
        <KpiCard
          title="Asistencia"
          value={`${porcentajeAsistencia}%`}
          color="cyan"
          icon={ClipboardList}
          subtitle={`${asistenciasPresentes}/${asistenciasTotales} clases`}
        />
        <KpiCard
          title="Servicio Social"
          value={`${progresoSS}%`}
          color="amber"
          icon={HeartHandshake}
          subtitle={ss ? `${horasRestantes} hrs restantes` : 'Sin datos'}
        />
      </div>

      {/* Mis Talleres — sección glassmorphism igual al admin */}
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

      {/* Últimos Pagos — sección glassmorphism igual al admin */}
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

        {data.pagos.length === 0 ? (
          <p className="text-white/40 italic text-sm">No hay pagos registrados aún.</p>
        ) : (
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
        )}
      </div>

    </div>
  );
}

export default AlumnoDashboard;
