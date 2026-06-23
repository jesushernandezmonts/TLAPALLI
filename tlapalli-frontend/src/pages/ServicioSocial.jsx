import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Search, Trash2, Eye, Loader2, HeartHandshake,
  Target, User, Calendar, CheckCircle2, AlertCircle, X,
  BookOpen, TrendingUp, BarChart3, Clock, CheckCircle, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';

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
          <p className="mt-1 text-base font-semibold text-white/75">
            Gestiona el servicio social de los alumnos
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2">
          <Plus size={20} /> Nuevo Registro
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-white">{stats.total}</p>
            <p className="text-xs text-white/50 mt-1">Total</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-amber-400">{stats.enCurso}</p>
            <p className="text-xs text-white/50 mt-1">En curso</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{stats.completados}</p>
            <p className="text-xs text-white/50 mt-1">Completados</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-rose-400">{stats.suspendidos}</p>
            <p className="text-xs text-white/50 mt-1">Suspendidos</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-red-400">{stats.bajas}</p>
            <p className="text-xs text-white/50 mt-1">Bajas</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('lista')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'lista'
              ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
          }`}
        >
          Registros
        </button>
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'pendientes'
              ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Clock size={16} />
          Pendientes
          {pendientes.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-black text-amber-400">
              {pendientes.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'lista' && (
        <>
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
              placeholder="Buscar por alumno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Alumno</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Progreso</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Estatus</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Actividades</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan="5" className="p-12 text-center text-white/30 italic">No hay registros de servicio social.</td></tr>
                  ) : (
                    filteredRecords.map(r => {
                      const progreso = Math.min(100, Math.round((r.horasCompletadas / r.horasRequeridas) * 100));
                      return (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <User size={20} className="text-amber-400" />
                              </div>
                              <div>
                                <p className="font-bold text-white/90">{r.alumno?.nombre} {r.alumno?.apellidoPaterno}</p>
                                <p className="text-[10px] text-white/30">{r.institucion || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-white/10 rounded-full h-2 max-w-[120px]">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-2 rounded-full transition-all" style={{ width: `${progreso}%` }} />
                              </div>
                              <span className="text-xs font-bold text-white/70 whitespace-nowrap">{r.horasCompletadas}/{r.horasRequeridas}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[r.estatus] || 'bg-white/10 text-white/60'}`}>
                              {statusLabels[r.estatus] || r.estatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-white/50 text-sm">{r._count?.actividades || 0}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => openDetail(r.id)} className="p-2 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-xl transition-all" title="Ver detalle">
                                <Eye size={18} />
                              </button>
                              <button onClick={() => openAddHoras(r.id)} className="p-2 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-xl transition-all" title="Agregar horas">
                                <Plus size={18} />
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
          </div>
        </>
      )}

      {/* Tab: Pendientes */}
      {activeTab === 'pendientes' && (
        <div className="space-y-4">
          {loadingPendientes ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
          ) : pendientes.length === 0 ? (
            <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-12 text-center">
              <CheckCircle2 size={48} className="mx-auto text-emerald-400/40 mb-4" />
              <p className="text-white/40 font-medium">No hay actividades pendientes de aprobación.</p>
              <p className="text-white/30 text-sm mt-2">Los alumnos pueden registrar horas y tú las apruebas desde aquí.</p>
            </div>
          ) : (
            pendientes.map((act) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-2xl border border-amber-500/20 rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <User size={20} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white/90">
                          {act.servicioSocial?.alumno?.nombre} {act.servicioSocial?.alumno?.apellidoPaterno}
                        </p>
                        <p className="text-[10px] text-white/40">Alumno</p>
                      </div>
                    </div>
                    <h4 className="font-bold text-white/90 text-sm mt-3">{act.descripcion}</h4>
                    {act.comentarios && <p className="text-xs text-white/50 mt-1">{act.comentarios}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(act.fecha).toLocaleDateString()}</span>
                      <span className="text-amber-400 font-black">{act.horas} hrs</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAprobar(act.id)}
                      className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-1.5"
                      title="Aprobar"
                    >
                      <ThumbsUp size={14} /> Aprobar
                    </button>
                    <button
                      onClick={() => handleRechazar(act.id)}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-xl text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1.5"
                      title="Rechazar"
                    >
                      <ThumbsDown size={14} /> Rechazar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
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
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedRecord.alumno?.nombre} {selectedRecord.alumno?.apellidoPaterno}</h3>
                  <p className="text-sm text-white/60">{selectedRecord.alumno?.curp || 'Sin CURP'}</p>
                  <p className="text-sm text-white/60">{selectedRecord.alumno?.telefono || ''}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[selectedRecord.estatus]}`}>
                  {statusLabels[selectedRecord.estatus]}
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">{selectedRecord.horasCompletadas} hrs</span>
                  <span className="text-white/50">{selectedRecord.horasRequeridas} hrs</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((selectedRecord.horasCompletadas / selectedRecord.horasRequeridas) * 100))}%` }} />
                </div>
                <p className="text-right text-xs text-white/40 mt-1">{Math.round((selectedRecord.horasCompletadas / selectedRecord.horasRequeridas) * 100)}%</p>
              </div>

              {selectedRecord.institucion && <p className="text-sm text-white/70 mt-3">🏛️ {selectedRecord.institucion}{selectedRecord.programa ? ` — ${selectedRecord.programa}` : ''}</p>}
              {selectedRecord.supervisor && <p className="text-sm text-white/70">👤 Supervisor: {selectedRecord.supervisor}</p>}
              {selectedRecord.observaciones && <p className="text-sm text-white/50 mt-2 italic">{selectedRecord.observaciones}</p>}

              {/* Acciones de estatus */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-amber-500/20">
                <button onClick={() => handleUpdateStatus(selectedRecord.id, 'completado')} className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Marcar Completado
                </button>
                <button onClick={() => handleUpdateStatus(selectedRecord.id, 'suspendido')} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-xl text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1">
                  <AlertCircle size={12} /> Suspender
                </button>
                <button onClick={() => handleUpdateStatus(selectedRecord.id, 'baja')} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-xl text-xs font-bold transition-all border border-red-500/30 flex items-center gap-1">
                  <X size={12} /> Dar de Baja
                </button>
              </div>
            </div>

            {/* Actividades */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <BookOpen size={16} /> Actividades ({selectedRecord.actividades?.length || 0})
                </h3>
                <button onClick={() => { setAddHorasOpen(true); setNewActividad({...newActividad, servicioSocialId: selectedRecord.id.toString()}); }}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider flex items-center gap-1">
                  <Plus size={12} /> Agregar
                </button>
              </div>
              {selectedRecord.actividades?.length === 0 ? (
                <p className="text-white/40 italic text-sm">No hay actividades registradas.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {selectedRecord.actividades.map(act => (
                    <div key={act.id} className="flex items-start justify-between bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-white/90 text-sm">{act.descripcion}</p>
                          {act.estatus === 'pendiente' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] font-black uppercase">Pendiente</span>
                          )}
                          {act.estatus === 'rechazada' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[8px] font-black uppercase">Rechazada</span>
                          )}
                        </div>
                        {act.comentarios && <p className="text-xs text-white/50 mt-1">{act.comentarios}</p>}
                        <p className="text-xs text-white/40 mt-1">📅 {new Date(act.fecha).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`font-black ${act.estatus === 'aprobada' ? 'text-emerald-400' : act.estatus === 'rechazada' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {act.horas} hrs
                        </span>
                        <button onClick={() => handleDeleteActividad(act.id)} className="p-1.5 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón eliminar */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button onClick={() => handleDelete(selectedRecord.id)} className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-xl text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1">
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
