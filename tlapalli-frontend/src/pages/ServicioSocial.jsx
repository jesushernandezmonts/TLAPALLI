import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Search, Trash2, Eye, Loader2, HeartHandshake,
  Target, User, Calendar, CheckCircle2, AlertCircle, X,
  BookOpen, TrendingUp, BarChart3, Clock, CheckCircle, ThumbsUp, ThumbsDown,
  Users, Ban
} from 'lucide-react';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';

function ServicioSocial() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [addHorasOpen, setAddHorasOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('lista');

  // Actividades pendientes
  const [pendientes, setPendientes] = useState([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);

  // Form para nuevo registro
  const [newSS, setNewSS] = useState({
    alumnoId: '',
    horasRequeridas: 480,
    institucion: '',
    programa: '',
    supervisor: '',
    observaciones: '',
  });

  // Form para agregar horas
  const [newActividad, setNewActividad] = useState({
    servicioSocialId: '',
    horas: '',
    descripcion: '',
    comentarios: '',
  });

  useEffect(() => {
    fetchData();
    fetchAlumnos();
  }, []);

  useEffect(() => {
    if (activeTab === 'pendientes') {
      fetchPendientes();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [recordsRes, statsRes] = await Promise.all([
        api.get('/servicio-social'),
        api.get('/servicio-social/stats'),
      ]);
      setRecords(recordsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendientes = async () => {
    setLoadingPendientes(true);
    try {
      const { data } = await api.get('/servicio-social/actividades/pendientes');
      setPendientes(data);
    } catch (err) {
      console.error('Error fetching pendientes', err);
    } finally {
      setLoadingPendientes(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const { data } = await api.get('/alumnos');
      setAlumnos(data);
    } catch (err) {
      console.error('Error fetching alumnos', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/servicio-social', {
        ...newSS,
        alumnoId: parseInt(newSS.alumnoId),
        horasRequeridas: parseInt(newSS.horasRequeridas),
      });
      setCreateOpen(false);
      setNewSS({ alumnoId: '', horasRequeridas: 480, institucion: '', programa: '', supervisor: '', observaciones: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear registro');
    }
  };

  const handleAddHoras = async (e) => {
    e.preventDefault();
    try {
      await api.post('/servicio-social/actividades', {
        ...newActividad,
        servicioSocialId: parseInt(newActividad.servicioSocialId),
        horas: parseInt(newActividad.horas),
      });
      setAddHorasOpen(false);
      setNewActividad({ servicioSocialId: '', horas: '', descripcion: '', comentarios: '' });
      if (selectedRecord) {
        const { data } = await api.get(`/servicio-social/${selectedRecord.id}`);
        setSelectedRecord(data);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar horas');
    }
  };

  const handleAprobar = async (id) => {
    try {
      await api.patch(`/servicio-social/actividades/${id}/aprobar`);
      fetchPendientes();
      if (selectedRecord) {
        const { data } = await api.get(`/servicio-social/${selectedRecord.id}`);
        setSelectedRecord(data);
      }
      fetchData();
    } catch (err) {
      alert('Error al aprobar');
    }
  };

  const handleRechazar = async (id) => {
    try {
      await api.patch(`/servicio-social/actividades/${id}/rechazar`);
      fetchPendientes();
    } catch (err) {
      alert('Error al rechazar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro de servicio social?')) return;
    try {
      await api.delete(`/servicio-social/${id}`);
      setDetailOpen(false);
      setSelectedRecord(null);
      fetchData();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleDeleteActividad = async (id) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return;
    try {
      await api.delete(`/servicio-social/actividades/${id}`);
      if (selectedRecord) {
        const { data } = await api.get(`/servicio-social/${selectedRecord.id}`);
        setSelectedRecord(data);
      }
      fetchData();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const openDetail = async (id) => {
    try {
      const { data } = await api.get(`/servicio-social/${id}`);
      setSelectedRecord(data);
      setDetailOpen(true);
    } catch (err) {
      console.error('Error fetching detail', err);
    }
  };

  const openAddHoras = (id) => {
    setNewActividad({ ...newActividad, servicioSocialId: id.toString() });
    setAddHorasOpen(true);
  };

  const handleUpdateStatus = async (id, estatus) => {
    try {
      await api.patch(`/servicio-social/${id}`, { estatus });
      if (selectedRecord?.id === id) {
        setSelectedRecord({ ...selectedRecord, estatus });
      }
      fetchData();
    } catch (err) {
      alert('Error al actualizar estatus');
    }
  };

  const filteredRecords = records.filter(r => {
    const name = `${r.alumno?.nombre || ''} ${r.alumno?.apellidoPaterno || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const statusColors = {
    en_curso: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    suspendido: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    baja: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusLabels = {
    en_curso: 'En curso',
    completado: 'Completado',
    suspendido: 'Suspendido',
    baja: 'Baja',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-pink-500" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Servicio Social
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Gestiona el servicio social de los alumnos
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer ring-1 ring-amber-300/20">
          <Plus size={16} /> Nuevo Registro
        </button>
      </div>

      {/* Stats Cards con glassmorphism premium como Instructores */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Total" value={stats.total} color="white" />
          <StatCard icon={TrendingUp} label="En curso" value={stats.enCurso} color="amber" />
          <StatCard icon={CheckCircle2} label="Completados" value={stats.completados} color="emerald" />
          <StatCard icon={AlertCircle} label="Suspendidos" value={stats.suspendidos} color="rose" />
          <StatCard icon={Ban} label="Bajas" value={stats.bajas} color="rose" />
        </div>
      )}

      {/* Barra de Controles Unificada en Glassmorphic — buscador + tabs */}
      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/20 bg-slate-950/45 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl ring-1 ring-white/5 mt-2">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por alumno..."
          onClear={() => {}}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Tab: Registros */}
          <button
            onClick={() => setActiveTab('lista')}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'lista'
                ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-600/10 ring-1 ring-amber-500/20'
                : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 border border-white/10 hover:border-white/20'
            }`}
          >
            <BarChart3 size={16} />
            Registros
          </button>

          {/* Tab: Pendientes */}
          <button
            onClick={() => setActiveTab('pendientes')}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pendientes'
                ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-600/10 ring-1 ring-amber-500/20'
                : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 border border-white/10 hover:border-white/20'
            }`}
          >
            <Clock size={16} />
            Pendientes
            {pendientes.length > 0 && (
              <AnimatePresence>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-[9px] font-black text-amber-400"
                >
                  {pendientes.length}
                </motion.span>
              </AnimatePresence>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'lista' && (
        <>
          {/* Tabla de Registros con responsive-table */}
          <div className="responsive-table-container relative z-10 mt-2">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th className="hidden sm:table-cell">Progreso</th>
                  <th>Estatus</th>
                  <th className="hidden lg:table-cell">Actividades</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan="5" className="p-20 text-center text-white/20 italic font-medium">No hay registros de servicio social.</td></tr>
                ) : (
                  filteredRecords.map(r => {
                    const progreso = Math.min(100, Math.round((r.horasCompletadas / r.horasRequeridas) * 100));
                    return (
                      <tr key={r.id} className="hover:bg-white/5 transition group">
                        <td data-label="Alumno">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                              <User size={20} className="text-amber-400" />
                            </div>
                            <div>
                              <div className="font-bold text-white/90 drop-shadow-sm">{r.alumno?.nombre} {r.alumno?.apellidoPaterno}</div>
                              <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">{r.institucion || 'Sin institución'}</div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Progreso" className="hidden sm:table-cell">
                          <div className="flex items-center gap-3 min-w-[140px]">
                            <div className="flex-1 bg-white/10 rounded-full h-2.5 max-w-[120px] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progreso}%` }}
                                className={`h-full rounded-full transition-all ${
                                  progreso >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                                }`}
                              />
                            </div>
                            <span className="text-xs font-bold text-white/70 whitespace-nowrap">{r.horasCompletadas}/{r.horasRequeridas}</span>
                          </div>
                        </td>
                        <td data-label="Estatus">
                          <StatusBadge status={r.estatus} label={statusLabels[r.estatus] || r.estatus} />
                        </td>
                        <td data-label="Actividades" className="hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-sm text-white/60 font-medium">
                            <BookOpen size={14} className="text-amber-500/40 shrink-0" />
                            {r._count?.actividades || 0} activ.
                          </div>
                        </td>
                        <td data-label="Acciones" className="text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <button onClick={() => openDetail(r.id)}
                              className="p-2.5 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-cyan-500/30 text-white/60"
                              title="Ver detalle">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => openAddHoras(r.id)}
                              className="p-2.5 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-emerald-500/30 text-white/60"
                              title="Agregar horas">
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab: Pendientes */}
      {activeTab === 'pendientes' && (
        <div className="space-y-4">
          {loadingPendientes ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
          ) : pendientes.length === 0 ? (
            <div className="rounded-3xl border border-white/20 bg-slate-950/45 p-16 text-center backdrop-blur-xl shadow-2xl shadow-black/25 ring-1 ring-white/5">
              <CheckCircle2 size={64} className="mx-auto text-emerald-400/30 mb-4" />
              <p className="text-white/50 font-bold text-lg">No hay actividades pendientes de aprobación.</p>
              <p className="text-white/30 text-sm mt-2">Los alumnos pueden registrar horas y tú las apruebas desde aquí.</p>
            </div>
          ) : (
            <AnimatePresence>
              {pendientes.map((act) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  className="group rounded-3xl border border-amber-500/15 bg-slate-950/60 p-6 backdrop-blur-xl shadow-2xl shadow-black/25 ring-1 ring-white/5 hover:border-amber-500/30 hover:bg-slate-950/70 transition-all duration-500"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                    <div className="flex-1 w-full">
                      {/* Header alumno */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center ring-1 ring-amber-500/20 shrink-0">
                          <User size={22} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="font-black text-white/90 text-base drop-shadow-sm">
                            {act.servicioSocial?.alumno?.nombre} {act.servicioSocial?.alumno?.apellidoPaterno}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60">Solicitud de horas</p>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-3">
                        <h4 className="font-bold text-white/90 text-sm flex items-center gap-2">
                          <BookOpen size={14} className="text-amber-400/60 shrink-0" />
                          {act.descripcion}
                        </h4>
                        {act.comentarios && (
                          <p className="text-xs text-white/50 mt-2 italic leading-relaxed border-t border-white/5 pt-2">"{act.comentarios}"</p>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-amber-400/50" />
                          {new Date(act.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 font-black">
                          <Clock size={12} />
                          {act.horas} hrs
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => handleAprobar(act.id)}
                        className="flex-1 sm:flex-none px-5 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-600/10 flex items-center justify-center gap-2"
                      >
                        <ThumbsUp size={14} /> Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(act.id)}
                        className="flex-1 sm:flex-none px-5 py-3 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 border border-rose-500/30 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-600/10 flex items-center justify-center gap-2"
                      >
                        <ThumbsDown size={14} /> Rechazar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Modal: Nuevo Registro */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Registrar Servicio Social">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Alumno</label>
            <select value={newSS.alumnoId} onChange={(e) => setNewSS({...newSS, alumnoId: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" required>
              <option value="" className="text-black">Seleccionar alumno</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id} className="text-black">{a.nombre} {a.apellidoPaterno} {a.apellidoMaterno || ''}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-white/60 ml-1">Horas Requeridas</label>
              <input type="number" value={newSS.horasRequeridas} onChange={(e) => setNewSS({...newSS, horasRequeridas: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/60 ml-1">Institución</label>
              <input type="text" value={newSS.institucion} onChange={(e) => setNewSS({...newSS, institucion: e.target.value})}
                placeholder="Opcional"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-white/60 ml-1">Programa</label>
              <input type="text" value={newSS.programa} onChange={(e) => setNewSS({...newSS, programa: e.target.value})}
                placeholder="Opcional"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/60 ml-1">Supervisor</label>
              <input type="text" value={newSS.supervisor} onChange={(e) => setNewSS({...newSS, supervisor: e.target.value})}
                placeholder="Opcional"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Observaciones</label>
            <textarea value={newSS.observaciones} onChange={(e) => setNewSS({...newSS, observaciones: e.target.value})} rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 resize-none"
              placeholder="Opcional" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition">Cancelar</button>
            <button type="submit" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2">
              <HeartHandshake size={18} /> Registrar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Agregar Horas */}
      <Modal isOpen={addHorasOpen} onClose={() => setAddHorasOpen(false)} title="Registrar Horas de Servicio Social">
        <form onSubmit={handleAddHoras} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Horas *</label>
            <input type="number" min="1" value={newActividad.horas} onChange={(e) => setNewActividad({...newActividad, horas: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Descripción *</label>
            <input type="text" value={newActividad.descripcion} onChange={(e) => setNewActividad({...newActividad, descripcion: e.target.value})}
              placeholder="Ej. Apoyo en biblioteca, mantenimiento..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Comentarios</label>
            <textarea value={newActividad.comentarios} onChange={(e) => setNewActividad({...newActividad, comentarios: e.target.value})} rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setAddHorasOpen(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition">Cancelar</button>
            <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
              <Plus size={18} /> Registrar Horas
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalle */}
      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedRecord(null); }} title={selectedRecord ? `${selectedRecord.alumno?.nombre} ${selectedRecord.alumno?.apellidoPaterno}` : 'Detalle'} maxWidth="max-w-2xl">
        {selectedRecord && (
          <div className="space-y-6">
            {/* Info del alumno */}
            <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-600/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/25 ring-1 ring-amber-500/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center ring-1 ring-amber-500/20 shrink-0">
                    <User size={26} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg drop-shadow-sm">{selectedRecord.alumno?.nombre} {selectedRecord.alumno?.apellidoPaterno}</h3>
                    <p className="text-xs text-white/60 font-medium">{selectedRecord.alumno?.curp || 'Sin CURP'}</p>
                    <p className="text-xs text-white/50">{selectedRecord.alumno?.telefono || ''}</p>
                  </div>
                </div>
                <StatusBadge status={selectedRecord.estatus} label={statusLabels[selectedRecord.estatus]} />
              </div>

              {/* Barra de progreso */}
              <div className="mt-4 pt-4 border-t border-amber-500/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80 font-bold">{selectedRecord.horasCompletadas} hrs completadas</span>
                  <span className="text-white/40">{selectedRecord.horasRequeridas} hrs requeridas</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden shadow-inner shadow-black/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((selectedRecord.horasCompletadas / selectedRecord.horasRequeridas) * 100))}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 relative"
                  >
                    <div className="absolute inset-0 bg-white/15 rounded-full" />
                  </motion.div>
                </div>
                <p className="text-right text-xs font-bold text-white/40 mt-1">{Math.round((selectedRecord.horasCompletadas / selectedRecord.horasRequeridas) * 100)}% completado</p>
              </div>

              {selectedRecord.institucion && (
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1.5">🏛️ {selectedRecord.institucion}{selectedRecord.programa ? ` — ${selectedRecord.programa}` : ''}</span>
                  {selectedRecord.supervisor && <span className="flex items-center gap-1.5">👤 Supervisor: {selectedRecord.supervisor}</span>}
                </div>
              )}
              {selectedRecord.observaciones && <p className="text-sm text-white/50 mt-2 italic bg-white/5 rounded-xl p-3 border border-white/5">"{selectedRecord.observaciones}"</p>}

              {/* Acciones de estatus */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-amber-500/10">
                <button onClick={() => handleUpdateStatus(selectedRecord.id, 'completado')} className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Marcar Completado
                </button>
                <button onClick={() => handleUpdateStatus(selectedRecord.id, 'suspendido')} className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border border-rose-500/30 hover:border-rose-500/50 flex items-center gap-1.5">
                  <AlertCircle size={14} /> Suspender
                </button>
                <button onClick={() => handleUpdateStatus(selectedRecord.id, 'baja')} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border border-red-500/30 hover:border-red-500/50 flex items-center gap-1.5">
                  <X size={14} /> Dar de Baja
                </button>
              </div>
            </div>

            {/* Actividades */}
            <div className="rounded-3xl border border-white/20 bg-slate-950/45 p-6 backdrop-blur-xl shadow-2xl shadow-black/25 ring-1 ring-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <BookOpen size={16} className="text-amber-400/60" /> Actividades ({selectedRecord.actividades?.length || 0})
                </h3>
                <button onClick={() => { setAddHorasOpen(true); setNewActividad({...newActividad, servicioSocialId: selectedRecord.id.toString()}); }}
                  className="text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Agregar
                </button>
              </div>
              {selectedRecord.actividades?.length === 0 ? (
                <p className="text-white/40 italic text-sm bg-white/5 rounded-xl p-4 text-center">No hay actividades registradas.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedRecord.actividades.map(act => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start justify-between bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-bold text-white/90 text-sm truncate">{act.descripcion}</p>
                          {act.estatus === 'pendiente' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] font-black uppercase">Pendiente</span>
                          )}
                          {act.estatus === 'aprobada' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black uppercase">Aprobada</span>
                          )}
                          {act.estatus === 'rechazada' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[8px] font-black uppercase">Rechazada</span>
                          )}
                        </div>
                        {act.comentarios && <p className="text-xs text-white/50 mt-1">{act.comentarios}</p>}
                        <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1">📅 {new Date(act.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className={`font-black text-sm ${act.estatus === 'aprobada' ? 'text-emerald-400' : act.estatus === 'rechazada' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {act.horas} hrs
                        </span>
                        <button onClick={() => handleDeleteActividad(act.id)} className="p-1.5 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón eliminar */}
            <div className="flex justify-end pt-2">
              <button onClick={() => handleDelete(selectedRecord.id)} className="px-5 py-2.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border border-rose-500/30 hover:border-rose-500/50 flex items-center gap-1.5">
                <Trash2 size={14} /> Eliminar Registro
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ServicioSocial;
