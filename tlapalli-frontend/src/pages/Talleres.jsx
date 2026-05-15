import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import TallerForm from '../components/TallerForm';
import { Plus, Search, Edit3, Trash2, Calendar } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Gestión de Talleres</h1>
          <p className="text-white/40 text-sm">Administra la oferta académica</p>
        </div>
        <button 
          onClick={handleNew} 
          className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Nuevo Taller
        </button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 placeholder-white/20 text-white focus:outline-none focus:border-pink-500/50 backdrop-blur-sm transition-all"
          placeholder="Buscar taller..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="responsive-table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Nombre del Taller</th>
              <th>Costo Mensual</th>
              <th>Cupo Máx.</th>
              <th>Horario / Descripción</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando talleres...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center text-white/20 italic font-medium">No se encontraron talleres.</td></tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="hover:bg-white/5 transition group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                        <Calendar size={20} />
                      </div>
                      <span className="font-bold text-white/90">{t.nombreTaller}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-emerald-300 font-bold drop-shadow-sm">${Number(t.costoMensual).toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-xs shadow-sm">
                      {t.cupoMaximo} lugares
                    </span>
                  </td>
                  <td className="text-sm text-white/90 font-medium max-w-xs truncate drop-shadow-sm">{t.horarioDescripcion || 'Sin horario definido'}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(t)} className="p-2 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-xl transition" title="Editar">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition" title="Eliminar">
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
             title={editTaller ? 'Editar Taller' : 'Nuevo Taller'}>
        <TallerForm taller={editTaller} onClose={() => setModalOpen(false)} onSave={fetchTalleres} />
      </Modal>
    </div>
  );
}

export default Talleres;
