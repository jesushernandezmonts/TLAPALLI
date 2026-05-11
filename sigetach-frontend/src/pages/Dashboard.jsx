function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white/90">Dashboard</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Alumnos Inscritos" value="1,248" color="pink" />
        <KpiCard title="Ingresos Totales" value="$34,500" color="emerald" />
        <KpiCard title="Talleres Activos" value="35" color="cyan" />
        <KpiCard title="Asistencia Hoy" value="94%" color="amber" />
      </div>

      {/* Calendario y Próximas Clases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-white/90">Calendario de Actividades</h2>
          <div className="h-64 flex items-center justify-center border border-white/10 rounded-xl bg-white/5">
            <span className="text-white/40 italic">[Calendario Interactivo]</span>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-white/90">Próximas Clases</h2>
          <div className="space-y-3">
            <ClaseItem name="Danza Folklórica" hora="16:00 - 18:00" instructor="Prof. García" />
            <ClaseItem name="Guitarra" hora="17:00 - 19:00" instructor="Prof. Martínez" />
            <ClaseItem name="Canto" hora="18:00 - 20:00" instructor="Prof. López" />
            <ClaseItem name="Pintura" hora="10:00 - 12:00" instructor="Prof. Rivera" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, color }) {
  const colorClasses = {
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-100',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100',
    cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-100',
  };
  return (
    <div className={`rounded-2xl p-4 border backdrop-blur-md ${colorClasses[color]} shadow-lg transition transform hover:scale-105 cursor-pointer`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ClaseItem({ name, hora, instructor }) {
  return (
    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition">
      <div>
        <p className="font-medium text-white/90">{name}</p>
        <p className="text-xs text-white/50">{instructor}</p>
      </div>
      <span className="text-xs font-bold text-pink-400 bg-pink-400/10 px-2 py-1 rounded-lg">{hora}</span>
    </div>
  );
}

export default Dashboard;
