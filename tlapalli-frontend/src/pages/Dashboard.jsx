import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, Edit3, Clock, MapPin, Download } from 'lucide-react';
import Modal from '../components/Modal';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actividades, setActividades] = useState([]);

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // { day, date, dateString }
  
  const [formTitulo, setFormTitulo] = useState('');
  const [formHora, setFormHora] = useState('12:00');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formTipo, setFormTipo] = useState('interna');
  const [formUbicacion, setFormUbicacion] = useState('galeria');
  const [editingActividadId, setEditingActividadId] = useState(null);

  // Lógica para el calendario
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Dom, 1 = Lun, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const fetchActividades = async () => {
    try {
      const { data } = await api.get('/actividades');
      setActividades(data);
    } catch (error) {
      console.error('Error fetching activities', error);
    }
  };

  useEffect(() => {
    const fetchStatsAndActividades = async () => {
      try {
        const [{ data: statsData }] = await Promise.all([
          api.get('/stats/dashboard'),
          fetchActividades(),
        ]);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatsAndActividades();
  }, []);

  const handleDayClick = (day) => {
    const clickedDate = new Date(year, month, day);
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setSelectedDay({
      day,
      date: clickedDate,
      dateString: dayStr,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormTitulo('');
    setFormHora('12:00');
    setFormDescripcion('');
    setFormTipo('interna');
    setFormUbicacion('galeria');
    setEditingActividadId(null);
  };

  const handleEditClick = (act) => {
    const actDate = new Date(act.fecha);
    const hours = String(actDate.getHours()).padStart(2, '0');
    const minutes = String(actDate.getMinutes()).padStart(2, '0');
    
    setEditingActividadId(act.id);
    setFormTitulo(act.titulo);
    setFormHora(`${hours}:${minutes}`);
    setFormDescripcion(act.descripcion || '');
    setFormTipo(act.tipo);
    setFormUbicacion(act.ubicacion);
  };

  const handleDeleteActividad = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta actividad?')) return;
    try {
      await api.delete(`/actividades/${id}`);
      await fetchActividades();
      resetForm();
    } catch (err) {
      console.error('Error deleting activity', err);
    }
  };

  const handleSaveActividad = async (e) => {
    e.preventDefault();
    if (!formTitulo.trim() || !selectedDay) return;

    const [hours, minutes] = formHora.split(':');
    const actDate = new Date(selectedDay.date);
    actDate.setHours(parseInt(hours, 10));
    actDate.setMinutes(parseInt(minutes, 10));
    actDate.setSeconds(0);
    actDate.setMilliseconds(0);

    const payload = {
      titulo: formTitulo,
      descripcion: formDescripcion,
      fecha: actDate.toISOString(),
      tipo: formTipo,
      ubicacion: formUbicacion,
    };

    try {
      if (editingActividadId) {
        await api.patch(`/actividades/${editingActividadId}`, payload);
      } else {
        await api.post('/actividades', payload);
      }
      resetForm();
      await fetchActividades();
    } catch (err) {
      console.error('Error saving activity', err);
    }
  };

  const locationColors = {
    galeria: 'bg-pink-500',
    audioteca: 'bg-cyan-500',
    auditorio: 'bg-amber-500',
  };

  // Filter activities for the selected day in real-time
  const modalActividades = selectedDay ? actividades.filter(act => {
    const actDate = new Date(act.fecha);
    const actStr = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}-${String(actDate.getDate()).padStart(2, '0')}`;
    return actStr === selectedDay.dateString;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
      </div>
    );
  }

  // Common SVG flower emblem helper to match the government identity
  const SvgFlowerEmblem = ({ className = "w-16 h-16" }) => (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Center Diamond */}
      <path d="M 50 42 L 58 50 L 50 58 L 42 50 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="3.5" fill="#D4AF37" />
      
      {/* North Petal */}
      <path d="M 50 42 C 45 31, 40 37, 50 25 C 60 37, 55 31, 50 42 Z" fill="currentColor" />
      <circle cx="50" cy="20" r="2.5" fill="#D4AF37" />

      {/* South Petal */}
      <path d="M 50 58 C 45 69, 40 63, 50 75 C 60 63, 55 69, 50 58 Z" fill="currentColor" />
      <circle cx="50" cy="80" r="2.5" fill="#D4AF37" />

      {/* East Petal */}
      <path d="M 58 50 C 69 45, 63 40, 75 50 C 63 60, 69 55, 58 50 Z" fill="currentColor" />
      <circle cx="80" cy="50" r="2.5" fill="#D4AF37" />

      {/* West Petal */}
      <path d="M 42 50 C 31 45, 37 40, 25 50 C 37 60, 31 55, 42 50 Z" fill="currentColor" />
      <circle cx="20" cy="50" r="2.5" fill="#D4AF37" />

      {/* Diagonals */}
      <path d="M 56 44 L 66 34 M 62 34 L 66 34 L 66 38" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 44 44 L 34 34 M 38 34 L 34 34 L 34 38" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 56 56 L 66 66 M 62 66 L 66 66 L 66 62" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 44 56 L 34 66 M 38 66 L 34 66 L 34 62" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Header principal con título */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white/90">Dashboard</h1>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Alumnos Activos" value={stats?.alumnosInscritos || 0} color="pink" />
        <KpiCard title="Ingresos Totales" value={`$${stats?.ingresosTotales || 0}`} color="emerald" />
        <KpiCard title="Talleres Activos" value={stats?.talleresActivos || 0} color="cyan" />
      </div>

      {/* Calendario y Próximas Clases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white/90">Calendario de Actividades</h2>
            <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-black">
              {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </span>
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
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              const dayActividades = actividades.filter(act => {
                const actDate = new Date(act.fecha);
                const actStr = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}-${String(actDate.getDate()).padStart(2, '0')}`;
                return actStr === dayStr;
              });

              return (
                <div 
                  key={day} 
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-300 group cursor-pointer pb-2
                    ${isToday 
                      ? 'bg-pink-600 border-pink-500 shadow-lg shadow-pink-600/20 scale-105 z-10' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-white/60'}`}>{day}</span>
                  
                  {/* Indicators for scheduled activities */}
                  {dayActividades.length > 0 && (
                    <div className="absolute bottom-1.5 flex gap-1 justify-center w-full">
                      {dayActividades.slice(0, 3).map((act, idx) => (
                        <span 
                          key={act.id || idx} 
                          className={`w-1.5 h-1.5 rounded-full ${locationColors[act.ubicacion] || 'bg-white/40'}`}
                          title={`${act.titulo} (${act.tipo})`}
                        />
                      ))}
                      {dayActividades.length > 3 && (
                        <span className="text-[8px] text-white/50 leading-none font-bold">+</span>
                      )}
                    </div>
                  )}
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

      {/* Modal for Day Activities management */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }} 
        title={selectedDay ? `Actividades - ${selectedDay.day} de ${new Date(year, month, selectedDay.day).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}` : ''}
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar text-left">
          {/* List of current activities */}
          <div>
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3">Actividades Programadas</h3>
            {modalActividades.length === 0 ? (
              <p className="text-sm text-white/40 italic py-2">No hay actividades para este día.</p>
            ) : (
              <div className="space-y-3">
                {modalActividades.map((act) => {
                  const actTime = new Date(act.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
                  const borderCol = act.ubicacion === 'galeria' 
                    ? 'border-pink-500/50' 
                    : act.ubicacion === 'audioteca' 
                    ? 'border-cyan-500/50' 
                    : 'border-amber-500/50';

                  const typeCol = act.tipo === 'interna'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-violet-500/10 text-violet-400 border-violet-500/20';

                  return (
                    <div key={act.id} className={`p-4 bg-white/5 border-l-4 ${borderCol} rounded-xl border border-white/5 flex justify-between items-start gap-4 transition hover:bg-white/10`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${typeCol}`}>
                            {act.tipo}
                          </span>
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {act.ubicacion.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-bold text-white/90 text-sm">{act.titulo}</h4>
                        {act.descripcion && <p className="text-xs text-white/50 mt-1 leading-relaxed">{act.descripcion}</p>}
                        <div className="text-[10px] text-white/40 font-semibold mt-2 flex items-center gap-1">
                          <Clock size={10} /> {actTime} hrs
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button 
                          onClick={() => handleEditClick(act)}
                          className="p-2 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg border border-transparent hover:border-cyan-500/30 transition-all duration-300"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteActividad(act.id)}
                          className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg border border-transparent hover:border-rose-500/30 transition-all duration-300"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Separator line */}
          <div className="border-t border-white/10 my-4" />

          {/* Form to Create/Edit */}
          <form onSubmit={handleSaveActividad} className="space-y-4">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">
              {editingActividadId ? 'Editar Actividad' : 'Nueva Actividad'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Título</label>
                <input 
                  type="text" 
                  value={formTitulo} 
                  onChange={(e) => setFormTitulo(e.target.value)} 
                  required
                  placeholder="Ej. Exposición Fotográfica"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all placeholder-white/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Hora</label>
                <input 
                  type="time" 
                  value={formHora} 
                  onChange={(e) => setFormHora(e.target.value)} 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Ubicación</label>
                <select 
                  value={formUbicacion} 
                  onChange={(e) => setFormUbicacion(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all cursor-pointer"
                >
                  <option value="galeria">Galería</option>
                  <option value="audioteca">Audioteca</option>
                  <option value="auditorio">Auditorio</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Tipo</label>
                <select 
                  value={formTipo} 
                  onChange={(e) => setFormTipo(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all cursor-pointer"
                >
                  <option value="interna">Interna</option>
                  <option value="externa">Externa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Descripción (Opcional)</label>
              <textarea 
                value={formDescripcion} 
                onChange={(e) => setFormDescripcion(e.target.value)} 
                placeholder="Detalles sobre el evento..."
                rows="2"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all resize-none placeholder-white/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editingActividadId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition text-xs border border-white/5"
                >
                  Cancelar Edición
                </button>
              )}
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition text-xs shadow-lg shadow-pink-600/20"
              >
                {editingActividadId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* printable section (Visible only during print preview / PDF download) */}
      {createPortal(
        <div id="print-section">
          {/* Top colorful bars */}
          <div className="flex h-2.5 w-full">
            <div className="bg-[#4D8C3E] w-1/3"></div>
            <div className="bg-[#F29C38] w-1/3"></div>
            <div className="bg-[#8A244E] w-1/3"></div>
          </div>

          <div className="p-16 relative bg-white select-text">
            {/* Faded Watermark in background */}
            <div className="watermark-print opacity-[0.03] pointer-events-none select-none">
              <SvgFlowerEmblem className="w-[600px] h-[600px] text-[#801D38]" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header Block */}
              <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
                {/* Tlaxcala Logo */}
                <div className="text-center flex flex-col items-center select-none">
                  <SvgFlowerEmblem className="w-14 h-14 text-[#801D38]" />
                  <div className="text-[#801D38] font-black text-lg tracking-[0.2em] leading-none mt-2">TLAXCALA</div>
                  <div className="text-[8px] font-black text-[#D4AF37] tracking-[0.1em] mt-1.5">UNA NUEVA HISTORIA</div>
                  <div className="text-[7px] font-bold text-neutral-400 tracking-[0.2em] mt-0.5">2021 - 2027</div>
                </div>

                {/* Centro Cultural Metadata */}
                <div className="text-right text-[10px] text-neutral-600 leading-normal font-sans">
                  <p className="font-bold text-neutral-900 text-xs uppercase tracking-tight">Centro Cultural Huamantla</p>
                  <p>Parque Juárez No.14</p>
                  <p>Tel: 2 47 47 2 13 11</p>
                  <p className="font-semibold text-[#801D38] mt-1">Área: Coordinación</p>
                </div>
              </div>

              {/* Asunto & Date Block */}
              <div className="text-right text-xs space-y-1 pt-2 font-sans">
                <p className="font-bold text-neutral-900">Asunto: <span className="font-medium text-neutral-700">Reporte General de Actividades</span></p>
                <p className="text-neutral-500">Huamantla, Tlax., a {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Recipient Block */}
              <div className="text-xs pt-4 font-sans">
                <p className="font-black text-neutral-900 uppercase">C. COORDINADOR DEL CENTRO CULTURAL HUAMANTLA</p>
                <p className="font-black text-[#801D38] tracking-[0.2em] mt-1">P R E S E N T E .</p>
              </div>

              {/* Body Intro */}
              <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-8 pt-2 font-sans">
                Por medio de la presente, se hace entrega del reporte oficial correspondiente a las actividades, talleres y eventos internos y externos programados en las distintas áreas de este Centro Cultural (Galería, Audioteca y Auditorio). A continuación se muestra la relación detallada de los registros actuales:
              </p>

              {/* Activities Table */}
              <div className="pt-4">
                <table className="w-full text-left text-[10px] border-collapse border border-neutral-300 font-sans">
                  <thead>
                    <tr className="bg-[#801D38] text-white font-bold uppercase tracking-wider text-[9px]">
                      <th className="border border-neutral-300 p-2.5">Título</th>
                      <th className="border border-neutral-300 p-2.5">Fecha y Hora</th>
                      <th className="border border-neutral-300 p-2.5">Tipo</th>
                      <th className="border border-neutral-300 p-2.5">Ubicación</th>
                      <th className="border border-neutral-300 p-2.5">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {actividades.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-neutral-400 italic">No se encuentran actividades registradas en el sistema.</td>
                      </tr>
                    ) : (
                      actividades.map((act) => {
                        const actDate = new Date(act.fecha);
                        const dateStr = actDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
                        const timeStr = actDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
                        
                        return (
                          <tr key={act.id} className="hover:bg-neutral-50/50">
                            <td className="border border-neutral-300 p-2.5 font-bold text-neutral-900">{act.titulo}</td>
                            <td className="border border-neutral-300 p-2.5 text-neutral-600 whitespace-nowrap">{dateStr} - {timeStr} hrs</td>
                            <td className="border border-neutral-300 p-2.5">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                act.tipo === 'interna' 
                                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                                  : 'bg-violet-500/10 text-violet-700 border border-violet-500/20'
                              }`}>
                                {act.tipo}
                              </span>
                            </td>
                            <td className="border border-neutral-300 p-2.5 uppercase font-bold text-[#801D38]">{act.ubicacion}</td>
                            <td className="border border-neutral-300 p-2.5 text-neutral-500 leading-normal max-w-xs">{act.descripcion || 'Sin descripción'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Atentamente sign-off */}
              <div className="pt-16 text-center text-xs space-y-14 font-sans">
                <p className="font-bold text-neutral-700 uppercase tracking-widest">A t e n t a m e n t e</p>
                <div>
                  <p className="font-bold text-neutral-950">Mtro. Manuel de la Vega Moreno</p>
                  <p className="text-neutral-500">Coordinador de Centro Cultural Huamantla</p>
                </div>
              </div>
            </div>

            {/* Footer Block */}
            <div className="border-t border-neutral-200 pt-6 flex justify-between items-center text-[8px] text-neutral-400 z-10 font-sans">
              <p>c. c. p. Archivo / Centro Cultural Huamantla</p>
              {/* SC Logo */}
              <div className="flex items-center gap-2 select-none">
                <div className="text-left leading-none">
                  <span className="font-black text-[12px] text-[#801D38] tracking-tighter">SC</span>
                  <span className="text-[6px] font-bold block text-neutral-500 tracking-tight">SECRETARÍA DE CULTURA</span>
                </div>
                <SvgFlowerEmblem className="w-5 h-5 text-[#801D38]" />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
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
      className="flex flex-col gap-2 bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden text-left"
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
