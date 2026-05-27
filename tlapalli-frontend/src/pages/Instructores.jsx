import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import InstructorForm from '../components/InstructorForm';
import { Plus, Search, Edit3, Trash2, UserSquare2, Palette, Mail, Send, Power, RefreshCw } from 'lucide-react';

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

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este instructor? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/instructores/${id}`);
        fetchInstructores();
      } catch (err) {
        console.error('Error al eliminar instructor', err);
      }
    }
  };

  const handleToggleActivo = async (id, currentEstado) => {
    const action = currentEstado === 'Inactivo' ? 'reactivar' : 'desactivar';
    if (window.confirm(`¿Deseas ${action} a este instructor?`)) {
      try {
        await api.patch(`/instructores/${id}/toggle-activo`);
        fetchInstructores();
      } catch (err) {
        console.error('Error al cambiar estado', err);
      }
    }
  };

  const handleReenviarActivacion = async (id) => {
    setSendingEmail(id);
    try {
      await api.post(`/instructores/${id}/reenviar-activacion`);
      alert('✅ Enlace enviado exitosamente al correo del instructor.');
    } catch (err) {
      alert('❌ Error al enviar: ' + (err.response?.data?.message || 'Intente de nuevo'));
    } finally {
      setSendingEmail(null);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    fetchInstructores();
  };

  const filtered = instructores.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (i.email && i.email.toLowerCase().includes(search.toLowerCase())) ||
    (i.telefono && i.telefono.includes(search))
  );
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 placeholder-white/20 text-white focus:outline-none focus:border-pink-500/50 backdrop-blur-sm transition-all"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="responsive-table-container">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
             title={editInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}>
        <InstructorForm instructor={editInstructor} talleres={talleres} onClose={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>
    </div>
  );
}

export default Instructores;
