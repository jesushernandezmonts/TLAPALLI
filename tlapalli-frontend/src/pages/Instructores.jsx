import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import InstructorForm from '../components/InstructorForm';
import { Plus, Search, Edit3, Trash2, UserSquare2, Palette } from 'lucide-react';

function Instructores() {
  const [instructores, setInstructores] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editInstructor, setEditInstructor] = useState(null);

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
    if (window.confirm('¿Eliminar este instructor?')) {
      try {
        await api.delete(`/instructores/${id}`);
        fetchInstructores();
      } catch (err) {
        console.error('Error al eliminar instructor', err);
      }
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      await api.patch(`/instructores/${id}/toggle-activo`);
      fetchInstructores();
    } catch (err) {
      console.error('Error al cambiar estado', err);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    fetchInstructores();
  };

  const filtered = instructores.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (i.telefono && i.telefono.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Gestión de Instructores</h1>
          <p className="text-white/40 text-sm">Administra el cuerpo docente</p>
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
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="responsive-table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Instructor</th>
              <th>Teléfono</th>
              <th>Taller Asignado</th>
              <th className="text-center">Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando instructores...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center text-white/20 italic font-medium">No se encontraron registros.</td></tr>
            ) : (
              filtered.map(i => (
                <tr key={i.id} className="hover:bg-white/5 transition group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <UserSquare2 size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-white/90">{i.nombre}</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest">ID: #{i.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm opacity-60">{i.telefono || <span className="opacity-20">N/A</span>}</td>
                  <td>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Palette size={14} className="text-pink-500/50" />
                      {i.taller?.nombreTaller || <span className="opacity-20 italic">Sin taller</span>}
                    </div>
                  </td>
                  <td className="text-center">
                    <button onClick={() => handleToggleActivo(i.id)} 
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition border ${i.activo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {i.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(i)} className="p-2 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-xl transition" title="Editar">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(i.id)} className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
             title={editInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}>
        <InstructorForm instructor={editInstructor} talleres={talleres} onClose={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>
    </div>
  );
}

export default Instructores;
