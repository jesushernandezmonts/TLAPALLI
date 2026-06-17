import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import InstructorForm from '../components/InstructorForm';
import { Plus, Edit3, Trash2, UserSquare2, Palette, Mail, Send, Power, RefreshCw, Loader2, Users, CheckCircle2, Clock, Ban, Eye, FileText, ExternalLink, Filter } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import DocumentViewerModal from '../components/DocumentViewerModal';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import FilterDropdown from '../components/FilterDropdown';

function Instructores() {
  const [instructores, setInstructores] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editInstructor, setEditInstructor] = useState(null);
  const [detailInstructor, setDetailInstructor] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const instructoresPerPage = 8;
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {}, confirmText: 'Eliminar' });
  const [toast, setToast] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [activeDoc, setActiveDoc] = useState(null);

  useEffect(() => {
    fetchInstructores();
    fetchTalleres();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleViewDetail = (instructor) => {
    setDetailInstructor(instructor);
  };

  const showToast = (title, message = '', type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openConfirm = (config) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };

  const handleDelete = (id) => {
    openConfirm({
      title: '¿Eliminar Instructor?',
      message: 'Esta acción es permanente y eliminará la cuenta del profesor de la base de datos, accesos de inicio de sesión y todo su historial de talleres asignados. ¿Deseas continuar?',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => {
        try {
          await api.delete(`/instructores/${id}`);
          showToast('Instructor eliminado', 'El instructor se eliminó correctamente.', 'delete');
          fetchInstructores();
        } catch (err) {
          showToast('Error al eliminar', 'No se pudo eliminar al instructor.', 'error');
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const handleToggleActivo = (id, currentEstado) => {
    const isActivating = currentEstado === 'Inactivo';
    openConfirm({
      title: isActivating ? '¿Activar Instructor?' : '¿Desactivar Instructor?',
      message: isActivating
        ? 'El instructor volverá a quedar marcado como activo y recuperará todos los accesos al sistema. ¿Deseas continuar?'
        : 'El instructor quedará marcado como inactivo y no podrá iniciar sesión en su cuenta ni gestionar pases de lista. ¿Deseas continuar?',
      confirmText: isActivating ? 'Sí, activar' : 'Sí, desactivar',
      onConfirm: async () => {
        try {
          await api.patch(`/instructores/${id}/toggle-activo`);
          showToast(
            isActivating ? 'Instructor activado' : 'Instructor desactivado',
            'La información del instructor se actualizó correctamente.',
            'success'
          );
          fetchInstructores();
        } catch (err) {
          showToast('Error', 'No se pudo actualizar el estado del instructor.', 'error');
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const handleReenviarActivacion = async (id) => {
    setSendingEmail(id);
    try {
      await api.post(`/instructores/${id}/reenviar-activacion`);
      showToast('Enlace enviado', 'Enlace enviado exitosamente al correo del instructor.', 'success');
    } catch (err) {
      showToast('Error al enviar', err.response?.data?.message || 'Intente de nuevo', 'error');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleDeleteCv = async (instructorId) => {
    if (window.confirm('¿Seguro que deseas eliminar el currículum de este instructor?')) {
      try {
        await api.delete(`/instructores/${instructorId}/cv`);
        showToast('CV Eliminado', 'El currículum se eliminó correctamente.', 'success');
        setDetailInstructor(prev => ({ ...prev, curriculumUrl: null }));
        fetchInstructores();
      } catch (err) {
        showToast('Error', 'No se pudo eliminar el currículum.', 'error');
      }
    }
  };

  const handleDeleteTemario = async (instructorId) => {
    if (window.confirm('¿Seguro que deseas eliminar el temario de este instructor?')) {
      try {
        await api.delete(`/instructores/${instructorId}/temario`);
        showToast('Temario Eliminado', 'El temario se eliminó correctamente.', 'success');
        setDetailInstructor(prev => ({ ...prev, temarioUrl: null }));
        fetchInstructores();
      } catch (err) {
        showToast('Error', 'No se pudo eliminar el temario.', 'error');
      }
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    fetchInstructores();
    if (editInstructor) {
      showToast('Cambios guardados', 'La información del instructor se actualizó correctamente.', 'success');
    } else {
      showToast('Instructor registrado', 'El instructor se registró y se envió el correo de activación.', 'success');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const filtered = instructores.filter(i => {
    const matchesSearch =
      i.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (i.email && i.email.toLowerCase().includes(search.toLowerCase())) ||
      (i.telefono && i.telefono.includes(search)) ||
      (i.taller?.nombreTaller && i.taller.nombreTaller.toLowerCase().includes(search.toLowerCase()));
    const matchesEstado = estadoFilter === 'todos' || i.estado.toLowerCase() === estadoFilter.toLowerCase();
    return matchesSearch && matchesEstado;
  });

  if (sortBy) {
    filtered.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'nombre': valA = a.nombre.toLowerCase(); valB = b.nombre.toLowerCase(); break;
        case 'estado': valA = a.estado; valB = b.estado; break;
        case 'taller': valA = a.taller?.nombreTaller || ''; valB = b.taller?.nombreTaller || ''; break;
        default: return 0;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }
  const totalPages = Math.max(1, Math.ceil(filtered.length / instructoresPerPage));
  const startIndex = (currentPage - 1) * instructoresPerPage;
  const paginatedInstructores = filtered.slice(startIndex, startIndex + instructoresPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Activo':
        return {
          icon: <CheckCircle2 size={10} />,
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: 'Activo',
        };
      case 'Pendiente':
        return {
          icon: <Clock size={10} />,
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: 'Pendiente',
        };
      case 'Inactivo':
        return {
          icon: <Ban size={10} />,
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          label: 'Inactivo',
        };
      default:
        return {
          icon: null,
          classes: 'bg-white/5 text-white/40 border-white/10',
          label: estado,
        };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Gestión de Instructores
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Administra el cuerpo docente
          </p>
        </div>
      </div>

      {/* KPIs Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total" value={instructores.length} color="white" />
        <StatCard icon={CheckCircle2} label="Activos" value={instructores.filter(i => i.estado === 'Activo').length} color="emerald" />
        <StatCard icon={Clock} label="Pendientes" value={instructores.filter(i => i.estado === 'Pendiente').length} color="amber" />
        <StatCard icon={Ban} label="Inactivos" value={instructores.filter(i => i.estado === 'Inactivo').length} color="rose" />
      </div>

      {/* Barra de Controles Unificada en Glassmorphic */}
      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/20 bg-slate-950/45 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl ring-1 ring-white/5 mt-2">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, teléfono o taller..."
          onClear={() => setCurrentPage(1)}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Filtro por Estado */}
          <div className="relative" ref={dropdownRef}>
            <FilterDropdown
              icon={<Filter size={16} />}
              value={estadoFilter}
              options={[
                { value: 'todos', label: 'Todos los Estados' },
                { value: 'Activo', label: 'Activos' },
                { value: 'Pendiente', label: 'Pendientes' },
                { value: 'Inactivo', label: 'Inactivos' },
              ]}
              isOpen={openDropdown}
              onToggle={() => setOpenDropdown(!openDropdown)}
              onChange={(value) => { setEstadoFilter(value); setOpenDropdown(false); setCurrentPage(1); }}
              className="sm:w-48"
            />
          </div>

          {/* Botón Nuevo Instructor */}
          <button 
            onClick={handleNew} 
            className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ring-1 ring-pink-300/20"
          >
            <Plus size={16} />
            <span className="whitespace-nowrap">Nuevo Instructor</span>
          </button>
        </div>
      </div>

      <div className="responsive-table-container relative z-10 mt-2">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Instructor</th>
              <th className="hidden md:table-cell">Correo</th>
              <th className="hidden lg:table-cell">Teléfono</th>
              <th className="hidden sm:table-cell">Taller Asignado</th>
              <th className="text-center">Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="6" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando instructores...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-20 text-center text-white/20 italic font-medium">No se encontraron registros.</td></tr>
            ) : (
              paginatedInstructores.map((i, index) => {
                const badge = getEstadoBadge(i.estado);
                return (
                  <tr key={i.id} className="hover:bg-white/5 transition group">
                    <td data-label="Instructor">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 font-bold">
                          {i.nombre ? i.nombre[0].toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="font-bold text-white/90 drop-shadow-sm">{i.nombre}</div>
                          <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">ID: #{startIndex + index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Correo" className="hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                        <Mail size={14} className="text-pink-500/40 shrink-0" />
                        {i.email || <span className="opacity-20 italic">Sin correo</span>}
                      </div>
                    </td>
                    <td data-label="Teléfono" className="text-sm text-white/80 font-medium hidden lg:table-cell">{i.telefono || <span className="opacity-20">N/A</span>}</td>
                    <td data-label="Taller" className="hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                        {i.taller?.nombreTaller ? (
                          <>
                            <Palette size={14} className="text-pink-500/50 shrink-0" />
                            {i.taller.nombreTaller}
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Disponible / Sin Taller
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Estado" className="text-center">
                      <StatusBadge status={i.estado.toLowerCase()} label={i.estado} />
                    </td>
                    <td data-label="Acciones" className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button 
                          onClick={() => handleViewDetail(i)} 
                          className="p-2.5 bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-purple-500/30 text-white/60" 
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        {i.email && i.estado !== 'Inactivo' && (
                          <button 
                            onClick={() => handleReenviarActivacion(i.id)} 
                            disabled={sendingEmail === i.id}
                            className="p-2.5 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-blue-500/30 text-white/60 disabled:opacity-30" 
                            title={i.estado === 'Activo' ? 'Reenviar enlace de restablecimiento' : 'Reenviar activación'}
                          >
                            {sendingEmail === i.id ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(i)} 
                          className="p-2.5 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-cyan-500/30 text-white/60" 
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleActivo(i.id, i.estado)} 
                          className={`p-2.5 bg-white/5 rounded-xl transition-all duration-300 border border-white/5 text-white/60 ${
                            i.estado === 'Inactivo' 
                              ? 'hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30' 
                              : 'hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30'
                          }`}
                          title={i.estado === 'Inactivo' ? 'Reactivar' : 'Desactivar'}
                        >
                          <Power size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(i.id)} 
                          className="p-2.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-rose-500/30 text-white/60" 
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        itemsPerPage={instructoresPerPage}
        filteredLength={filtered.length}
        onPageChange={setCurrentPage}
      />

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText="Cancelar"
      />

      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* Modal Detalle Instructor */}
      {detailInstructor && (
        <Modal isOpen={!!detailInstructor} onClose={() => setDetailInstructor(null)} title="Detalle del Instructor">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <UserSquare2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{detailInstructor.nombre}</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border mt-1 ${getEstadoBadge(detailInstructor.estado).classes}`}>
                  {getEstadoBadge(detailInstructor.estado).icon}
                  {getEstadoBadge(detailInstructor.estado).label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:col-span-2 overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Correo Electrónico</p>
                <div className="flex items-center gap-2 text-sm text-white/80 truncate">
                  <Mail size={14} className="text-pink-400/60 shrink-0" />
                  <span className="truncate select-all">{detailInstructor.email || <span className="opacity-30 italic">Sin correo</span>}</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Teléfono</p>
                <p className="text-sm text-white/80 truncate">{detailInstructor.telefono || <span className="opacity-30 italic">No registrado</span>}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Taller Asignado</p>
                <div className="flex items-center gap-2 text-sm text-white/80 truncate">
                  <Palette size={14} className="text-pink-400/60 shrink-0" />
                  <span className="truncate">{detailInstructor.taller?.nombreTaller || <span className="opacity-30 italic">Sin taller asignado</span>}</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Estado de Cuenta</p>
                <p className="text-sm text-white/80">{detailInstructor.estado === 'Activo' ? 'Cuenta activada y operativa' : detailInstructor.estado === 'Pendiente' ? 'Esperando activación por correo' : 'Cuenta desactivada por administrador'}</p>
              </div>
              
              {/* Documentos Adjuntos */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:col-span-2 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Documentos Adjuntos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Tarjeta CV */}
                  <div className="bg-black/20 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText size={18} className="text-pink-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white/90 truncate">Currículum Vitae (CV)</p>
                        {detailInstructor.curriculumUrl ? (
                          <button
                            type="button"
                            onClick={() => setActiveDoc({
                              url: `${api.defaults.baseURL || 'http://localhost:3000'}${detailInstructor.curriculumUrl}`,
                              title: `CV - ${detailInstructor.nombre}`
                            })}
                            className="text-[10px] font-semibold text-pink-400 hover:text-pink-300 transition flex items-center gap-1 mt-0.5 cursor-pointer"
                          >
                            Ver PDF <ExternalLink size={10} />
                          </button>
                        ) : (
                          <p className="text-[10px] text-white/30 italic">No subido</p>
                        )}
                      </div>
                    </div>
                    {detailInstructor.curriculumUrl && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCv(detailInstructor.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 hover:border-rose-500/30 transition shrink-0"
                        title="Eliminar currículum"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Tarjeta Temario */}
                  <div className="bg-black/20 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText size={18} className="text-pink-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white/90 truncate">Temario (Syllabus)</p>
                        {detailInstructor.temarioUrl ? (
                          <button
                            type="button"
                            onClick={() => setActiveDoc({
                              url: `${api.defaults.baseURL || 'http://localhost:3000'}${detailInstructor.temarioUrl}`,
                              title: `Temario - ${detailInstructor.nombre}`
                            })}
                            className="text-[10px] font-semibold text-pink-400 hover:text-pink-300 transition flex items-center gap-1 mt-0.5 cursor-pointer"
                          >
                            Ver PDF <ExternalLink size={10} />
                          </button>
                        ) : (
                          <p className="text-[10px] text-white/30 italic">No subido</p>
                        )}
                      </div>
                    </div>
                    {detailInstructor.temarioUrl && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTemario(detailInstructor.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 hover:border-rose-500/30 transition shrink-0"
                        title="Eliminar temario"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDetailInstructor(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-bold transition"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => { setDetailInstructor(null); handleEdit(detailInstructor); }}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 rounded-xl text-white text-sm font-bold transition shadow-lg shadow-pink-600/20 flex items-center gap-2"
              >
                <Edit3 size={16} />
                Editar
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
             title={editInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}
             maxWidth="max-w-3xl">
        <InstructorForm instructor={editInstructor} talleres={talleres} onClose={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>

      <DocumentViewerModal
        isOpen={!!activeDoc}
        onClose={() => setActiveDoc(null)}
        url={activeDoc?.url}
        title={activeDoc?.title}
      />
    </div>
  );
}

export default Instructores;
