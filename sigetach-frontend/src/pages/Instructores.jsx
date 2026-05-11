import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import InstructorForm from '../components/InstructorForm';

function Instructores() {
  const [instructores, setInstructores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editInstructor, setEditInstructor] = useState(null);

  useEffect(() => {
    fetchInstructores();
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

  const handleSave = () => {
    setModalOpen(false);
    fetchInstructores();
  };

  const filtered = instructores.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Buscar por nombre o correo..."
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
                <th className="p-4 font-semibold">Correo Electrónico</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center animate-pulse text-white/60">Cargando instructores...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-white/40 italic">No se encontraron registros.</td></tr>
              ) : (
                filtered.map(i => (
                  <tr key={i.id} className="hover:bg-white/5 transition group">
                    <td className="p-4">
                      <div className="font-medium text-white/90">{i.nombre}</div>
                      <div className="text-xs text-white/40">ID: #{i.id}</div>
                    </td>
                    <td className="p-4 text-sm text-white/70">{i.email}</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Activo
                      </span>
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
        <InstructorForm instructor={editInstructor} onClose={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>
    </div>
  );
}

export default Instructores;
