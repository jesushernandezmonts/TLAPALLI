import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Loader2, AlertCircle, RefreshCw,
  Users, BookOpen, ChevronDown
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import ConfirmModal from '../components/ConfirmModal';

export default function MisGrupos() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [expandedGrupo, setExpandedGrupo] = useState(null);
  const [alumnosGrupo, setAlumnosGrupo] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('grupo');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [alumnoForm, setAlumnoForm] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', telefono: '', email: '', curp: '' });
  const [saving, setSaving] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (title, message = '', type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {}, confirmText: 'Eliminar' });

  const openConfirm = (config) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

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

  const fetchAlumnosGrupo = async (grupoId) => {
    try {
      const { data } = await api.get(`/grupos/${grupoId}/alumnos`);
      setAlumnosGrupo(prev => ({ ...prev, [grupoId]: data }));
    } catch (err) {
      console.error('Error al cargar alumnos:', err);
    }
  };

  const handleExpandGrupo = (grupoId) => {
    if (expandedGrupo === grupoId) {
      setExpandedGrupo(null);
    } else {
      setExpandedGrupo(grupoId);
      if (!alumnosGrupo[grupoId]) {
        fetchAlumnosGrupo(grupoId);
      }
    }
  };

  const handleOpenModal = (type, grupo = null) => {
    setModalType(type);
    if (type === 'grupo') {
      if (grupo) {
        setEditingId(grupo.id);
        setFormData({ nombre: grupo.nombre, descripcion: grupo.descripcion || '' });
      } else {
        setEditingId(null);
        setFormData({ nombre: '', descripcion: '' });
      }
    } else if (type === 'alumno') {
      setAlumnoForm({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', telefono: '', email: '', curp: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSaveGrupo = async () => {
    if (!formData.nombre.trim()) {
      showToast('Campo requerido', 'El nombre del grupo es requerido', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await api.patch(`/grupos/${editingId}`, formData);
        showToast('Grupo actualizado', 'Los cambios se guardaron correctamente.', 'success');
      } else {
        await api.post('/grupos', formData);
        showToast('Grupo creado', 'El grupo se registró correctamente.', 'success');
      }
      await fetchGrupos();
      handleCloseModal();
    } catch (err) {
      showToast('Error al guardar', err.response?.data?.message || 'Ocurrió un error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAlumno = async () => {
    if (!alumnoForm.nombre.trim() || !alumnoForm.apellidoPaterno.trim()) {
      showToast('Campos requeridos', 'Nombre y Apellido Paterno son requeridos', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.post(`/grupos/${expandedGrupo}/alumnos`, alumnoForm);
      await fetchAlumnosGrupo(expandedGrupo);
      setAlumnoForm({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', telefono: '', email: '', curp: '' });
      setShowModal(false);
      showToast('Alumno agregado', 'El alumno se agregó correctamente al grupo.', 'success');
    } catch (err) {
      showToast('Error al crear', 'No se pudo agregar al alumno.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrupo = (id) => {
    openConfirm({
      title: '¿Eliminar Grupo?',
      message: 'Esta acción es permanente y eliminará el grupo y todos sus alumnos asociados. ¿Deseas continuar?',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => {
        try {
          await api.delete(`/grupos/${id}`);
          showToast('Grupo eliminado', 'El grupo se eliminó correctamente.', 'delete');
          await fetchGrupos();
        } catch (err) {
          showToast('Error al eliminar', 'No se pudo eliminar el grupo.', 'error');
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const handleDeleteAlumno = (alumnoId) => {
    openConfirm({
      title: '¿Eliminar Alumno?',
      message: 'Esta acción eliminará al alumno del grupo. ¿Deseas continuar?',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => {
        try {
          await api.delete(`/grupos/${expandedGrupo}/alumnos/${alumnoId}`);
          await fetchAlumnosGrupo(expandedGrupo);
          showToast('Alumno eliminado', 'El alumno se eliminó del grupo.', 'delete');
        } catch (err) {
          showToast('Error al eliminar', 'No se pudo eliminar al alumno.', 'error');
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const gruposFiltrados = useMemo(() => {
    return grupos.filter(g =>
      g.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [grupos, busqueda]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
        <p className="text-white/40 text-sm">Cargando tus grupos...</p>
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

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Mis Grupos
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75">Gestiona tus grupos y alumnos</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal('grupo')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold text-sm transition shadow-lg"
        >
          <Plus size={16} /> Nuevo Grupo
        </motion.button>
      </div>

      {/* Stats con StatCard */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Users} label="Total Grupos" value={grupos.length} color="white" />
        <StatCard icon={BookOpen} label="Encontrados" value={gruposFiltrados.length} color="purple" />
      </div>

      {/* Search con SearchBar */}
      <SearchBar
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar grupos..."
      />

      {/* Grupos List */}
      {grupos.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/50">No tienes grupos aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gruposFiltrados.map((grupo) => (
            <motion.div
              key={grupo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all"
            >
              {/* Header del Grupo */}
              <div className="flex items-center justify-between cursor-pointer" onClick={() => handleExpandGrupo(grupo.id)}>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-lg">{grupo.nombre}</h3>
                    {grupo.descripcion && <p className="text-white/50 text-xs mt-1 truncate">{grupo.descripcion}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleOpenModal('grupo', grupo); }}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition"
                  >
                    <Edit3 size={14} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleDeleteGrupo(grupo.id); }}
                    className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                  <motion.div animate={{ rotate: expandedGrupo === grupo.id ? 180 : 0 }}>
                    <ChevronDown size={18} className="text-white/50" />
                  </motion.div>
                </div>
              </div>

              {/* Contenido Expandido */}
              <AnimatePresence>
                {expandedGrupo === grupo.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-white/10 space-y-4"
                  >
                    {/* Alumnos */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white flex items-center gap-2">
                          <Users size={16} /> Alumnos ({alumnosGrupo[grupo.id]?.length || 0})
                        </h4>
                        <button
                          onClick={() => handleOpenModal('alumno')}
                          className="flex items-center gap-1 px-3 py-1 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 rounded-lg text-xs font-bold transition"
                        >
                          <Plus size={12} /> Agregar
                        </button>
                      </div>

                      {alumnosGrupo[grupo.id]?.length === 0 ? (
                        <p className="text-white/40 text-sm italic">Sin alumnos</p>
                      ) : (
                        <div className="space-y-2">
                          {alumnosGrupo[grupo.id]?.map(alumno => (
                            <div key={alumno.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-sm">{alumno.nombre} {alumno.apellidoPaterno}</p>
                                {alumno.telefono && <p className="text-xs text-white/50">{alumno.telefono}</p>}
                              </div>
                              <button
                                onClick={() => handleDeleteAlumno(alumno.id)}
                                className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* ConfirmModal para eliminaciones */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText="Cancelar"
      />

      {/* Modal de creación/edición usando Modal compartido */}
      <Modal isOpen={showModal} onClose={handleCloseModal}
        title={modalType === 'grupo' ? (editingId ? 'Editar Grupo' : 'Nuevo Grupo') : 'Agregar Alumno'}
        maxWidth="max-w-md">
        {modalType === 'grupo' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">Nombre *</label>
              <input
                type="text"
                placeholder="Nombre del grupo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">Descripción</label>
              <textarea
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCloseModal} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-sm transition">
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveGrupo}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                ) : (
                  'Guardar'
                )}
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">Nombre *</label>
              <input
                type="text"
                placeholder="Nombre"
                value={alumnoForm.nombre}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">Apellido Paterno *</label>
              <input
                type="text"
                placeholder="Apellido Paterno"
                value={alumnoForm.apellidoPaterno}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, apellidoPaterno: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">Apellido Materno</label>
              <input
                type="text"
                placeholder="Apellido Materno (opcional)"
                value={alumnoForm.apellidoMaterno}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, apellidoMaterno: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">Teléfono</label>
              <input
                type="text"
                placeholder="Teléfono (opcional)"
                value={alumnoForm.telefono}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, telefono: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">Email</label>
              <input
                type="email"
                placeholder="Email (opcional)"
                value={alumnoForm.email}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">CURP</label>
              <input
                type="text"
                placeholder="CURP (opcional)"
                value={alumnoForm.curp}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, curp: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCloseModal} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-sm transition">
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAlumno}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                ) : (
                  'Guardar'
                )}
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
