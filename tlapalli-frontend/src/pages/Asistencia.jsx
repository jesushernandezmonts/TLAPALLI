import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Loader2, AlertCircle, RefreshCw, Users,
  CheckCircle2, XCircle, CalendarDays, ChevronDown, ChevronUp,
  History, Save, BookOpenCheck
} from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

const GRUPO_COLORS = [
  { from: 'from-pink-600', to: 'to-rose-600', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-300', avatar: 'from-pink-500 to-rose-500' },
  { from: 'from-purple-600', to: 'to-violet-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300', avatar: 'from-purple-500 to-violet-500' },
  { from: 'from-blue-600', to: 'to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', avatar: 'from-blue-500 to-indigo-500' },
  { from: 'from-emerald-600', to: 'to-teal-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', avatar: 'from-emerald-500 to-teal-500' },
  { from: 'from-amber-600', to: 'to-orange-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', avatar: 'from-amber-500 to-orange-500' },
  { from: 'from-cyan-600', to: 'to-sky-600', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-300', avatar: 'from-cyan-500 to-sky-500' },
];

const getColorForGrupo = (id) => GRUPO_COLORS[id % GRUPO_COLORS.length];
const getToday = () => new Date().toISOString().split('T')[0];

export default function Asistencia() {
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [fecha, setFecha] = useState(getToday());
  const [alumnos, setAlumnos] = useState([]);
  const [asistenciasPrevias, setAsistenciasPrevias] = useState({});
  const [asistencias, setAsistencias] = useState({});
  const [historial, setHistorial] = useState([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (title, message = '', type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchGrupos(); }, []);

  useEffect(() => {
    if (selectedGrupoId) loadAlumnosAndAsistencias();
  }, [selectedGrupoId]);

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/grupos');
      setGrupos(data);
    } catch (err) {
      setError('No se pudieron cargar los grupos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlumnosAndAsistencias = async () => {
    if (!selectedGrupoId) return;
    try {
      setLoadingAlumnos(true);
      const { data: alumnosData } = await api.get(`/asistencias/grupo/${selectedGrupoId}/alumnos`);
      setAlumnos(alumnosData);

      try {
        const { data: asistenciasData } = await api.get(`/asistencias/grupo/${selectedGrupoId}?fecha=${fecha}`);
        const asistenciasMap = {};
        asistenciasData.forEach((a) => { asistenciasMap[a.grupoAlumnoId] = a.estado; });
        setAsistenciasPrevias(asistenciasMap);
        setAsistencias(asistenciasMap);
      } catch {
        setAsistenciasPrevias({});
        setAsistencias({});
      }

      try {
        const { data: historialData } = await api.get(`/asistencias/grupo/${selectedGrupoId}/historial`);
        setHistorial(historialData);
      } catch { setHistorial([]); }
    } catch (err) {
      console.error(err);
      showToast('Error', 'No se pudieron cargar los alumnos', 'error');
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const handleFechaChange = async (newFecha) => {
    setFecha(newFecha);
    if (!selectedGrupoId) return;
    try {
      setLoadingAlumnos(true);
      const { data: asistenciasData } = await api.get(`/asistencias/grupo/${selectedGrupoId}?fecha=${newFecha}`);
      const asistenciasMap = {};
      asistenciasData.forEach((a) => { asistenciasMap[a.grupoAlumnoId] = a.estado; });
      setAsistenciasPrevias(asistenciasMap);
      setAsistencias(asistenciasMap);
    } catch {
      setAsistenciasPrevias({});
      setAsistencias({});
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const setEstado = (grupoAlumnoId, estado) => {
    setAsistencias((prev) => ({ ...prev, [grupoAlumnoId]: estado }));
  };

  const handleSave = async () => {
    if (!selectedGrupoId) return;
    const asistenciasArray = Object.entries(asistencias).map(([id, estado]) => ({
      grupoAlumnoId: Number(id),
      estado,
    }));
    try {
      setSaving(true);
      await api.post(`/asistencias/grupo/${selectedGrupoId}`, {
        grupoId: Number(selectedGrupoId),
        fecha,
        asistencias: asistenciasArray,
      });
      showToast('Asistencias guardadas', 'Lista registrada correctamente', 'success');
      const { data: historialData } = await api.get(`/asistencias/grupo/${selectedGrupoId}/historial`);
      setHistorial(historialData);
    } catch (err) {
      showToast('Error al guardar', err.response?.data?.message || 'Ocurrió un error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => JSON.stringify(asistencias) !== JSON.stringify(asistenciasPrevias);

  // Stats
  const totalAlumnos = alumnos.length;
  const asistenciasCount = Object.values(asistencias).filter((v) => v === 'asistencia').length;
  const faltasCount = Object.values(asistencias).filter((v) => v === 'falta').length;
  const sinRegistro = totalAlumnos - asistenciasCount - faltasCount;

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
        <p className="text-white/40 text-sm">Cargando grupos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="text-white/70">{error}</p>
        <button onClick={fetchGrupos} className="flex items-center gap-2 mx-auto px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl text-white text-sm font-bold transition">
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    </div>
  );

  const selectedGrupo = grupos.find((g) => g.id === Number(selectedGrupoId));
  const colors = selectedGrupo ? getColorForGrupo(selectedGrupo.id) : GRUPO_COLORS[0];

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Pasar Lista
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75">
            Registra la asistencia de tus grupos
          </p>
        </div>
      </div>

      {/* Selector de Grupo y Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-3">
            <Users size={14} className="inline mr-1.5 -mt-0.5" />
            Seleccionar Grupo
          </label>
          <div className="relative">
            <select
              value={selectedGrupoId}
              onChange={(e) => {
                setSelectedGrupoId(e.target.value);
                setAsistencias({});
                setAsistenciasPrevias({});
                setHistorial([]);
              }}
              className="w-full appearance-none px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 text-sm font-medium transition cursor-pointer pr-10"
            >
              <option value="" className="bg-slate-900 text-white/50">-- Selecciona un grupo --</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id} className="bg-slate-900 text-white">{g.nombre}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          {grupos.length === 0 && <p className="mt-2 text-xs text-white/30">No tienes grupos registrados</p>}
        </div>

        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-3">
            <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" />
            Seleccionar Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => handleFechaChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 text-sm font-medium transition"
          />
        </div>
      </div>

      {/* Contenido principal */}
      {selectedGrupoId ? (
        <>
          {loadingAlumnos ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
            </div>
          ) : (
            <>
              {/* Stats */}
              {alumnos.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-white">{totalAlumnos}</p>
                    <p className="text-xs text-white/50 mt-1">Total</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-emerald-400">{asistenciasCount}</p>
                    <p className="text-xs text-emerald-400/60 mt-1">Asistencias</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 backdrop-blur-xl border border-red-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-red-400">{faltasCount}</p>
                    <p className="text-xs text-red-400/60 mt-1">Faltas</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-white/50">{sinRegistro}</p>
                    <p className="text-xs text-white/30 mt-1">Sin registro</p>
                  </div>
                </div>
              )}

              {selectedGrupo && (
                <div className={`bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border ${colors.border} rounded-2xl overflow-hidden`}>
                  <div className={`h-1 bg-gradient-to-r ${colors.from} ${colors.to}`} />
                  <div className="p-5">
                    {/* Cabecera con acciones */}
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.avatar} flex items-center justify-center`}>
                          <BookOpenCheck size={18} className="text-white" />
                        </div>
                        <div>
                          <h2 className="font-black text-white text-lg">{selectedGrupo.nombre}</h2>
                          <p className="text-xs text-white/40">{fecha} — {totalAlumnos} alumno{totalAlumnos !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowHistorial(!showHistorial)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                            showHistorial ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <History size={14} />
                          Historial
                          {showHistorial ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSave}
                          disabled={saving || !hasChanges()}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm transition ${
                            hasChanges()
                              ? `bg-gradient-to-r ${colors.from} ${colors.to} hover:brightness-110 shadow-lg`
                              : 'bg-white/5 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          {saving ? (
                            <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                          ) : (
                            <><Save size={14} /> {hasChanges() ? 'Guardar Cambios' : 'Guardado'}</>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Historial expandible */}
                    <AnimatePresence>
                      {showHistorial && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mb-5"
                        >
                          {historial.length === 0 ? (
                            <p className="text-white/30 text-sm py-4 text-center italic">No hay historial de asistencias aún</p>
                          ) : (
                            <div className="bg-white/5 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                              {historial.map((entry) => (
                                <div
                                  key={entry.fecha}
                                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition cursor-pointer"
                                  onClick={() => { handleFechaChange(entry.fecha); setShowHistorial(false); }}
                                >
                                  <span className="text-white text-sm font-medium capitalize">
                                    {new Date(entry.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                  </span>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-emerald-400 font-bold">{entry.asistencias} ✓</span>
                                    <span className="text-red-400 font-bold">{entry.faltas} ✗</span>
                                    <span className="text-white/40">{entry.total} total</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* TABLA DE ASISTENCIAS */}
                    {alumnos.length === 0 ? (
                      <div className="text-center py-10">
                        <Users size={40} className="mx-auto text-white/20 mb-3" />
                        <p className="text-white/40 text-sm">Este grupo no tiene alumnos registrados</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full text-sm">
                          {/* Cabecera de la tabla */}
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.03]">
                              <th className="text-left px-4 py-3 text-white/40 font-bold text-[11px] uppercase tracking-wider w-12">#</th>
                              <th className="text-left px-4 py-3 text-white/40 font-bold text-[11px] uppercase tracking-wider">Alumno</th>
                              <th className="text-center px-4 py-3 text-white/40 font-bold text-[11px] uppercase tracking-wider w-28">✅ Asistencia</th>
                              <th className="text-center px-4 py-3 text-white/40 font-bold text-[11px] uppercase tracking-wider w-28">❌ Falta</th>
                            </tr>
                          </thead>
                          {/* Cuerpo de la tabla */}
                          <tbody>
                            {alumnos.map((ga, idx) => {
                              const estado = asistencias[ga.id] || null;
                              return (
                                <motion.tr
                                  key={ga.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: idx * 0.02 }}
                                  className={`border-b border-white/[0.03] transition-colors ${
                                    estado === 'asistencia'
                                      ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                                      : estado === 'falta'
                                      ? 'bg-red-500/5 hover:bg-red-500/10'
                                      : 'hover:bg-white/[0.03]'
                                  }`}
                                >
                                  {/* # */}
                                  <td className="px-4 py-3 text-white/30 text-xs font-mono">{idx + 1}</td>

                                  {/* Alumno */}
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.avatar} flex items-center justify-center flex-shrink-0`}>
                                        <span className="text-white font-bold text-[10px]">
                                          {ga.alumno.nombre?.[0]}{ga.alumno.apellidoPaterno?.[0]}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-white text-sm">
                                          {ga.alumno.nombre} {ga.alumno.apellidoPaterno} {ga.alumno.apellidoMaterno || ''}
                                        </p>
                                        {ga.alumno.telefono && (
                                          <p className="text-[11px] text-white/30">{ga.alumno.telefono}</p>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Asistencia */}
                                  <td className="px-4 py-3 text-center">
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={estado === 'asistencia'}
                                        onChange={() => setEstado(ga.id, 'asistencia')}
                                        className="sr-only peer"
                                      />
                                      <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                        estado === 'asistencia'
                                          ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                                          : 'border-white/20 hover:border-emerald-400/50 bg-white/5'
                                      }`}>
                                        {estado === 'asistencia' && (
                                          <CheckCircle2 size={16} className="text-white" />
                                        )}
                                      </div>
                                    </label>
                                  </td>

                                  {/* Falta */}
                                  <td className="px-4 py-3 text-center">
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={estado === 'falta'}
                                        onChange={() => setEstado(ga.id, 'falta')}
                                        className="sr-only peer"
                                      />
                                      <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                        estado === 'falta'
                                          ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(248,113,113,0.35)]'
                                          : 'border-white/20 hover:border-red-400/50 bg-white/5'
                                      }`}>
                                        {estado === 'falta' && (
                                          <XCircle size={16} className="text-white" />
                                        )}
                                      </div>
                                    </label>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl py-16 text-center">
          <ClipboardList size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/50 text-lg font-medium">Selecciona un grupo para empezar</p>
          <p className="text-white/30 text-sm mt-1">Elige un grupo arriba y podrás registrar la asistencia del día</p>
        </div>
      )}
    </div>
  );
}
