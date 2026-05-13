import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white/90">Dashboard</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Alumnos Activos" value={stats?.alumnosInscritos || 0} color="pink" />
        <KpiCard title="Ingresos Totales" value={`$${stats?.ingresosTotales || 0}`} color="emerald" />
        <KpiCard title="Talleres Activos" value={stats?.talleresActivos || 0} color="cyan" />
        <KpiCard title="Asistencia Hoy" value={stats?.asistenciaHoy || '0%'} color="amber" />
      </div>

      {/* Calendario y Próximas Clases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white/90">Calendario de Actividades</h2>
            <span className="text-xs text-white/40 uppercase tracking-widest">{new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="h-64 flex items-center justify-center border border-white/10 rounded-xl bg-white/5 group hover:bg-white/10 transition-all duration-500">
            <span className="text-white/20 italic group-hover:text-white/40 transition-colors">[Calendario Interactivo - Próximamente]</span>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-white/90">Próximas Clases</h2>
          <div className="space-y-3">
            {stats?.proximasClases && stats.proximasClases.length > 0 ? (
              stats.proximasClases.map(clase => (
                <ClaseItem key={clase.id} name={clase.nombre} hora={clase.hora} instructor={clase.instructor} />
              ))
            ) : (
              <p className="text-white/30 text-sm italic text-center py-10">No hay clases programadas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, color }) {
  const colorClasses = {
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-100 hover:shadow-pink-500/20',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100 hover:shadow-emerald-500/20',
    cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100 hover:shadow-cyan-500/20',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-100 hover:shadow-amber-500/20',
  };
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      className={`rounded-2xl p-6 border backdrop-blur-md ${colorClasses[color]} shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative group`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
      <p className="text-sm opacity-60 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-4xl font-black mt-2 tracking-tighter">{value}</p>
    </motion.div>
  );
}

function ClaseItem({ name, hora, instructor }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
    >
      <div className="min-w-0 pr-4">
        <p className="font-bold text-white/90 truncate group-hover:text-pink-400 transition-colors">{name}</p>
        <p className="text-xs text-white/40 truncate">{instructor}</p>
      </div>
      <span className="text-[10px] font-black text-pink-400 bg-pink-400/10 px-2 py-1 rounded-lg border border-pink-400/20 whitespace-nowrap">{hora}</span>
    </motion.div>
  );
}

export default Dashboard;
