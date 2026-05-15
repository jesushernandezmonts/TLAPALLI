import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lógica para el calendario
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Dom, 1 = Lun, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Alumnos Activos" value={stats?.alumnosInscritos || 0} color="pink" />
        <KpiCard title="Ingresos Totales" value={`$${stats?.ingresosTotales || 0}`} color="emerald" />
        <KpiCard title="Talleres Activos" value={stats?.talleresActivos || 0} color="cyan" />
      </div>

      {/* Calendario y Próximas Clases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white/90">Calendario de Actividades</h2>
            <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-black">{new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
          </div>
          
          {/* Visual Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-white/20 uppercase py-2">{d}</div>
            ))}
            
            {padding.map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const isToday = day === new Date().getDate();
              return (
                <div key={day} className={`aspect-square rounded-xl border flex items-center justify-center relative transition-all duration-300 group cursor-pointer
                  ${isToday 
                    ? 'bg-pink-600 border-pink-500 shadow-lg shadow-pink-600/20 scale-105 z-10' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                  <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-white/60'}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white/90">Clases de Hoy</h2>
            <span className="px-2 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-black uppercase">
              {new Date().toLocaleDateString('es-MX', { weekday: 'short' })}
            </span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {stats?.proximasClases && stats.proximasClases.length > 0 ? (
              stats.proximasClases.map(clase => (
                <ClaseItem key={clase.id} name={clase.nombre} instructor={clase.instructor} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 opacity-20 italic">
                <p className="text-sm">No hay clases hoy</p>
              </div>
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
    cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100 hover:shadow-cyan-500/20'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl p-6 border backdrop-blur-md ${colorClasses[color]} shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative group`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
      <p className="text-sm opacity-60 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-black mt-2 tracking-tighter">{value}</p>
    </motion.div>
  );
}

function ClaseItem({ name, instructor }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-2 bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/40 group-hover:bg-pink-500 transition-all" />
      
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <p className="font-black text-white/90 text-sm uppercase tracking-tight group-hover:text-pink-400 transition-colors">{name}</p>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{instructor}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
