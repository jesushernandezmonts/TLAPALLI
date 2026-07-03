import { useState, useEffect } from 'react';
import { Mail, Send, ChevronDown, Loader2, CheckCircle, AlertTriangle, Lock, Unlock, Check, Upload, FileText, Trash2, ExternalLink, X } from 'lucide-react';
import api from '../services/api';
import DocumentViewerModal from './DocumentViewerModal';

function InstructorForm({ instructor, talleres, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tallerId: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [temarioFile, setTemarioFile] = useState(null);
  const [curriculumUrl, setCurriculumUrl] = useState('');
  const [temarioUrl, setTemarioUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isEmailUnlocked, setIsEmailUnlocked] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);

  useEffect(() => {
    if (instructor) {
      setForm({
        nombre: instructor.nombre || '',
        email: instructor.email || '',
        telefono: instructor.telefono || '',
        tallerId: instructor.tallerId || '',
      });
      setCurriculumUrl(instructor.curriculumUrl || '');
      setTemarioUrl(instructor.temarioUrl || '');
    }
  }, [instructor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    setSuccess('');
  };

  const handleSelectTaller = (value) => {
    setForm({ ...form, tallerId: value });
    setOpenDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const missing = [];
    if (!form.nombre.trim()) missing.push('Nombre');
    if (!form.email.trim()) missing.push('Correo electrónico');

    if (missing.length > 0) {
      setError(`Completa los campos: ${missing.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        tallerId: form.tallerId ? parseInt(form.tallerId) : null
      };

      let instructorId = null;

      if (instructor) {
        instructorId = instructor.id;
        await api.patch(`/instructores/${instructorId}`, payload);
      } else {
        const response = await api.post('/instructores', payload);
        instructorId = response.data.id;
      }

      // Subir archivos si fueron seleccionados
      if (cvFile && instructorId) {
        const formData = new FormData();
        formData.append('cv', cvFile);
        await api.post(`/instructores/${instructorId}/upload-cv`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (temarioFile && instructorId) {
        const formData = new FormData();
        formData.append('temario', temarioFile);
        await api.post(`/instructores/${instructorId}/upload-temario`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(instructor ? 'Instructor actualizado correctamente' : 'Instructor creado y correo de activación enviado');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar instructor');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCv = async () => {
    if (window.confirm('¿Seguro que deseas eliminar el currículum de este instructor?')) {
      try {
        await api.delete(`/instructores/${instructor.id}/cv`);
        setCurriculumUrl('');
        setSuccess('Currículum eliminado correctamente');
        setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
        setError('Error al eliminar currículum');
      }
    }
  };

  const handleDeleteTemario = async () => {
    if (window.confirm('¿Seguro que deseas eliminar el temario de este instructor?')) {
      try {
        await api.delete(`/instructores/${instructor.id}/temario`);
        setTemarioUrl('');
        setSuccess('Temario eliminado correctamente');
        setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
        setError('Error al eliminar temario');
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Nombre Completo</label>
          <input
            name="nombre"
            placeholder="Ej. Juan García"
            value={form.nombre}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 text-sm h-11"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Correo Electrónico</label>
          <div className="flex gap-2">
            <input
              name="email"
              type="email"
              placeholder="profesor@gmail.com"
              value={form.email}
              onChange={handleChange}
              className="bg-white/10 border border-white/20 rounded-xl px-3 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 disabled:opacity-50 text-sm h-11"
              required
              disabled={!!instructor && !isEmailUnlocked}
            />
            {!!instructor && (
              <button
                type="button"
                onClick={() => setIsEmailUnlocked(!isEmailUnlocked)}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 shrink-0 ${
                  isEmailUnlocked 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'
                }`}
                title={isEmailUnlocked ? "Bloquear edición de correo" : "Desbloquear edición de correo"}
              >
                {isEmailUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
              </button>
            )}
          </div>
          {!!instructor && (
            <p className="text-[10px] ml-1">
              {isEmailUnlocked ? (
                <span className="text-amber-400/80 font-bold">
                  ⚠️ Cuidado: Cambiar el correo cambiará su usuario de inicio de sesión.
                </span>
              ) : (
                <span className="text-white/30 italic">
                  El correo está bloqueado. Haz clic en el candado para cambiarlo.
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Teléfono <span className="text-white/30">(opcional)</span></label>
          <input
            name="telefono"
            placeholder="Ej. 5512345678"
            value={form.telefono}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 text-sm h-11"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-white/60 ml-1">Taller Asignado</label>
        <div className="bg-black/35 border border-white/15 rounded-2xl p-3 shadow-inner shadow-black/40">
          <div className="max-h-32 overflow-y-auto p-0.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
            {/* Opción Sin Taller */}
            <div
              onClick={() => setForm({ ...form, tallerId: '' })}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition border ${
                !form.tallerId 
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' 
                  : 'text-white/70 hover:bg-white/5 border-transparent'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                !form.tallerId ? 'bg-pink-500 border-pink-500' : 'border-white/30'
              }`}>
                {!form.tallerId && <Check size={11} className="text-white" />}
              </div>
              <span className="text-xs font-bold">Sin taller asignado</span>
            </div>

            {/* Lista de Talleres */}
            {talleres.map((taller) => {
              const isSelected = String(form.tallerId) === String(taller.id);
              return (
                <div
                  key={taller.id}
                  onClick={() => setForm({ ...form, tallerId: String(taller.id) })}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition border ${
                    isSelected 
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' 
                      : 'text-white/70 hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                    isSelected ? 'bg-pink-500 border-pink-500' : 'border-white/30'
                  }`}>
                    {isSelected && <Check size={11} className="text-white" />}
                  </div>
                  <span className="text-xs font-bold">{taller.nombreTaller}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sección de Documentación */}
      <div className="border-t border-white/10 pt-4">
        <h4 className="text-sm font-bold text-white mb-3 tracking-wide flex items-center gap-2">
          <FileText size={16} className="text-pink-400" />
          Documentación del Instructor
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Currículum Vitae (CV) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-all" />
            <label className="text-xs font-black uppercase tracking-widest text-white/50">Currículum Vitae (CV)</label>
            
            {curriculumUrl ? (
              <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText size={20} className="text-pink-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white/90 truncate">Currículum cargado</p>
                    <button
                      type="button"
                      onClick={() => setActiveDoc({
                        url: curriculumUrl,
                        title: `CV - ${form.nombre}`
                      })}
                      className="text-[10px] font-semibold text-pink-400 hover:text-pink-300 transition flex items-center gap-1 mt-0.5 cursor-pointer text-left"
                    >
                      Ver archivo <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteCv}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 hover:border-rose-500/30 transition"
                  title="Eliminar CV de la cuenta"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : cvFile ? (
              <div className="flex items-center justify-between bg-pink-500/5 border border-pink-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText size={20} className="text-pink-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{cvFile.name}</p>
                    <p className="text-[10px] text-white/40">{(cvFile.size / 1024 / 1024).toFixed(2)} MB - Listo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCvFile(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-white/15 hover:border-pink-500/40 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/10 hover:bg-pink-500/5 transition duration-300">
                <Upload size={20} className="text-white/40 group-hover:text-pink-400 transition" />
                <span className="text-[11px] font-bold text-white/70">Seleccionar PDF del CV</span>
                <span className="text-[9px] text-white/40">Máximo 5MB (PDF)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setCvFile(file);
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Temario (Syllabus) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-all" />
            <label className="text-xs font-black uppercase tracking-widest text-white/50">Temario (Syllabus)</label>
            
            {temarioUrl ? (
              <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText size={20} className="text-pink-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white/90 truncate">Temario cargado</p>
                    <button
                      type="button"
                      onClick={() => setActiveDoc({
                        url: temarioUrl,
                        title: `Temario - ${form.nombre}`
                      })}
                      className="text-[10px] font-semibold text-pink-400 hover:text-pink-300 transition flex items-center gap-1 mt-0.5 cursor-pointer text-left"
                    >
                      Ver archivo <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteTemario}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 hover:border-rose-500/30 transition"
                  title="Eliminar temario de la cuenta"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : temarioFile ? (
              <div className="flex items-center justify-between bg-pink-500/5 border border-pink-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText size={20} className="text-pink-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{temarioFile.name}</p>
                    <p className="text-[10px] text-white/40">{(temarioFile.size / 1024 / 1024).toFixed(2)} MB - Listo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTemarioFile(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-white/15 hover:border-pink-500/40 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/10 hover:bg-pink-500/5 transition duration-300">
                <Upload size={20} className="text-white/40 group-hover:text-pink-400 transition" />
                <span className="text-[11px] font-bold text-white/70">Seleccionar PDF del temario</span>
                <span className="text-[9px] text-white/40">Máximo 5MB (PDF)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setTemarioFile(file);
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

        </div>
      </div>

      {/* Info: cómo funciona la activación */}
      {!instructor && (
        <div className="bg-linear-to-r from-blue-500/5 to-purple-500/5 p-4 rounded-2xl border border-blue-500/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Send size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Activación Automática</p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Al guardar, el sistema enviará un <strong className="text-white/70">correo de activación</strong> al profesor. 
                Él creará su propia contraseña desde el enlace recibido. No necesitas asignar ninguna clave.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-rose-950/60 border border-rose-500/30 p-3">
          <AlertTriangle size={18} className="text-rose-400 shrink-0" />
          <p className="text-xs font-bold text-rose-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 p-3">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <p className="text-xs font-bold text-emerald-300">{success}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl font-bold text-white transition shadow-lg shadow-pink-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Guardando...
            </span>
          ) : (
            <>
              {!instructor && <Mail size={16} />}
              {instructor ? 'Guardar Cambios' : 'Guardar y Enviar Activación'}
            </>
          )}
        </button>
      </div>
      </form>

      <DocumentViewerModal
        isOpen={!!activeDoc}
        onClose={() => setActiveDoc(null)}
        url={activeDoc?.url}
        title={activeDoc?.title}
      />
    </>
  );
}

export default InstructorForm;
