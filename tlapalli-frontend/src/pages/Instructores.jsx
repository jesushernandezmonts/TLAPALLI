import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import InstructorForm from '../components/InstructorForm';

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white/90">Gestión de Instructores</h1>
        <button onClick={handleNew} className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-lg">
          + Nuevo Instructor
        </button>
      </div>

      <div className="relative w-full md:w-96">
        <input
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 pl-10 placeholder-white/40 text-white focus:outline-none focus:border-pink-500/50 backdrop-blur-sm"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="absolute left-3 top-2.5 opacity-40">🔍</span>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold">Taller</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center animate-pulse text-white/60">Cargando instructores...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-white/40 italic">No se encontraron registros.</td></tr>
              ) : (
                filtered.map(i => (
                  <tr key={i.id} className="hover:bg-white/5 transition group">
                    <td className="p-4">
                      <div className="font-medium text-white/90">{i.nombre}</div>
                      <div className="text-xs text-white/40">ID: #{i.id}</div>
                    </td>
                    <td className="p-4 text-sm text-white/70">{i.telefono || <span className="opacity-30">N/A</span>}</td>
                    <td className="p-4 text-sm text-white/70">{i.taller?.nombreTaller || <span className="opacity-30">Sin taller</span>}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggleActivo(i.id)} 
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition ${i.activo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                        {i.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => handleEdit(i)} className="text-cyan-400 hover:text-cyan-300 transition text-sm font-medium">Editar</button>
                      <button onClick={() => handleDelete(i.id)} className="text-rose-400 hover:text-rose-300 transition text-sm font-medium">Borrar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
             title={editInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}>
        <InstructorForm instructor={editInstructor} talleres={talleres} onClose={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>
    </div>
  );
}

export default Instructores;
