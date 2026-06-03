import { useState, useEffect } from 'react';
import { Mail, Send, ChevronDown, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

function InstructorForm({ instructor, talleres, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tallerId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    if (instructor) {
      setForm({
        nombre: instructor.nombre || '',
        email: instructor.email || '',
        telefono: instructor.telefono || '',
        tallerId: instructor.tallerId || '',
      });
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

      if (instructor) {
        await api.patch(`/instructores/${instructor.id}`, payload);
        setSuccess('Instructor actualizado correctamente');
      } else {
        await api.post('/instructores', payload);
        setSuccess('Instructor creado y correo de activación enviado');
      }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Nombre Completo</label>
          <input
            name="nombre"
            placeholder="Ej. Juan García"
            value={form.nombre}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Correo Electrónico</label>
          <input
            name="email"
            type="email"
            placeholder="profesor@gmail.com"
            value={form.email}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
            required
            disabled={!!instructor}
          />
          {!!instructor && (
            <p className="text-[10px] text-white/30 italic ml-1">El correo no se puede cambiar</p>
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
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
          />
        </div>

        <div className="space-y-1 relative" data-filter-dropdown>
          <label className="text-sm text-white/60 ml-1">Taller Asignado</label>
          <button
            type="button"
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-left text-sm text-white shadow-inner shadow-black/20 outline-none transition hover:border-white/30 hover:bg-black/35 focus:border-pink-500/50"
          >
            <span className="truncate">
              {form.tallerId 
                ? talleres.find(t => String(t.id) === String(form.tallerId))?.nombreTaller || 'Sin taller asignado'
                : 'Sin taller asignado'}
            </span>
            <ChevronDown size={14} className={`shrink-0 text-white/40 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown && (
            <div className="absolute left-0 top-full z-999 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-pink-500/25 bg-slate-950 p-1.5 shadow-2xl shadow-black/60">
              <button
                type="button"
                onClick={() => handleSelectTaller('')}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                  !form.tallerId ? 'bg-pink-500/15 text-pink-400' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                Sin taller asignado
              </button>
              {talleres.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTaller(String(t.id))}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                    String(form.tallerId) === String(t.id) ? 'bg-pink-500/15 text-pink-400' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.nombreTaller}
                </button>
              ))}
            </div>
          )}
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
  );
}

export default InstructorForm;
