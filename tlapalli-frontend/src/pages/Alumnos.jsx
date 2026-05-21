import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AlumnoForm from '../components/AlumnoForm';
import ExpedienteDigital from '../components/ExpedienteDigital';
import ConfirmModal from '../components/ConfirmModal';
import AlumnoDetail from '../components/AlumnoDetail';
import { Plus, Search, Edit3, Trash2, Power, Eye } from 'lucide-react';

function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAlumno, setEditAlumno] = useState(null);
  const [viewAlumno, setViewAlumno] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [alumnoToDelete, setAlumnoToDelete] = useState(null);

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

  const handleDelete = (id) => {
    setAlumnoToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!alumnoToDelete) return;
    try {
      await api.delete(`/alumnos/${alumnoToDelete}`);
      fetchAlumnos();
    } catch (err) {
      console.error('Error al eliminar alumno', err);
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

  const filtered = alumnos.filter(a => {
    const nombreCompleto = `${a.nombre || ''} ${a.apellidoPaterno || ''} ${a.apellidoMaterno || ''}`.toLowerCase();
    const curp = (a.curp || '').toLowerCase();
    const searchTerm = search.toLowerCase();
    return nombreCompleto.includes(searchTerm) || curp.includes(searchTerm);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Gestión de Alumnos</h1>
          <p className="text-white/40 text-sm">Administra la base de datos de estudiantes</p>
        </div>
      </div>
      
      {/* Barra de Controles Unificada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-md">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 placeholder-white/30 text-white focus:outline-none focus:border-pink-500/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20 hover:border-white/20 transition-all text-sm"
            placeholder="Buscar por nombre o CURP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={handleNew} 
          className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-2xl transition shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Nuevo Alumno
        </button>
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
                        {a.nombre ? a.nombre[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="font-bold text-white/90 drop-shadow-sm">
                          {`${a.nombre || ''} ${a.apellidoPaterno || ''} ${a.apellidoMaterno || ''}`.trim() || 'Sin Nombre'}
                        </div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">ID: #{a.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-white/80 font-medium">
                    {a.curp || <span className="opacity-40">No registrado</span>}
                  </td>
                  <td className="text-sm text-white/80 font-medium">{a.telefono || <span className="opacity-40">No registrado</span>}</td>
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
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button 
                        onClick={() => setViewAlumno(a)} 
                        className="p-2.5 bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-purple-500/30" 
                        title="Ver Ficha y Expediente"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(a)} 
                        className="p-2.5 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-cyan-500/30" 
                        title="Editar Datos y Expediente"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleActivo(a)} 
                        className={`p-2.5 bg-white/5 rounded-xl transition-all duration-300 border border-white/5 ${
                          a.estatusActivo 
                            ? 'hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30' 
                            : 'hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`} 
                        title={a.estatusActivo ? 'Desactivar Alumno' : 'Activar Alumno'}
                      >
                        <Power size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(a.id)} 
                        className="p-2.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-rose-500/30" 
                        title="Eliminar Permanente"
                      >
                        <Trash2 size={16} />
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
             title={editAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}
             maxWidth="max-w-3xl">
        <AlumnoForm alumno={editAlumno} onClose={() => setModalOpen(false)} onSave={handleSave} />
        {editAlumno && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <ExpedienteDigital alumnoId={editAlumno.id} />
          </div>
        )}
      </Modal>

      <Modal isOpen={viewAlumno !== null} onClose={() => setViewAlumno(null)}
             title="Detalles del Alumno"
             maxWidth="max-w-2xl">
        {viewAlumno && (
          <AlumnoDetail alumno={viewAlumno} onClose={() => setViewAlumno(null)} />
        )}
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        onConfirm={confirmDelete}
        title="¿Eliminar Alumno?"
        message="Esta acción es permanente y eliminará todo el historial de pagos y documentos del estudiante. ¿Deseas continuar?"
        confirmText="Sí, Eliminar"
      />
    </div>
  );
}

export default Alumnos;
