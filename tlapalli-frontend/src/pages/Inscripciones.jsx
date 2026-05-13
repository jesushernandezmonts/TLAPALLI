import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, UserPlus, Trash2, Calendar } from 'lucide-react';

function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ alumnoId: '', tallerId: '' });
  const [loading, setLoading] = useState(true);

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
      alert(err.response?.data?.message || 'Error al inscribir');
    }
  };

  const handleBaja = async (id) => {
    if (window.confirm('¿Dar de baja esta inscripción?')) {
      await api.delete(`/inscripciones/${id}`);
      fetchInscripciones();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Inscripciones</h1>
          <p className="text-white/40 text-sm">Control de altas y bajas en talleres</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Nueva Inscripción
        </button>
      </div>

      <div className="responsive-table-container">
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
              inscripciones.map(i => (
                <tr key={i.id} className="hover:bg-white/5 transition group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 font-bold">
                        {i.alumno?.nombre[0]}
                      </div>
                      <span className="font-bold text-white/90">{i.alumno?.nombre} {i.alumno?.apellidoPaterno}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-white/60 font-medium">{i.taller?.nombreTaller}</span>
                  </td>
                  <td className="text-sm text-white/30 font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(i.fechaInscripcion).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      i.estatusPago === 'al_corriente' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      i.estatusPago === 'baja' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {i.estatusPago.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-right">
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
    </div>
  );
}

export default Inscripciones;
