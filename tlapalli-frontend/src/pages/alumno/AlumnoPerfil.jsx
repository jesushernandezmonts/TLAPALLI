import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, User, FileText, UploadCloud, CheckCircle2, AlertCircle, Clock3, ExternalLink } from 'lucide-react';
import FileInput from '../../components/FileInput';

function AlumnoPerfil() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [documentos, setDocumentos] = useState(null);
  const [uploading, setUploading] = useState({ curp: false, domicilio: false, fotoInfantil: false });
  const [files, setFiles] = useState({ curp: null, domicilio: null, fotoInfantil: null });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const [perfilRes, documentosRes] = await Promise.all([
          api.get('/alumnos/me/perfil'),
          api.get('/alumno-documentos/me'),
        ]);
        setPerfil(perfilRes.data);
        setDocumentos(documentosRes.data);
      } catch (err) {
        console.error('Error loading perfil', err);
        setError('No se pudo cargar tu información');
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  const baseUrl = api.defaults.baseURL || 'http://localhost:3000';
  const fullName = useMemo(() => `${perfil?.nombre || ''} ${perfil?.apellidoPaterno || ''} ${perfil?.apellidoMaterno || ''}`.trim(), [perfil]);

  const upload = async (key, endpoint) => {
    const file = files[key];
    if (!file) {
      setError('Selecciona un PDF primero');
      return;
    }
    setError('');
    setStatus('');
    setUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/alumno-documentos/me/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('Documento subido correctamente');
      const { data } = await api.get('/alumno-documentos/me');
      setDocumentos(data);
      setFiles((prev) => ({ ...prev, [key]: null }));
    } catch (err) {
      console.error('Error uploading document', err);
      setError(err.response?.data?.message || 'Error al subir el documento');
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-violet-500" /></div>;
  }

  const DocumentoCard = ({ title, keyName, endpoint, doc }) => (
    <div className="rounded-2xl border border-white/15 bg-slate-900/80 p-5 space-y-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="text-xs text-white/45 mt-1">Solo PDF, hasta 5 MB</p>
        </div>
        <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${doc ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
          {doc ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {doc ? 'Cargado' : 'Pendiente'}
        </div>
      </div>

      <FileInput
        label={`Subir ${title}`}
        onFileSelect={(file) => setFiles((prev) => ({ ...prev, [keyName]: file }))}
        disabled={uploading[keyName]}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => upload(keyName, endpoint)}
          disabled={uploading[keyName]}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {uploading[keyName] ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          {uploading[keyName] ? 'Subiendo...' : 'Subir PDF'}
        </button>

        {doc?.url && (
          <a
            href={doc.url.startsWith('http') ? doc.url : `${baseUrl}${doc.url}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/80 hover:text-white"
          >
            <ExternalLink size={16} /> Abrir
          </a>
        )}
      </div>

      {doc && (
        <p className="text-xs text-white/50">
          Última carga: {new Date(doc.subidoEn).toLocaleString('es-MX')}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">Mi Perfil</h1>
        <p className="mt-1 text-base font-semibold text-white/75">Tus datos personales y documentos obligatorios</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm inline-flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {status && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm inline-flex items-center gap-2">
          <CheckCircle2 size={16} /> {status}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 mx-auto mb-4 flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-white">{fullName}</h2>
          {perfil?.email && <p className="text-violet-400 text-sm mt-2">{perfil.email}</p>}
        </div>

        <div className="lg:col-span-2 bg-slate-900/95 border border-white/20 rounded-2xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white/90 mb-6">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Nombre Completo</p>
                <p className="text-white/80 font-medium">{fullName}</p>
              </div>
              {perfil?.curp && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">CURP</p>
                  <p className="text-white/80 font-mono text-sm">{perfil.curp}</p>
                </div>
              )}
              {perfil?.fechaNacimiento && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Fecha de Nacimiento</p>
                  <p className="text-white/80">{new Date(perfil.fechaNacimiento).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {perfil?.telefono && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Teléfono</p>
                  <p className="text-white/80">{perfil.telefono}</p>
                </div>
              )}
              {perfil?.email && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Correo Electrónico</p>
                  <p className="text-white/80">{perfil.email}</p>
                </div>
              )}
              {perfil?.padecimientos && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">Padecimientos</p>
                  <p className="text-white/80 text-sm">{perfil.padecimientos}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 to-slate-800/60 p-6 md:p-8 shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3"><FileText className="text-violet-400" /> Documentos requeridos</h2>
          <p className="text-sm text-white/45 mt-1">Sube tus archivos en PDF. Si vuelves a subir uno del mismo tipo, reemplazará el anterior.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <DocumentoCard title="CURP" keyName="curp" endpoint="curp" doc={documentos?.curp} />
          <DocumentoCard title="Comprobante de domicilio" keyName="domicilio" endpoint="domicilio" doc={documentos?.domicilio} />
          <DocumentoCard title="Foto tamaño infantil" keyName="fotoInfantil" endpoint="foto-infantil" doc={documentos?.fotoInfantil} />
        </div>

        {documentos?.completos && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm inline-flex items-center gap-2">
            <CheckCircle2 size={16} /> Documentación completa
          </div>
        )}
      </div>
    </div>
  );
}

export default AlumnoPerfil;
