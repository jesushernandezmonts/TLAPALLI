import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AlumnoForm from '../components/AlumnoForm';
import ConfirmModal from '../components/ConfirmModal';
import AlumnoDetail from '../components/AlumnoDetail';
import { Plus, Edit3, Trash2, Power, Eye, Filter } from 'lucide-react';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import FilterDropdown from '../components/FilterDropdown';

function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tallerFilter, setTallerFilter] = useState('todos');
  const [talleres, setTalleres] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [documentosPorAlumno, setDocumentosPorAlumno] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDocumentos, setLoadingDocumentos] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAlumno, setEditAlumno] = useState(null);
  const [viewAlumno, setViewAlumno] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [alumnoToDelete, setAlumnoToDelete] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [alumnoToToggle, setAlumnoToToggle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [successToast, setSuccessToast] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [openFilter, setOpenFilter] = useState(null);
  const alumnosPerPage = 8;

  // Documentos obligatorios
  const DOCS_REQUERIDOS = [
    { tipo: 'acta_nacimiento', label: 'Acta de Nacimiento' },
    { tipo: 'curp', label: 'CURP' },
    { tipo: 'comprobante_domicilio', label: 'Comprobante de Domicilio' },
    { tipo: 'identificacion', label: 'Identificación Oficial' },
    { tipo: 'foto', label: 'Fotografía' },
  ];

  useEffect(() => {
    fetchAlumnos();
    fetchTalleres();
    fetchInscripciones();
  }, []);

  useEffect(() => {
    const fetchDocumentosTodosAlumnos = async () => {
      try {
        setLoadingDocumentos(true);
        const { data } = await api.get('/documentos/all-grouped');
        setDocumentosPorAlumno(data || {});
      } catch (err) {
        console.error('Error al cargar documentos de alumnos', err);
        setDocumentosPorAlumno({});
      } finally {
        setLoadingDocumentos(false);
      }
    };

    if (alumnos.length > 0) {
      fetchDocumentosTodosAlumnos();
    }
  }, [alumnos]);

  const getEstadoExpediente = (alumnoId) => {
    const documentos = documentosPorAlumno[alumnoId] || [];
    const tiposSubidos = new Set(documentos.map(d => d.tipo));
    const docsFaltantes = DOCS_REQUERIDOS.filter(d => !tiposSubidos.has(d.tipo));
    const totalDocs = DOCS_REQUERIDOS.length;
    const docsSubidos = tiposSubidos.size;

    if (docsSubidos === 0) {
      return { estado: 'critico', color: 'rose', docsFaltantes, porcentaje: 0 };
    } else if (docsSubidos === totalDocs) {
      return { estado: 'completo', color: 'emerald', docsFaltantes: [], porcentaje: 100 };
    } else if (docsSubidos >= totalDocs * 0.6) {
      return { estado: 'casi_completo', color: 'amber', docsFaltantes, porcentaje: Math.round((docsSubidos / totalDocs) * 100) };
    } else {
      return { estado: 'incompleto', color: 'rose', docsFaltantes, porcentaje: Math.round((docsSubidos / totalDocs) * 100) };
    }
  };

  useEffect(() => {
    const closeFilters = (event) => {
      if (!event.target.closest('[data-filter-dropdown]')) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', closeFilters);
    return () => document.removeEventListener('mousedown', closeFilters);
  }, []);

  const fetchAlumnos = async () => {
    try {
      const { data } = await api.get('/alumnos');
      setAlumnos(data);
    } catch (err) {
      console.error('Error al cargar alumnos', err);
      showToast('Error al cargar alumnos', 'No se pudieron cargar los alumnos.', 'error');
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
      showToast('Error al cargar talleres', 'No se pudieron cargar los talleres.', 'error');
    }
  };

  const fetchInscripciones = async () => {
    try {
      const { data } = await api.get('/inscripciones');
      setInscripciones(data.filter(i => i.estatusPago !== 'baja'));
    } catch (err) {
      console.error('Error al cargar inscripciones', err);
      showToast('Error al cargar inscripciones', 'No se pudieron cargar las inscripciones.', 'error');
    }
  };

  const showToast = (title, message, type = 'success') => {
    setToastType(type);
    setSuccessToast(title);
      setToastMessage(message || '');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Create a toast object for the Toast component
  const toast = successToast ? { title: successToast, message: toastMessage, type: toastType } : null;

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
      setDeleteConfirmOpen(false);
      setAlumnoToDelete(null);
      showToast('Alumno eliminado', null, 'delete');
    } catch (err) {
      console.error('Error al eliminar alumno', err);
      showToast('Error al eliminar', 'No se pudo eliminar el alumno.', 'error');
    }
  };

  const handleSave = () => {
    fetchAlumnos();
    fetchInscripciones();
    if (editAlumno) {
      showToast('Cambios guardados', null, 'success');
    } else {
      showToast('Alumno registrado', null, 'success');
    }
  };

  const handleToggleActivo = (alumno) => {
    setAlumnoToToggle(alumno);
    setStatusConfirmOpen(true);
  };

  const confirmToggleActivo = async () => {
    if (!alumnoToToggle) return;
    try {
      await api.patch(`/alumnos/${alumnoToToggle.id}`, { estatusActivo: !alumnoToToggle.estatusActivo });
      fetchAlumnos();
      setStatusConfirmOpen(false);
      setAlumnoToToggle(null);
      showToast(
        alumnoToToggle.estatusActivo ? 'Alumno desactivado' : 'Alumno activado',
        null,
        'success'
      );
    } catch (err) {
      console.error('Error al cambiar estatus', err);
      showToast('Error al cambiar estado', 'No se pudo actualizar el estado del alumno.', 'error');
    }
  };

  const filtered = alumnos.filter(a => {
    const nombreCompleto = `${a.nombre || ''} ${a.apellidoPaterno || ''} ${a.apellidoMaterno || ''}`.toLowerCase();
    const telefono = (a.telefono || '').toLowerCase();
    const searchTerm = search.toLowerCase();
    const matchesSearch = nombreCompleto.includes(searchTerm) || telefono.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'activos' && a.estatusActivo) ||
      (statusFilter === 'inactivos' && !a.estatusActivo);
    const matchesTaller =
      tallerFilter === 'todos' ||
      inscripciones.some(i => i.alumnoId === a.id && String(i.tallerId) === tallerFilter);
    return matchesSearch && matchesStatus && matchesTaller;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / alumnosPerPage));
  const startIndex = (currentPage - 1) * alumnosPerPage;
  const paginatedAlumnos = filtered.slice(startIndex, startIndex + alumnosPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, tallerFilter]);

  const getTalleresAlumno = (alumnoId) =>
    inscripciones
      .filter(i => i.alumnoId === alumnoId)
      .map(i => i.taller?.nombreTaller || talleres.find(t => t.id === i.tallerId)?.nombreTaller)
      .filter(Boolean)
      .join(', ');

  return (
    <div className="space-y-8">
      <Toast toast={toast} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Gestión de Alumnos
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Administra la base de datos de estudiantes
          </p>
        </div>
      </div>

      {/* Barra de Controles Unificada */}
      <div className="relative z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-white/20 bg-slate-950/45 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl ring-1 ring-white/5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o teléfono..."
          onClear={() => setCurrentPage(1)}
        />
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <FilterDropdown
            icon={<Filter size={16} />}
            value={statusFilter}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'activos', label: 'Activos' },
              { value: 'inactivos', label: 'Inactivos' },
            ]}
            isOpen={openFilter === 'status'}
            onToggle={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
            onChange={(value) => {
              setStatusFilter(value);
              setOpenFilter(null);
            }}
            className="sm:w-40"
          />
          <FilterDropdown
            value={tallerFilter}
            options={[
              { value: 'todos', label: 'Todos los talleres' },
              ...talleres.map(taller => ({ value: String(taller.id), label: taller.nombreTaller })),
            ]}
            isOpen={openFilter === 'taller'}
            onToggle={() => setOpenFilter(openFilter === 'taller' ? null : 'taller')}
            onChange={(value) => {
              setTallerFilter(value);
              setOpenFilter(null);
            }}
            className="sm:w-56"
          />
          {(statusFilter !== 'todos' || tallerFilter !== 'todos' || search) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('todos');
                setTallerFilter('todos');
                setOpenFilter(null);
              }}
              className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-white/70 transition hover:border-pink-400/30 hover:bg-pink-500/15 hover:text-white sm:w-auto"
            >
              Limpiar
            </button>
          )}
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-black uppercase tracking-wider text-white/70">
            {filtered.length} {filtered.length === 1 ? 'alumno' : 'alumnos'}
          </div>
        </div>
        <button
          onClick={handleNew}
          className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ring-1 ring-pink-300/20"
        >
          <Plus size={16} />
          Nuevo Alumno
        </button>
      </div>

      <div className="responsive-table-container relative z-10 mt-2">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Padecimientos</th>
              <th>Teléfono</th>
              <th className="text-center">Expediente</th>
              <th className="text-center">Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="6" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando alumnos...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-20 text-center text-white/20 italic font-medium">No se encontraron registros.</td></tr>
            ) : (
              paginatedAlumnos.map((a, index) => (
                <tr key={a.id} className="hover:bg-white/5 transition group">
                  <td data-label="Alumno">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 font-bold">
                        {a.nombre ? a.nombre[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="font-bold text-white/90 drop-shadow-sm">
                          {`${a.nombre || ''} ${a.apellidoPaterno || ''} ${a.apellidoMaterno || ''}`.trim() || 'Sin Nombre'}
                        </div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">ID: #{startIndex + index + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Padecimientos" className="text-xs text-white/80 font-medium">
                    {a.padecimientos ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 max-w-[180px] select-none" title={a.padecimientos}>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                        <span className="truncate">{a.padecimientos}</span>
                      </span>
                    ) : (
                      <span className="opacity-40 italic">Ninguno</span>
                    )}
                  </td>
                  <td data-label="Teléfono" className="text-sm text-white/80 font-medium">{a.telefono || <span className="opacity-40">No registrado</span>}</td>
                  <td data-label="Expediente" className="text-center">
                    {loadingDocumentos ? (
                      <span className="text-[10px] text-white/40 animate-pulse">Cargando...</span>
                    ) : (
                      (() => {
                        const { estado, color, docsFaltantes, porcentaje } = getEstadoExpediente(a.id);
                        let badgeText = '';
                        let badgeTitle = '';
                        
                        if (estado === 'completo') {
                          badgeText = 'Completo';
                          badgeTitle = 'Todos los documentos subidos';
                        } else if (estado === 'critico') {
                          badgeText = 'Sin documentos';
                          badgeTitle = `Faltan todos los documentos: ${docsFaltantes.map(d => d.label).join(', ')}`;
                        } else {
                          badgeText = `${porcentaje}%`;
                          badgeTitle = `Faltan: ${docsFaltantes.map(d => d.label).join(', ')}`;
                        }

                        return (
                          <span 
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border cursor-help ${
                              color === 'emerald'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : color === 'amber'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                            title={badgeTitle}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              color === 'emerald' ? 'bg-emerald-400' : color === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                            }`} />
                            {badgeText}
                          </span>
                        );
                      })()
                    )}
                  </td>
                  <td data-label="Estado" className="text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${a.estatusActivo
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                      {a.estatusActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Acciones" className="text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => setViewAlumno({ ...a, displayId: startIndex + index + 1 })}
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
                        className={`p-2.5 bg-white/5 rounded-xl transition-all duration-300 border border-white/5 ${a.estatusActivo
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        itemsPerPage={alumnosPerPage}
        filteredLength={filtered.length}
        onPageChange={setCurrentPage}
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); fetchAlumnos(); }}
        title={editAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}
        maxWidth="max-w-3xl">
        <AlumnoForm alumno={editAlumno} onClose={() => { setModalOpen(false); fetchAlumnos(); }} onSave={handleSave} />
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
        confirmText="Sí, eliminar"
      />
      <ConfirmModal
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        onConfirm={confirmToggleActivo}
        title={alumnoToToggle?.estatusActivo ? '¿Desactivar alumno?' : '¿Activar alumno?'}
        message={alumnoToToggle?.estatusActivo
          ? 'El alumno quedará marcado como inactivo. ¿Deseas continuar?'
          : 'El alumno volverá a quedar marcado como activo. ¿Deseas continuar?'}
        confirmText={alumnoToToggle?.estatusActivo ? 'Sí, desactivar' : 'Sí, activar'}
      />
    </div>
  );
}

 
export default Alumnos;
