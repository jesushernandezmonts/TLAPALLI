import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import InstructorForm from '../components/InstructorForm';
import { Plus, Search, Edit3, Trash2, UserSquare2, Palette, Mail, Send, Power, RefreshCw, AlertTriangle, CheckCircle, X, ChevronDown, Loader2, Users, CheckCircle2, Clock, Ban } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

function Instructores() {
  const [instructores, setInstructores] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editInstructor, setEditInstructor] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null); // ID del instructor al que se le envía email
  const [currentPage, setCurrentPage] = useState(1);
  const instructoresPerPage = 8;
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [openDropdown, setOpenDropdown] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {}, confirmText: 'Eliminar' });
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  useEffect(() => {
    fetchInstructores();
    fetchTalleres();
  }, []);

  const fetchInstructores = async () => {
    try {
      const { data } = await api.get('/instructores');
      setInstructores(data);
    } catch (err) {
      console.error('Error al cargar instructores', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTalleres = async () => {
    try {
      const { data } = await api.get('/talleres');
      setTalleres(data);
    } catch (err) {
      console.error('Error al cargar talleres', err);
    }
  };

  const handleEdit = (instructor) => {
    setEditInstructor(instructor);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditInstructor(null);
    setModalOpen(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openConfirm = (config) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };

  const handleDelete = (id) => {
    openConfirm({
      title: 'Eliminar Instructor',
      message: '¿Seguro que deseas eliminar este instructor? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        try {
          await api.delete(`/instructores/${id}`);
          showToast('Instructor eliminado correctamente');
          fetchInstructores();
        } catch (err) {
          showToast('Error al eliminar instructor', 'error');
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const handleToggleActivo = (id, currentEstado) => {
    const action = currentEstado === 'Inactivo' ? 'reactivar' : 'desactivar';
    const confirmText = currentEstado === 'Inactivo' ? 'Reactivar' : 'Desactivar';
    openConfirm({
      title: `${confirmText} Instructor`,
      message: `¿Deseas ${action} a este instructor?`,
      confirmText,
      onConfirm: async () => {
        try {
          await api.patch(`/instructores/${id}/toggle-activo`);
          showToast(`Instructor ${action === 'reactivar' ? 'reactivado' : 'desactivado'} correctamente`);
          fetchInstructores();
        } catch (err) {
          showToast('Error al cambiar estado', 'error');
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const handleReenviarActivacion = async (id) => {
    setSendingEmail(id);
    try {
      await api.post(`/instructores/${id}/reenviar-activacion`);
      showToast('Enlace enviado exitosamente al correo del instructor');
    } catch (err) {
      showToast('Error al enviar: ' + (err.response?.data?.message || 'Intente de nuevo'), 'error');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    fetchInstructores();
  };

  const filtered = instructores.filter(i => {
    const matchesSearch =
      i.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (i.email && i.email.toLowerCase().includes(search.toLowerCase())) ||
      (i.telefono && i.telefono.includes(search));
    const matchesEstado = estadoFilter === 'todos' || i.estado.toLowerCase() === estadoFilter.toLowerCase();
    return matchesSearch && matchesEstado;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / instructoresPerPage));
  const startIndex = (currentPage - 1) * instructoresPerPage;
  const paginatedInstructores = filtered.slice(startIndex, startIndex + instructoresPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Activo':
        return {
          icon: '✅',
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: 'Activo',
        };
      case 'Pendiente':
        return {
          icon: '⏳',
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: 'Pendiente',
        };
      case 'Inactivo':
        return {
          icon: '🚫',
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          label: 'Inactivo',
        };
      default:
        return {
          icon: '❓',
          classes: 'bg-white/5 text-white/40 border-white/10',
          label: estado,
        };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Gestión de Instructores
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Administra el cuerpo docente
          </p>
        </div>
        <button 
          onClick={handleNew} 
          className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Nuevo Instructor
        </button>
      </div>

      {/* KPIs Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: instructores.length, icon: Users, color: 'bg-white/5 border-white/10 text-white/80' },
          { label: 'Activos', value: instructores.filter(i => i.estado === 'Activo').length, icon: CheckCircle2, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
          { label: 'Pendientes', value: instructores.filter(i => i.estado === 'Pendiente').length, icon: Clock, color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
          { label: 'Inactivos', value: instructores.filter(i => i.estado === 'Inactivo').length, icon: Ban, color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl p-4 border backdrop-blur-md ${kpi.color} flex items-center gap-3`}>
            <kpi.icon size={20} className="opacity-60" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{kpi.label}</p>
              <p className="text-xl font-black tracking-tighter">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 placeholder-white/20 text-white focus:outline-none focus:border-pink-500/50 backdrop-blur-sm transition-all"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtro por Estado */}
        <div className="relative" data-filter-dropdown>
          <button
            type="button"
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-black/25 px-5 py-3 text-left text-xs font-black text-white shadow-inner shadow-black/20 outline-none transition hover:border-white/30 hover:bg-black/35 focus:border-pink-500/50 min-w-40"
          >
            <span className="truncate">
              {estadoFilter === 'todos' ? 'Todos los estados' : estadoFilter}
            </span>
            <ChevronDown size={14} className={`shrink-0 text-white/40 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown && (
            <div className="absolute left-0 top-full z-999 mt-2 w-full overflow-hidden rounded-2xl border border-pink-500/25 bg-slate-950 p-1.5 shadow-2xl shadow-black/60">
              {['todos', 'Activo', 'Pendiente', 'Inactivo'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setEstadoFilter(opt); setOpenDropdown(false); setCurrentPage(1); }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                    estadoFilter === opt ? 'bg-pink-500/15 text-pink-400' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {opt === 'todos' ? 'Todos los estados' : opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="responsive-table-container mt-2">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Instructor</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Taller Asignado</th>
              <th className="text-center">Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="6" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando instructores...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-20 text-center text-white/20 italic font-medium">No se encontraron registros.</td></tr>
            ) : (
              paginatedInstructores.map((i, index) => {
                const badge = getEstadoBadge(i.estado);
                return (
                  <tr key={i.id} className="hover:bg-white/5 transition group">
                    <td data-label="Instructor">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                          <UserSquare2 size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-white/90">{i.nombre}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest">ID: #{startIndex + index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Correo">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-pink-500/40" />
                        <span className="text-white/60">{i.email || <span className="opacity-20 italic">Sin correo</span>}</span>
                      </div>
                    </td>
                    <td data-label="Teléfono" className="text-sm opacity-60">{i.telefono || <span className="opacity-20">N/A</span>}</td>
                    <td data-label="Taller">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Palette size={14} className="text-pink-500/50" />
                        {i.taller?.nombreTaller || <span className="opacity-20 italic">Sin taller</span>}
                      </div>
                    </td>
                    <td data-label="Estado" className="text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${badge.classes}`}>
                        <span>{badge.icon}</span>
                        {badge.label}
                      </span>
                    </td>
                    <td data-label="Acciones" className="text-right">
                      <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        {/* Reenviar activación / reset */}
                        {i.email && i.estado !== 'Inactivo' && (
                          <button 
                            onClick={() => handleReenviarActivacion(i.id)} 
                            disabled={sendingEmail === i.id}
                            className="p-2 hover:bg-blue-500/10 hover:text-blue-400 rounded-xl transition text-white/60 disabled:opacity-30" 
                            title={i.estado === 'Activo' ? 'Reenviar enlace de restablecimiento' : 'Reenviar activación'}
                          >
                            {sendingEmail === i.id ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <Send size={16} />
                            )}
                          </button>
                        )}
                        {/* Editar */}
                        <button onClick={() => handleEdit(i)} className="p-2 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-xl transition" title="Editar">
                          <Edit3 size={16} />
                        </button>
                        {/* Activar/Desactivar */}
                        <button 
                          onClick={() => handleToggleActivo(i.id, i.estado)} 
                          className={`p-2 rounded-xl transition ${
                            i.estado === 'Inactivo' 
                              ? 'hover:bg-emerald-500/10 hover:text-emerald-400' 
                              : 'hover:bg-amber-500/10 hover:text-amber-400'
                          }`}
                          title={i.estado === 'Inactivo' ? 'Reactivar' : 'Desactivar'}
                        >
                          <Power size={16} />
                        </button>
                        {/* Eliminar */}
                        <button onClick={() => handleDelete(i.id)} className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition" title="Eliminar">
                          <Trash2 size={16} />
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

      {!loading && filtered.length > instructoresPerPage && (
        <div className="mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 shadow-lg shadow-black/20 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            Mostrando {startIndex + 1}-{Math.min(startIndex + instructoresPerPage, filtered.length)} de {filtered.length} instructores
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/10 disabled:hover:shadow-none"
            >
              Anterior
            </button>
            <span className="min-w-28 text-center text-xs font-black uppercase tracking-wider text-white/80">
              Página <span className="text-emerald-400">{currentPage}</span> de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/10 disabled:hover:shadow-none"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Leyenda de estados */}
      <div className="flex flex-wrap gap-4 text-[11px] text-white/40 pt-2">
        <span className="flex items-center gap-1.5">✅ <strong className="text-emerald-400/60">Activo</strong> — Cuenta activada</span>
        <span className="flex items-center gap-1.5">⏳ <strong className="text-amber-400/60">Pendiente</strong> — Esperando activación</span>
        <span className="flex items-center gap-1.5">🚫 <strong className="text-rose-400/60">Inactivo</strong> — Desactivado por admin</span>
      </div>

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText="Cancelar"
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-200 flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all animate-bounce-in ${
          toast.type === 'error'
            ? 'bg-rose-950/80 border-rose-500/30 text-rose-300'
            : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition">
            <X size={16} />
          </button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
             title={editInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}>
        <InstructorForm instructor={editInstructor} talleres={talleres} onClose={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>
    </div>
  );
}

export default Instructores;
