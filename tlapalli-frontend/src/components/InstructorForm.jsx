import { useState, useEffect } from 'react';
import { Mail, Send, ChevronDown, Loader2, CheckCircle, AlertTriangle, Lock, Unlock, Check } from 'lucide-react';
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
  const [isEmailUnlocked, setIsEmailUnlocked] = useState(false);

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

        <div className="space-y-1 relative" data-filter-dropdown>
          <label className="text-sm text-white/60 ml-1">Taller Asignado</label>
          <button
            type="button"
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-black/25 px-3 text-left text-sm text-white shadow-inner shadow-black/20 outline-none transition hover:border-white/30 hover:bg-black/35 focus:border-pink-500/50"
          >
            <span className="truncate">
              {form.tallerId 
                ? talleres.find(t => String(t.id) === String(form.tallerId))?.nombreTaller || 'Sin taller asignado'
                : 'Sin taller asignado'}
            </span>
            <ChevronDown size={14} className={`shrink-0 text-white/40 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown && (
            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-md">
              <div className="max-h-48 overflow-y-auto p-1.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                {/* Opción Sin Taller */}
                <div
                  onClick={() => handleSelectTaller('')}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                    !form.tallerId ? 'bg-pink-500/20 text-pink-300' : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition shrink-0 ${
                    !form.tallerId ? 'bg-pink-500 border-pink-500' : 'border-white/30'
                  }`}>
                    {!form.tallerId && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-[11px] font-semibold">Sin taller asignado</span>
                </div>

                {/* Lista de Talleres */}
                {talleres.map((taller) => {
                  const isSelected = String(form.tallerId) === String(taller.id);
                  return (
                    <div
                      key={taller.id}
                      onClick={() => handleSelectTaller(String(taller.id))}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                        isSelected ? 'bg-pink-500/20 text-pink-300' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition shrink-0 ${
                        isSelected ? 'bg-pink-500 border-pink-500' : 'border-white/30'
                      }`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-[11px] font-semibold">{taller.nombreTaller}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end border-t border-white/10 bg-slate-950/95 px-2.5 py-1.5">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(false)}
                  className="rounded-full bg-pink-600 px-5 py-1.5 text-[11px] font-black text-white transition hover:bg-pink-700 shadow-lg shadow-pink-600/20"
                >
                  Listo
                </button>
              </div>
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
