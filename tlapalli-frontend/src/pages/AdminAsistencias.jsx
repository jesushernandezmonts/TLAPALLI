import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import useSocket from '../hooks/useSocket';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Eye,
  Calendar,
  AlertCircle,
  BookOpen,
  Filter,
  FileText,
} from 'lucide-react';

function AdminAsistencias() {
  const [supervisiones, setSupervisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal para detalle de instructor y sus asistencias
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedGrupoId, setSelectedGrupoId] = useState(null);
  const [historialGrupo, setHistorialGrupo] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Ver asistencias de una fecha en particular
  const [fechaDetalle, setFechaDetalle] = useState(null);
  const [asistenciasFecha, setAsistenciasFecha] = useState([]);
  const [loadingFecha, setLoadingFecha] = useState(false);

  useEffect(() => {
    fetchSupervisionData();
  }, []);

  // Escuchar evento socket para actualizar en tiempo real cuando un profe pase lista
  useSocket('asistencias:updated', () => {
    fetchSupervisionData();
    if (selectedGrupoId) {
      fetchHistorialGrupo(selectedGrupoId);
    }
  });

  const fetchSupervisionData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/asistencias/supervision-instructores');
      setSupervisiones(data);
    } catch (err) {
      console.error('Error al cargar la supervisión de asistencias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (instructor) => {
    setSelectedInstructor(instructor);
    setDetailModalOpen(true);
    setFechaDetalle(null);
    setAsistenciasFecha([]);
    if (instructor.grupos && instructor.grupos.length > 0) {
      const primerGrupo = instructor.grupos[0].id;
      setSelectedGrupoId(primerGrupo);
      fetchHistorialGrupo(primerGrupo);
    } else {
      setSelectedGrupoId(null);
      setHistorialGrupo([]);
    }
  };

  const fetchHistorialGrupo = async (grupoId) => {
    try {
      setLoadingHistorial(true);
      const { data } = await api.get(`/asistencias/grupo/${grupoId}/historial`);
      setHistorialGrupo(data);
    } catch (err) {
      console.error('Error al cargar el historial del grupo:', err);
      setHistorialGrupo([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleVerAsistenciasFecha = async (fechaStr) => {
    if (!selectedGrupoId) return;
    try {
      setLoadingFecha(true);
      setFechaDetalle(fechaStr);
      const { data } = await api.get(`/asistencias/grupo/${selectedGrupoId}?fecha=${fechaStr}`);
      setAsistenciasFecha(data);
    } catch (err) {
      console.error('Error al consultar asistencias por fecha:', err);
      setAsistenciasFecha([]);
    } finally {
      setLoadingFecha(false);
    }
  };

  // Filtrado de instructores
  const filteredInstructores = supervisiones.filter((inst) => {
    const query = search.toLowerCase();
    const matchesSearch =
      inst.nombre.toLowerCase().includes(query) ||
      inst.taller.toLowerCase().includes(query) ||
      (inst.email && inst.email.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (estadoFilter === 'tomada') return inst.listaTomadaHoy;
    if (estadoFilter === 'pendiente') return !inst.listaTomadaHoy && inst.totalGrupos > 0;

    return true;
  });

  // Métricas calculadas
  const totalInstructores = supervisiones.length;
  const instructoresConGrupos = supervisiones.filter((i) => i.totalGrupos > 0);
  const pasaronListaHoy = supervisiones.filter((i) => i.listaTomadaHoy).length;
  const pendientesHoy = instructoresConGrupos.length - pasaronListaHoy;
  const promedioAsistenciaGlobal =
    supervisiones.length > 0
      ? Math.round(
          supervisiones.reduce((acc, curr) => acc + curr.porcentajeAsistencia, 0) /
            (supervisiones.filter((i) => i.totalRegistros > 0).length || 1)
        )
      : 0;

  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentInstructores = filteredInstructores.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInstructores.length / itemsPerPage);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 text-pink-400 border border-pink-500/30">
              <ClipboardCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Supervisión de Asistencias</h1>
              <p className="text-xs text-slate-400 font-medium">
                Monitorea el pase de lista diario y el cumplimiento de asistencia de cada profesor
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchSupervisionData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white/80 hover:text-white font-semibold text-xs transition border border-white/10 self-start md:self-auto"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjetas Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Profesores Activos"
          value={totalInstructores}
          color="white"
        />
        <StatCard
          icon={CheckCircle2}
          label="Tomaron Lista Hoy"
          value={pasaronListaHoy}
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="Pendientes Hoy"
          value={pendientesHoy}
          color="amber"
        />
        <StatCard
          icon={BarChart3}
          label="% Asistencia Promedio"
          value={`${promedioAsistenciaGlobal}%`}
          color="purple"
        />
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por profesor o taller..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium shrink-0">Estatus:</span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'tomada', label: 'Tomada Hoy' },
            { id: 'pendiente', label: 'Pendiente Hoy' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setEstadoFilter(f.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                estadoFilter === f.id
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Supervisión */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw size={28} className="animate-spin text-pink-500" />
            <p className="text-sm font-medium">Cargando datos de asistencias...</p>
          </div>
        ) : filteredInstructores.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle size={32} className="text-slate-500" />
            <p className="text-sm font-medium text-white">No se encontraron profesores</p>
            <p className="text-xs text-slate-500">Prueba ajustando los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">Profesor / Taller</th>
                  <th className="py-4 px-6 text-center">Grupos</th>
                  <th className="py-4 px-6 text-center">Pase de Lista Hoy</th>
                  <th className="py-4 px-6 text-center">Última Fecha</th>
                  <th className="py-4 px-6 text-center">% Asistencia</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentInstructores.map((inst) => (
                  <tr key={inst.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {inst.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{inst.nombre}</p>
                          <span className="text-xs text-pink-400 font-medium">{inst.taller}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-white">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-xs">
                        <BookOpen size={13} className="text-slate-400" />
                        {inst.totalGrupos} {inst.totalGrupos === 1 ? 'grupo' : 'grupos'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      {inst.totalGrupos === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Sin grupos
                        </span>
                      ) : inst.listaTomadaHoy ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                          <CheckCircle2 size={13} />
                          Tomada Hoy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                          <Clock size={13} />
                          Pendiente
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center text-xs font-medium text-slate-400">
                      {inst.ultimaFecha ? (
                        <span className="flex items-center justify-center gap-1 text-white">
                          <Calendar size={13} className="text-pink-400" />
                          {inst.ultimaFecha}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Sin registros</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-xs text-white">
                          {inst.porcentajeAsistencia}%
                        </span>
                        <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              inst.porcentajeAsistencia >= 85
                                ? 'bg-emerald-400'
                                : inst.porcentajeAsistencia >= 70
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${inst.porcentajeAsistencia}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenDetail(inst)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-white/10 shadow-sm"
                      >
                        <Eye size={14} className="text-pink-400" />
                        <span>Ver Historial</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal de Detalle de Instructor */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedInstructor ? `Asistencias - ${selectedInstructor.nombre}` : 'Detalle de Asistencias'}
        maxWidth="max-w-4xl"
      >
        {selectedInstructor && (
          <div className="space-y-6">
            {/* Header del Instructor en Modal */}
            <div className="flex items-center justify-between p-4 bg-slate-800/80 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white font-black text-lg">
                  {selectedInstructor.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedInstructor.nombre}</h3>
                  <p className="text-xs text-pink-400">{selectedInstructor.taller}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div className="bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase font-black">Asistencia Global</p>
                  <p className="text-sm font-bold text-emerald-400">{selectedInstructor.porcentajeAsistencia}%</p>
                </div>
                <div className="bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase font-black">Total Pases</p>
                  <p className="text-sm font-bold text-white">{selectedInstructor.totalRegistros}</p>
                </div>
              </div>
            </div>

            {/* Selector de Grupos del Profesor */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Selecciona un grupo para consultar su historial:
              </label>
              {selectedInstructor.grupos.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-800/50 p-3 rounded-xl">
                  Este profesor no tiene grupos asignados.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedInstructor.grupos.map((grupo) => (
                    <button
                      key={grupo.id}
                      onClick={() => {
                        setSelectedGrupoId(grupo.id);
                        setFechaDetalle(null);
                        setAsistenciasFecha([]);
                        fetchHistorialGrupo(grupo.id);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedGrupoId === grupo.id
                          ? 'bg-pink-600/20 border-pink-500/50 text-white shadow-lg shadow-pink-500/10'
                          : 'bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <p className="font-bold text-xs text-white">{grupo.nombreGrupo}</p>
                      <p className="text-[10px] text-slate-400">
                        {grupo.horario} • {grupo.dias}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{grupo.totalAlumnos} Alumnos</span>
                        {grupo.listaTomadaHoy ? (
                          <span className="text-emerald-400 font-bold">Tomada Hoy ✓</span>
                        ) : (
                          <span className="text-amber-400 font-bold">Pendiente</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fechas de Pases de Lista del Grupo Seleccionado */}
            {selectedGrupoId && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Calendar size={16} className="text-pink-400" />
                  Fechas de Pases de Lista Registradas
                </h4>

                {loadingHistorial ? (
                  <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw size={18} className="animate-spin text-pink-400" />
                    <span className="text-xs">Cargando fechas...</span>
                  </div>
                ) : historialGrupo.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-800/40 p-4 rounded-xl text-center">
                    No se han registrado pases de lista en este grupo aún.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {historialGrupo.map((h) => (
                      <button
                        key={h.fecha}
                        onClick={() => handleVerAsistenciasFecha(h.fecha)}
                        className={`p-3 rounded-xl border text-left transition ${
                          fechaDetalle === h.fecha
                            ? 'bg-gradient-to-r from-pink-600/30 to-orange-600/20 border-pink-500 text-white'
                            : 'bg-slate-900/60 border-white/10 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs mb-1">
                          <span>{h.fecha}</span>
                          <span className="text-emerald-400">{h.asistencias} / {h.total} Presentes</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="text-emerald-400">P: {h.asistencias}</span>
                          <span className="text-rose-400">F: {h.faltas}</span>
                          <span className="text-amber-400">J: {h.justificadas}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Listado de Alumnos en la Fecha Seleccionada */}
            {fechaDetalle && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FileText size={16} className="text-pink-400" />
                    Asistencia del {fechaDetalle}
                  </h4>
                  <span className="text-xs text-slate-400">Total: {asistenciasFecha.length} alumnos</span>
                </div>

                {loadingFecha ? (
                  <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw size={18} className="animate-spin text-pink-400" />
                    <span className="text-xs">Cargando registro de la fecha...</span>
                  </div>
                ) : asistenciasFecha.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay detalles registrados para esta fecha.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/60 divide-y divide-white/5">
                    {asistenciasFecha.map((a) => {
                      const alumno = a.grupoAlumno?.alumno;
                      return (
                        <div key={a.id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-white">
                              {alumno ? `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno || ''}` : 'Alumno'}
                            </p>
                            {a.observaciones && (
                              <p className="text-[11px] text-slate-400 italic mt-0.5">"{a.observaciones}"</p>
                            )}
                          </div>
                          <div>
                            {a.estado === 'asistencia' && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                Asistencia
                              </span>
                            )}
                            {a.estado === 'falta' && (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                                Falta
                              </span>
                            )}
                            {a.estado === 'justificada' && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                                Justificada
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminAsistencias;
