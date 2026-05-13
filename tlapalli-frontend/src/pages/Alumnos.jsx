import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AlumnoForm from '../components/AlumnoForm';
import ExpedienteDigital from '../components/ExpedienteDigital';
import { Plus, Search, Edit3, Trash2, Power } from 'lucide-react';

function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAlumno, setEditAlumno] = useState(null);

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const { data } = await api.get('/alumnos');
      setAlumnos(data);
    } catch (err) {
      console.error('Error al cargar alumnos', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alumno) => {
    setEditAlumno(alumno);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditAlumno(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este alumno?')) {
      try {
        await api.delete(`/alumnos/${id}`);
        fetchAlumnos();
      } catch (err) {
        console.error('Error al eliminar alumno', err);
      }
    }
  };

  const handleSave = () => {
    fetchAlumnos();
  };

  const handleToggleActivo = async (alumno) => {
    try {
      await api.patch(`/alumnos/${alumno.id}`, { estatusActivo: !alumno.estatusActivo });
      fetchAlumnos();
    } catch (err) {
      console.error('Error al cambiar estatus', err);
    }
  };

  const filtered = alumnos.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.curp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Gestión de Alumnos</h1>
          <p className="text-white/40 text-sm">Administra la base de datos de estudiantes</p>
        </div>
        <button 
          onClick={handleNew} 
          className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Nuevo Alumno
        </button>
      </div>
      
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 placeholder-white/20 text-white focus:outline-none focus:border-pink-500/50 backdrop-blur-sm transition-all"
          placeholder="Buscar por nombre o CURP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="responsive-table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>CURP</th>
              <th>Teléfono</th>
              <th className="text-center">Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando alumnos...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center text-white/20 italic font-medium">No se encontraron registros.</td></tr>
            ) : (
              filtered.map(a => (
                <tr key={a.id} className="hover:bg-white/5 transition group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 font-bold">
                        {a.nombre[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white/90">{a.nombre} {a.apellidoPaterno} {a.apellidoMaterno}</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest">ID: #{a.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs opacity-60">{a.curp}</td>
                  <td className="text-sm opacity-60">{a.telefono || <span className="opacity-20">No registrado</span>}</td>
                  <td className="text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      a.estatusActivo 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {a.estatusActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(a)} className="p-2 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-xl transition" title="Editar">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleToggleActivo(a)} className={`p-2 rounded-xl transition ${a.estatusActivo ? 'hover:bg-amber-500/10 hover:text-amber-400' : 'hover:bg-emerald-500/10 hover:text-emerald-400'}`} title={a.estatusActivo ? 'Desactivar' : 'Activar'}>
                        <Power size={18} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition" title="Eliminar">
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
             title={editAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}>
        <AlumnoForm alumno={editAlumno} onClose={() => setModalOpen(false)} onSave={handleSave} />
        {editAlumno && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <ExpedienteDigital alumnoId={editAlumno.id} />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Alumnos;
