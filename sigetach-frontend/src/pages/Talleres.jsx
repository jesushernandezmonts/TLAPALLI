import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import TallerForm from '../components/TallerForm';

function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTaller, setEditTaller] = useState(null);

  useEffect(() => {
    fetchTalleres();
  }, []);

  const fetchTalleres = async () => {
    try {
      const { data } = await api.get('/talleres');
      setTalleres(data);
    } catch (err) {
      console.error('Error al cargar talleres', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (taller) => {
    setEditTaller(taller);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditTaller(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este taller?')) {
      try {
        await api.delete(`/talleres/${id}`);
        fetchTalleres();
      } catch (err) {
        alert('No se puede eliminar: tiene inscripciones activas');
      }
    }
  };

  const filtered = talleres.filter(t =>
    t.nombreTaller.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Talleres</h1>
          <button onClick={handleNew} className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-xl">
            + Nuevo Taller
          </button>
        </div>
        <input
          className="w-full md:w-96 bg-white/10 border border-white/20 rounded-xl px-4 py-2 placeholder-white/50"
          placeholder="Buscar taller..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/70 text-sm">
                <th className="p-3">Nombre</th>
                <th className="p-3">Costo Mensual</th>
                <th className="p-3">Cupo Máximo</th>
                <th className="p-3">Horario</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-white/50">No se encontraron talleres.</td></tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/10">
                    <td className="p-3 font-medium">{t.nombreTaller}</td>
                    <td className="p-3">${Number(t.costoMensual).toFixed(2)}</td>
                    <td className="p-3">{t.cupoMaximo}</td>
                    <td className="p-3 text-sm text-white/70">{t.horarioDescripcion || '-'}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleEdit(t)} className="text-blue-400 hover:underline text-sm">Editar</button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:underline text-sm">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
             title={editTaller ? 'Editar Taller' : 'Nuevo Taller'}>
        <TallerForm taller={editTaller} onClose={() => setModalOpen(false)} onSave={fetchTalleres} />
      </Modal>
    </>
  );
}

export default Talleres;
