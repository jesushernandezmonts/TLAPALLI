import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import { CreditCard, Plus, Trash2, Search, Calendar, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Pagos() {
  const { user } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pagosPerPage = 8;
  const [form, setForm] = useState({
    alumnoId: '',
    monto: '',
    mesCorrespondiente: new Date().toLocaleString('default', { month: 'long' }),
  });

  useEffect(() => {
    fetchPagos();
    fetchAlumnos();
  }, []);

  const fetchPagos = async () => {
    try {
      const { data } = await api.get('/pagos');
      setPagos(data);
    } catch (err) {
      console.error('Error al cargar pagos', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const { data } = await api.get('/grupos/alumnos-disponibles');
      setAlumnos(data);
    } catch (err) {
      console.error('Error al cargar alumnos del taller', err);
      setAlumnos([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pagos', {
        ...form,
        alumnoId: parseInt(form.alumnoId),
        monto: parseFloat(form.monto),
        metodoPago: 'efectivo',
      });
      setModalOpen(false);
      setForm({ ...form, alumnoId: '', monto: '' });
      fetchPagos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar pago');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este registro de pago?')) {
      await api.delete(`/pagos/${id}`);
      fetchPagos();
    }
  };

  const filteredPagos = pagos.filter(p => {
    const nombre = `${p.alumno?.nombre || ''} ${p.alumno?.apellidoPaterno || ''} ${p.alumno?.apellidoMaterno || ''}`.toLowerCase();
    const mes = (p.mesCorrespondiente || '').toLowerCase();
    const searchTerm = search.toLowerCase();
    return nombre.includes(searchTerm) || mes.includes(searchTerm);
  });
  const totalPages = Math.max(1, Math.ceil(filteredPagos.length / pagosPerPage));
  const startIndex = (currentPage - 1) * pagosPerPage;
  const paginatedPagos = filteredPagos.slice(startIndex, startIndex + pagosPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Registro de Pagos
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Gestiona los ingresos mensuales del centro
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Nuevo Pago
        </button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
          placeholder="Buscar por alumno o mes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="responsive-table-container mt-2">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Mes</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Fecha Registro</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando pagos...</td></tr>
              ) : filteredPagos.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-white/20 italic font-medium">No hay registros de pagos.</td></tr>
              ) : (
                paginatedPagos.map((p, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={p.id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td data-label="Alumno">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white/90">{p.alumno?.nombre} {p.alumno?.apellidoPaterno}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-tighter">Registrado por: {p.usuario?.nombre}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Mes">
                      <span className="text-white/70 font-medium capitalize">{p.mesCorrespondiente}</span>
                    </td>
                    <td data-label="Monto">
                      <span className="text-emerald-400 font-black text-lg">${p.monto}</span>
                    </td>
                    <td data-label="Método">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        {p.metodoPago}
                      </span>
                    </td>
                    <td data-label="Fecha">
                      <div className="flex items-center gap-2 text-white/40 text-sm">
                        <Calendar size={14} />
                        {new Date(p.fechaPago).toLocaleDateString()}
                      </div>
                    </td>
                    <td data-label="Acciones" className="text-right">
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {!loading && filteredPagos.length > pagosPerPage && (
        <div className="mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 shadow-lg shadow-black/20 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            Mostrando {startIndex + 1}-{Math.min(startIndex + pagosPerPage, filteredPagos.length)} de {filteredPagos.length} pagos
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Nuevo Pago">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Alumno</label>
            <select 
              value={form.alumnoId} 
              onChange={(e) => setForm({...form, alumnoId: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              required
            >
              <option value="" className="text-black">Seleccionar alumno</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id} className="text-black">{a.nombre} {a.apellidoPaterno} {a.apellidoMaterno}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-white/60 ml-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.monto}
                onChange={(e) => setForm({...form, monto: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/60 ml-1">Mes</label>
              <select 
                value={form.mesCorrespondiente}
                onChange={(e) => setForm({...form, mesCorrespondiente: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map(m => (
                  <option key={m} value={m} className="text-black">{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Método de Pago</label>
            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Efectivo</span>
              <span className="text-emerald-400/50 text-xs">(Único método disponible)</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              type="button" 
              onClick={() => setModalOpen(false)} 
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              Confirmar Pago
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Pagos;
