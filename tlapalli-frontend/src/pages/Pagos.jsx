import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { CreditCard, Plus, Trash2, Search, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    alumnoId: '',
    monto: '',
    mesCorrespondiente: new Date().toLocaleString('default', { month: 'long' }),
    metodoPago: 'efectivo'
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
    const { data } = await api.get('/alumnos');
    setAlumnos(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pagos', {
        ...form,
        alumnoId: parseInt(form.alumnoId),
        monto: parseFloat(form.monto)
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

  const filteredPagos = pagos.filter(p => 
    p.alumno?.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.mesCorrespondiente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Registro de Pagos</h1>
          <p className="text-white/40 text-sm">Gestiona los ingresos mensuales del centro</p>
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

      <div className="responsive-table-container">
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
                filteredPagos.map((p, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={p.id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td>
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
                    <td>
                      <span className="text-white/70 font-medium capitalize">{p.mesCorrespondiente}</span>
                    </td>
                    <td>
                      <span className="text-emerald-400 font-black text-lg">${p.monto}</span>
                    </td>
                    <td>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        {p.metodoPago}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-white/40 text-sm">
                        <Calendar size={14} />
                        {new Date(p.fechaPago).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="text-right">
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
            <div className="flex gap-2">
              {['efectivo', 'transferencia', 'tarjeta'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({...form, metodoPago: m})}
                  className={`flex-1 py-3 rounded-xl border font-bold uppercase text-[10px] transition-all ${
                    form.metodoPago === m 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {m}
                </button>
              ))}
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
