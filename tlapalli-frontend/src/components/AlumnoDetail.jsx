import { useState, useEffect } from 'react';
import api from '../services/api';
import { Phone, FileText, Activity, ExternalLink, User, Users, Palette, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import DocumentViewerModal from './DocumentViewerModal';

function AlumnoDetail({ alumno, onClose }) {
  const [documentos, setDocumentos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInscripciones, setLoadingInscripciones] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const { data } = await api.get(`/documentos/alumno/${alumno.id}`);
        setDocumentos(data);
      } catch (err) {
        console.error('Error al cargar documentos del expediente:', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchInscripciones = async () => {
      try {
        const { data } = await api.get('/inscripciones', { params: { alumnoId: alumno.id } });
        setInscripciones(data.filter(i => i.estatusPago !== 'baja'));
      } catch (err) {
        console.error('Error al cargar talleres del alumno:', err);
      } finally {
        setLoadingInscripciones(false);
      }
    };
    fetchDocumentos();
    fetchInscripciones();
  }, [alumno.id]);

  const initials = alumno.nombre ? alumno.nombre[0].toUpperCase() : '?';

  // Documentos obligatorios definidos con etiqueta visual
  const DOCS_REQUERIDOS = [
    { tipo: 'acta_nacimiento',       label: 'Acta de Nacimiento' },
    { tipo: 'curp',                  label: 'CURP' },
    { tipo: 'comprobante_domicilio', label: 'Comprobante de Domicilio' },
    { tipo: 'identificacion',        label: 'Identificación Oficial' },
    { tipo: 'foto',                  label: 'Fotografía' },
  ];

  const tiposSubidos = new Set(documentos.map(d => d.tipo));
  const docsFaltantes = DOCS_REQUERIDOS.filter(d => !tiposSubidos.has(d.tipo));
  const expedienteCompleto = docsFaltantes.length === 0;

  return (
    <>
      <div className="space-y-6 text-left">
        {/* Encabezado del Perfil */}
        <div className="flex items-center gap-4 bg-slate-800/80 border border-white/15 rounded-2xl p-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-pink-600/10 shrink-0 select-none">
            {initials}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-extrabold text-white truncate drop-shadow-sm">
              {alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}
            </h3>

            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
              alumno.estatusActivo
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {alumno.estatusActivo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-1">ID del Estudiante: #{alumno.displayId || alumno.id}</p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-2 border-b border-white/15 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
              activeTab === 'general'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                : 'text-white/60 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            Información General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documentos')}
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'documentos'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                : 'text-white/60 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            Expediente Digital
          </button>
        </div>

        {/* Contenido de las Pestañas */}
        {activeTab === 'general' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Datos Personales */}
            <div className="bg-slate-800/80 border border-white/15 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-pink-500 border-b border-white/15 pb-2">Información Personal</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-white/40 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[9px] text-white/30 uppercase font-black block">Nombre(s)</span>
                    <span className="text-sm text-white/80 font-medium">{alumno.nombre || <span className="opacity-40 italic">No registrado</span>}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users size={16} className="text-white/40 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[9px] text-white/30 uppercase font-black block">Apellidos</span>
                    <span className="text-sm text-white/80 font-medium">
                      {`${alumno.apellidoPaterno || ''} ${alumno.apellidoMaterno || ''}`.trim() || <span className="opacity-40 italic">No registrados</span>}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-white/40 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[9px] text-white/30 uppercase font-black block">Teléfono de Contacto</span>
                    <span className="text-sm text-white/80 font-medium">{alumno.telefono || <span className="opacity-40 italic">No registrado</span>}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity size={16} className="text-white/40 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[9px] text-white/30 uppercase font-black block">Padecimientos o Notas Médicas</span>
                    <span className="text-sm text-white/80 font-medium">{alumno.padecimientos || <span className="opacity-40 italic">Ninguno</span>}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Talleres Inscritos */}
            <div className="bg-slate-800/80 border border-white/15 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-pink-500 border-b border-white/15 pb-2 shrink-0">Talleres Inscritos</h4>
                <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {loadingInscripciones ? (
                    <p className="text-xs text-white/30 italic py-4">Cargando talleres...</p>
                  ) : inscripciones.length === 0 ? (
                    <p className="text-xs text-white/40 italic py-4 flex items-center gap-1.5 justify-center">
                      <Palette size={14} className="opacity-40" /> No tiene talleres seleccionados
                    </p>
                  ) : (
                    inscripciones.map(inscripcion => (
                      <div key={inscripcion.id} className="flex items-center gap-2 rounded-xl border border-pink-500/15 bg-pink-500/10 px-3 py-2">
                        <Palette size={14} className="text-pink-400 shrink-0" />
                        <span className="text-xs font-bold text-white/85">
                          {inscripcion.taller?.nombreTaller || `Taller #${inscripcion.tallerId}`}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expediente Digital - Lista de documentos subidos */}
            <div className="bg-slate-800/80 border border-white/15 rounded-2xl p-5 flex flex-col">
              <h4 className="text-xs font-black uppercase tracking-widest text-pink-500 border-b border-white/15 pb-2 shrink-0">Expediente Digital</h4>
              
              <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 max-h-[220px] pr-1">
                {loading ? (
                  <p className="text-xs text-white/30 italic py-4">Cargando expediente...</p>
                ) : documentos.length === 0 ? (
                  <p className="text-xs text-white/40 italic py-4 flex items-center gap-1.5 justify-center">
                    <FileText size={14} className="opacity-40" /> Sin documentos cargados
                  </p>
                ) : (
                  documentos.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center bg-slate-800/80 hover:bg-slate-800/80 p-3 rounded-xl border border-white/15 transition group">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-white/90 truncate">{doc.nombre}</p>
                        <p className="text-[8px] text-white/40 uppercase tracking-wider mt-0.5">{doc.tipo.replace('_', ' ')}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setActiveDoc({
                          url: doc.url,
                          title: doc.nombre
                        })}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase bg-pink-600/10 text-pink-400 hover:bg-pink-600/25 border border-pink-500/15 hover:border-pink-500/30 transition cursor-pointer select-none shrink-0"
                      >
                        <span>Ver</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checklist de Documentación Requerida */}
            <div className={`rounded-2xl p-5 border flex flex-col justify-between ${
              loading
                ? 'bg-slate-800/80 border-white/15'
                : expedienteCompleto
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-amber-500/5 border-amber-500/20'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-pink-500">Documentación Requerida</h4>
                  {!loading && (
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      expedienteCompleto ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {DOCS_REQUERIDOS.length - docsFaltantes.length} / {DOCS_REQUERIDOS.length} documentos
                    </span>
                  )}
                </div>

                {loading ? (
                  <p className="text-xs text-white/30 italic">Verificando documentos...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                    {DOCS_REQUERIDOS.map(req => {
                      const subido = tiposSubidos.has(req.tipo);
                      return (
                        <div
                          key={req.tipo}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition ${
                            subido
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}
                        >
                          {subido
                            ? <CheckCircle2 size={14} className="shrink-0" />
                            : <AlertCircle size={14} className="shrink-0 animate-pulse" />}
                          <span className="text-[11px] font-bold truncate">{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {!loading && expedienteCompleto && (
                <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <p className="text-[10px] text-emerald-300 font-black">¡Expediente completo!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800/80 hover:bg-slate-800/90 text-white/70 rounded-xl font-bold transition text-xs cursor-pointer border border-white/15 hover:border-white/15"
          >
            Cerrar Vista
          </button>
        </div>
      </div>

      <DocumentViewerModal
        isOpen={!!activeDoc}
        onClose={() => setActiveDoc(null)}
        url={activeDoc?.url}
        title={activeDoc?.title}
      />
    </>
  );
}

export default AlumnoDetail;
