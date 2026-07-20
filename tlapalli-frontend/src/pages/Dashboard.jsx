import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, Edit3, Clock, MapPin, Download, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, CalendarX, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import MapaHuamantla from '../components/MapaHuamantla';

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
  const [formUbicacionOtro, setFormUbicacionOtro] = useState('');
  const [editingActividadId, setEditingActividadId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [openFormDropdown, setOpenFormDropdown] = useState(null); // 'ubicacion' | 'tipo' | null
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actividadToDelete, setActividadToDelete] = useState(null);

  // Calendar navigation state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    const closeDropdowns = (event) => {
      if (!event.target.closest('[data-filter-dropdown]')) {
        setOpenFormDropdown(null);
      }
    };
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  // Lógica para el calendario
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Dom, 1 = Lun, etc.
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const prevMonth = () => {
    setCurrentMonth(m => {
      if (m === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(m => {
      if (m === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Keyboard navigation for calendar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevMonth();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextMonth();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMonth, currentYear]);

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
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
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
    setFormUbicacionOtro('');
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
    const isDefaultUbicacion = ['galeria', 'audioteca', 'auditorio'].includes(act.ubicacion.toLowerCase());
    if (isDefaultUbicacion) {
      setFormUbicacion(act.ubicacion.toLowerCase());
      setFormUbicacionOtro('');
    } else {
      setFormUbicacion('otro');
      setFormUbicacionOtro(act.ubicacion);
    }
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleDeleteActividad = (id) => {
    setActividadToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteActividad = async () => {
    if (!actividadToDelete) return;
    try {
      await api.delete(`/actividades/${actividadToDelete}`);
      await fetchActividades();
      resetForm();
    } catch (err) {
      console.error('Error deleting activity', err);
    } finally {
      setActividadToDelete(null);
    }
  };

  const handleSaveActividad = async (e) => {
    e.preventDefault();
    
    const missing = [];
    if (!formTitulo.trim()) missing.push('Título');
    if (!formHora) missing.push('Hora');
    const actualUbicacion = formUbicacion === 'otro' ? formUbicacionOtro.trim() : formUbicacion;
    if (!actualUbicacion) missing.push('Ubicación');
    if (!formTipo) missing.push('Tipo');
    if (!selectedDay) missing.push('Día');
    
    if (missing.length > 0) {
      setSaveError(`Completa los campos: ${missing.join(', ')}`);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

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
      ubicacion: actualUbicacion,
    };

    try {
      if (editingActividadId) {
        await api.patch(`/actividades/${editingActividadId}`, payload);
        setSaveSuccess('Actividad actualizada correctamente');
      } else {
        await api.post('/actividades', payload);
        setSaveSuccess('Actividad creada correctamente');
      }
      resetForm();
      await fetchActividades();
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving activity', err);
      setSaveError(err.response?.data?.message || 'Error al guardar la actividad');
    } finally {
      setSaving(false);
    }
  };

  const locationColors = {
    galeria: 'bg-rose-500',
    audioteca: 'bg-sky-400',
    auditorio: 'bg-amber-400',
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
        <KpiCard 
          title="Alumnos Activos" 
          value={stats?.alumnosInscritos || 0} 
          color="pink"
        />
        <KpiCard 
          title="Ingresos del Mes" 
          value={`$${Number(stats?.comparativas?.ingresosMes?.actual || 0).toLocaleString('es-MX')}`} 
          color="emerald"
          trend={stats?.comparativas?.ingresosMes}
          trendLabel="vs mes pasado"
          isCurrency
        />
        <KpiCard 
          title="Inscripciones Nuevas" 
          value={stats?.comparativas?.inscripcionesNuevas?.actual || 0} 
          color="cyan"
          trend={stats?.comparativas?.inscripcionesNuevas}
          trendLabel="vs mes pasado"
        />
      </div>

      {/* Mapa de Huamantla y Distribución de Alumnos */}
      <MapaHuamantla datosBarrios={stats?.alumnosPorBarrio || []} />

      {/* Calendario y Próximas Clases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-800/80 border border-white/15 rounded-3xl p-4 md:p-8 shadow-2xl shadow-black/30 flex flex-col">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">📅 Calendario</h2>
            <div className="flex items-center gap-2.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800/95 border border-white/15 hover:border-emerald-400/40 text-white/50 hover:text-emerald-400 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
                title="Mes anterior (←)"
              >
                <ChevronLeft size={18} />
              </button>
              <h3 className="text-sm md:text-base font-black text-white/90 uppercase tracking-[0.15em] min-w-[130px] text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {new Date(currentYear, currentMonth).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800/95 border border-white/15 hover:border-emerald-400/40 text-white/50 hover:text-emerald-400 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
                title="Mes siguiente (→)"
              >
                <ChevronRight size={18} />
              </button>
              {(currentMonth !== today.getMonth() || currentYear !== today.getFullYear()) && (
                <button
                  onClick={goToToday}
                  className="ml-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-pink-400/30 text-white text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-lg shadow-pink-600/20"
                  title="Ir al mes actual"
                >
                  Hoy
                </button>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mb-5 bg-slate-900/95 border border-white/15 rounded-2xl p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center justify-center gap-2 bg-rose-500/10 rounded-xl px-2 py-2 border border-rose-500/20 shadow-inner shadow-rose-500/5">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                <span className="text-xs font-bold text-rose-300">Galería</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-sky-500/10 rounded-xl px-2 py-2 border border-sky-400/20 shadow-inner shadow-sky-400/5">
                <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
                <span className="text-xs font-bold text-sky-300">Audioteca</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-amber-500/10 rounded-xl px-2 py-2 border border-amber-400/20 shadow-inner shadow-amber-400/5">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                <span className="text-xs font-bold text-amber-300">Auditorio</span>
              </div>
            </div>
          </div>
          
          {/* Visual Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[9px] md:text-[11px] font-black text-white/30 uppercase py-1.5 md:py-2 tracking-wider">{d}</div>
            ))}
            
            {padding.map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = selectedDay?.day === day && selectedDay?.dateString === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              const dayActividades = actividades.filter(act => {
                const actDate = new Date(act.fecha);
                const actStr = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}-${String(actDate.getDate()).padStart(2, '0')}`;
                return actStr === dayStr;
              });

              return (
                <motion.div 
                  key={day} 
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDayClick(day)}
                  title={dayActividades.length > 0 ? dayActividades.map(a => `${a.titulo} — ${a.ubicacion}`).join('\n') : undefined}
                  className={`aspect-square rounded-xl md:rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer pb-1 md:pb-2 select-none
                    ${isToday 
                      ? 'bg-gradient-to-br from-pink-600 to-rose-700 border-pink-400 shadow-xl shadow-pink-600/30 scale-105 z-10' 
                      : isSelected
                      ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-white/40 shadow-lg shadow-white/10 scale-105 z-10'
                      : 'bg-slate-800/80 border-slate-800/80 hover:bg-slate-800/90 hover:border-white/25 hover:shadow-lg hover:shadow-black/20'}`}
                >
                  {/* Glow effect for today */}
                  {isToday && (
                    <>
                      <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-pink-400/20 to-rose-600/20 animate-pulse" />
                      <span className="absolute -top-0.5 md:-top-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </>
                  )}
                  {/* Selected indicator */}
                  {isSelected && !isToday && (
                    <span className="absolute -top-0.5 md:-top-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                  )}
                  <span className={`text-[11px] md:text-sm font-black leading-none ${isToday || isSelected ? 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]' : 'text-white/70 group-hover:text-white/90'}`}>{day}</span>
                  
                  {/* Indicators for scheduled activities */}
                  {dayActividades.length > 0 && (
                    <div className="absolute bottom-1 md:bottom-2 flex gap-1 justify-center w-full items-center">
                      {dayActividades.length === 1 ? (
                        <span 
                          className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ring-1 ring-white/20 ${locationColors[dayActividades[0].ubicacion.toLowerCase()] || 'bg-emerald-400'}`}
                        />
                      ) : dayActividades.length <= 3 ? (
                        dayActividades.map((act, idx) => (
                          <span 
                            key={act.id || idx} 
                            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ring-1 ring-white/10 ${locationColors[act.ubicacion.toLowerCase()] || 'bg-emerald-400'}`}
                          />
                        ))
                      ) : (
                        <span className={`text-[7px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full ring-1 ring-white/20 ${locationColors[dayActividades[0].ubicacion.toLowerCase()] || 'bg-emerald-400'} text-black/90 leading-none`}>
                          +{dayActividades.length}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Panel de Actividades del Día Seleccionado */}
        <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-4 md:p-8 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white/90">
              {selectedDay ? `Actividades del ${selectedDay.day}` : 'Actividades de Hoy'}
            </h2>
            <span className="px-2 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] md:text-[10px] font-black uppercase">
              {selectedDay 
                ? new Date(selectedDay.date).toLocaleDateString('es-MX', { weekday: 'short' })
                : new Date().toLocaleDateString('es-MX', { weekday: 'short' })
              }
            </span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {(() => {
              const targetDayStr = selectedDay 
                ? selectedDay.dateString 
                : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const panelActs = actividades.filter(act => {
                const actDate = new Date(act.fecha);
                const actStr = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}-${String(actDate.getDate()).padStart(2, '0')}`;
                return actStr === targetDayStr;
              });
              
              if (panelActs.length > 0) {
                return panelActs.map((act) => {
                  const actTime = new Date(act.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
                  const borderCol = act.ubicacion.toLowerCase() === 'galeria' 
                    ? 'border-l-rose-500/60' 
                    : act.ubicacion.toLowerCase() === 'audioteca' 
                    ? 'border-l-sky-400/60' 
                    : act.ubicacion.toLowerCase() === 'auditorio'
                    ? 'border-l-amber-400/60'
                    : 'border-l-emerald-400/60';
                  const typeLabel = act.tipo === 'interna' ? 'Interna' : 'Externa';
                  const typeBadge = act.tipo === 'interna'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-violet-500/10 text-violet-400 border-violet-500/20';

                  return (
                    <div key={act.id} className={`flex flex-col gap-1 bg-slate-800/80 p-4 rounded-2xl border border-white/15 border-l-4 ${borderCol} hover:bg-slate-800/90 transition-all duration-300`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${typeBadge}`}>
                          {typeLabel}
                        </span>
                        <span className="text-[10px] text-white/40 font-bold flex items-center gap-1">
                          <Clock size={10} /> {actTime} hrs
                        </span>
                      </div>
                      <p className="font-bold text-white/90 text-sm mt-1">{act.titulo}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> {act.ubicacion}
                      </p>
                    </div>
                  );
                });
              }
              
              return (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <CalendarX size={32} className="text-white/20 mb-3" />
                  <p className="text-sm text-white/30 font-bold">
                    {selectedDay ? 'No hay actividades este día' : 'No hay actividades hoy'}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setActividadToDelete(null);
        }}
        onConfirm={confirmDeleteActividad}
        title="Eliminar Actividad"
        message="¿Seguro que deseas eliminar esta actividad? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal for Day Activities management */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }} 
        title={selectedDay ? `Actividades - ${selectedDay.day} de ${new Date(currentYear, currentMonth, selectedDay.day).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}` : ''}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 text-left">
          {/* List of current activities */}
          <div>
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">Actividades Programadas</h3>
            {modalActividades.length === 0 ? (
              <p className="text-sm text-white/40 italic py-1">No hay actividades para este día.</p>
            ) : (
              <div className="space-y-3">
                {modalActividades.map((act) => {
                  const actTime = new Date(act.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
                  const borderCol = act.ubicacion.toLowerCase() === 'galeria' 
                    ? 'border-rose-500/50' 
                    : act.ubicacion.toLowerCase() === 'audioteca' 
                    ? 'border-sky-400/50' 
                    : act.ubicacion.toLowerCase() === 'auditorio'
                    ? 'border-amber-400/50'
                    : 'border-emerald-500/50';

                  const typeCol = act.tipo === 'interna'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-violet-500/10 text-violet-400 border-violet-500/20';

                  return (
                    <div key={act.id} className={`p-4 bg-slate-800/80 border-l-4 ${borderCol} rounded-xl border border-white/15 flex justify-between items-start gap-4 transition hover:bg-slate-800/90`}>
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
          <div className="border-t border-white/15 my-4" />

          {/* Form to Create/Edit */}
          <form onSubmit={handleSaveActividad} className="space-y-3">
            {saveSuccess && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
                {saveSuccess}
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-3 rounded-xl bg-rose-950/60 border border-rose-500/30 p-3">
                <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                <p className="text-xs font-bold text-rose-300">{saveError}</p>
              </div>
            )}
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">
              {editingActividadId ? 'Editar Actividad' : 'Nueva Actividad'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1 block">Título *</label>
                <input 
                  type="text" 
                  value={formTitulo} 
                  onChange={(e) => setFormTitulo(e.target.value)} 
                  placeholder="Ej. Exposición Fotográfica"
                  className="w-full bg-slate-900/95 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all placeholder-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1 block">Hora *</label>
                <input 
                  type="time" 
                  value={formHora} 
                  onChange={(e) => setFormHora(e.target.value)} 
                  required
                  className="w-full bg-slate-900/95 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all"
                />
              </div>

              <FormDropdown
                label="Ubicación *"
                value={formUbicacion}
                options={[
                  { value: 'galeria', label: '🎨 Galería' },
                  { value: 'audioteca', label: '🎧 Audioteca' },
                  { value: 'auditorio', label: '🎭 Auditorio' },
                  { value: 'otro', label: '➕ Otro...' },
                ]}
                isOpen={openFormDropdown === 'ubicacion'}
                onToggle={() => setOpenFormDropdown(openFormDropdown === 'ubicacion' ? null : 'ubicacion')}
                onChange={(value) => {
                  setFormUbicacion(value);
                  setOpenFormDropdown(null);
                }}
              />

              <FormDropdown
                label="Tipo *"
                value={formTipo}
                options={[
                  { value: 'interna', label: '🏢 Interna' },
                  { value: 'externa', label: '🌍 Externa' },
                ]}
                isOpen={openFormDropdown === 'tipo'}
                onToggle={() => setOpenFormDropdown(openFormDropdown === 'tipo' ? null : 'tipo')}
                onChange={(value) => {
                  setFormTipo(value);
                  setOpenFormDropdown(null);
                }}
              />

              {formUbicacion === 'otro' && (
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1 block">Especificar Ubicación *</label>
                  <input 
                    type="text" 
                    value={formUbicacionOtro} 
                    onChange={(e) => setFormUbicacionOtro(e.target.value)} 
                    placeholder="Ej. Patio Central"
                    required
                    className="w-full bg-slate-900/95 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all placeholder-white/30"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1 block">Descripción (Opcional)</label>
              <textarea 
                value={formDescripcion} 
                onChange={(e) => setFormDescripcion(e.target.value)} 
                placeholder="Detalles sobre el evento..."
                rows="2"
                className="w-full bg-slate-900/95 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all resize-none placeholder-white/30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              {editingActividadId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800/90 text-white font-bold rounded-xl transition text-xs border border-white/15 hover:border-white/20"
                >
                  Cancelar
                </button>
              )}
              <button 
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-500/50 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider text-xs rounded-xl transition shadow-lg shadow-pink-600/20 flex items-center gap-2"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                ) : editingActividadId ? (
                  <><Edit3 size={14} /> Actualizar</>
                ) : (
                  <><Plus size={14} /> Guardar</>
                )}
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
            <div className="watermark-print opacity-30 pointer-events-none select-none">
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

function KpiCard({ title, value, color, trend, trendLabel, isCurrency }) {
  const colorClasses = {
    pink: 'bg-pink-500/90 border-pink-400/40 text-white hover:shadow-pink-500/20',
    emerald: 'bg-emerald-500/90 border-emerald-400/40 text-white hover:shadow-emerald-500/20',
    amber: 'bg-amber-500/90 border-amber-400/40 text-white hover:shadow-amber-500/20',
    sky: 'bg-sky-500/90 border-sky-400/40 text-white hover:shadow-sky-500/20',
  };

  const trendValue = trend ? trend.actual - trend.anterior : 0;
  const trendPercent = trend && trend.anterior > 0 
    ? Math.round((trend.actual / trend.anterior - 1) * 100)
    : trend && trend.actual > 0
    ? 100
    : 0;
  const isPositive = trendValue >= 0;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl p-6 border ${colorClasses[color]} shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative group`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-800/80 rounded-full blur-2xl group-hover:bg-slate-800/90 transition-all" />
      <p className="text-sm opacity-60 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-black mt-2 tracking-tighter">{value}</p>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${isPositive ? 'text-emerald-400' : trendValue === 0 ? 'text-white/40' : 'text-rose-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : trendValue === 0 ? <Minus size={14} /> : <TrendingDown size={14} />}
          <span>
            {isCurrency 
              ? `$${Math.abs(trendValue).toLocaleString('es-MX')}` 
              : `${Math.abs(trendValue)}`}
            {trend.anterior > 0 && ` (${isPositive ? '+' : ''}${trendPercent}%)`}
            {' '}
            {trendLabel}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function ClaseItem({ name, instructor }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-2 bg-slate-800/80 p-5 rounded-2xl border border-white/15 hover:bg-slate-800/90 hover:border-white/20 transition-all duration-500 group relative overflow-hidden text-left"
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

function FormDropdown({ label, value, options, isOpen, onToggle, onChange }) {
  const selected = options.find(option => option.value === value) || options[0];

  return (
    <div data-filter-dropdown className="relative w-full">
      <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2 block">{label}</label>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-slate-900/85 px-5 py-3 text-left text-sm text-white shadow-inner shadow-black/20 outline-none transition hover:border-white/30 hover:bg-black/35 focus:border-pink-500/50"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown size={14} className={`shrink-0 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-[999] mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-pink-500/25 bg-slate-950 p-1.5 shadow-2xl shadow-black/60">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                option.value === value
                  ? 'bg-pink-500/15 text-pink-400'
                  : 'text-white/70 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
