import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, UserPlus, Trash2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Inscripciones() {
  const [toast, setToast] = useState(null);
  const showToast = (title, message = '', type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  };
  const [inscripciones, setInscripciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ alumnoId: '', tallerId: '' });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const inscripcionesPerPage = 8;

  useEffect(() => {
    fetchInscripciones();
    fetchAlumnos();
    fetchTalleres();
  }, []);

  const fetchInscripciones = async () => {
    const { data } = await api.get('/inscripciones');
    setInscripciones(data);
    setLoading(false);
  };

  const fetchAlumnos = async () => {
    const { data } = await api.get('/alumnos');
    setAlumnos(data);
  };

  const fetchTalleres = async () => {
    const { data } = await api.get('/talleres');
    setTalleres(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inscripciones', {
        alumnoId: parseInt(form.alumnoId),
        tallerId: parseInt(form.tallerId),
      });
      setModalOpen(false);
      setForm({ alumnoId: '', tallerId: '' });
      fetchInscripciones();
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Error al inscribir', 'error');
    }
  };

  const handleBaja = async (id) => {
    if (window.confirm('¿Dar de baja esta inscripción?')) {
      await api.delete(`/inscripciones/${id}`);
      fetchInscripciones();
    }
  };

  const totalPages = Math.max(1, Math.ceil(inscripciones.length / inscripcionesPerPage));
  const startIndex = (currentPage - 1) * inscripcionesPerPage;
  const paginatedInscripciones = inscripciones.slice(startIndex, startIndex + inscripcionesPerPage);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Inscripciones
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Control de altas y bajas en talleres
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Nueva Inscripción
        </button>
      </div>

      <div className="responsive-table-container mt-2">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Taller</th>
              <th>Fecha Registro</th>
              <th className="text-center">Estatus Pago</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando inscripciones...</td></tr>
            ) : inscripciones.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center text-white/20 italic font-medium">No hay inscripciones activas.</td></tr>
            ) : (
              paginatedInscripciones.map(i => (
                <tr key={i.id} className="hover:bg-white/5 transition group">
                  <td data-label="Alumno">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 font-bold">
                        {i.alumno?.nombre[0]}
                      </div>
                      <span className="font-bold text-white/90">{i.alumno?.nombre} {i.alumno?.apellidoPaterno}</span>
                    </div>
                  </td>
                  <td data-label="Taller">
                    <span className="text-sm text-white/60 font-medium">{i.taller?.nombreTaller}</span>
                  </td>
                  <td data-label="Fecha" className="text-sm text-white/30 font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(i.fechaInscripcion).toLocaleDateString()}
                    </div>
                  </td>
                  <td data-label="Estatus" className="text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      i.estatusPago === 'al_corriente' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      i.estatusPago === 'baja' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {i.estatusPago.replace('_', ' ')}
                    </span>
                  </td>
                  <td data-label="Acciones" className="text-right">
                    {i.estatusPago !== 'baja' && (
                      <button onClick={() => handleBaja(i.id)} className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition" title="Dar de baja">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && inscripciones.length > inscripcionesPerPage && (
        <div className="mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 shadow-lg shadow-black/20 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            Mostrando {startIndex + 1}-{Math.min(startIndex + inscripcionesPerPage, inscripciones.length)} de {inscripciones.length} inscripciones
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Inscripción">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1 font-medium">Alumno</label>
            <select 
              value={form.alumnoId} 
              onChange={(e) => setForm({...form, alumnoId: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-all" 
              required
            >
              <option value="" className="text-black">Seleccionar alumno</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id} className="text-black">{a.nombre} {a.apellidoPaterno} {a.apellidoMaterno}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1 font-medium">Taller</label>
            <select 
              value={form.tallerId} 
              onChange={(e) => setForm({...form, tallerId: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-all" 
              required
            >
              <option value="" className="text-black">Seleccionar taller</option>
              {talleres.map(t => (
                <option key={t.id} value={t.id} className="text-black">{t.nombreTaller}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 text-white/60 hover:text-white transition-colors font-bold">Cancelar</button>
            <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-2xl transition shadow-lg shadow-pink-600/20 flex items-center gap-2">
              <UserPlus size={20} />
              Inscribir Alumno
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`fixed right-6 top-6 z-200 flex items-center gap-3 rounded-2xl bg-slate-950/90 px-5 py-4 text-white shadow-2xl backdrop-blur-xl ${toast.type === 'error' ? 'border border-rose-500/25 shadow-rose-500/10' : 'border border-emerald-500/20 shadow-emerald-500/10'}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toast.type === 'error' ? 'border-rose-500/25 bg-rose-500/10 text-rose-400' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'}`}
            >
              {toast.type === 'error' ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
            </div>
            <div>
              <p className="text-sm font-black">{toast.title}</p>
              <p className="text-xs font-medium text-white/50">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Inscripciones;
