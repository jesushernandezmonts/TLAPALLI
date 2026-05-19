import { useState, useEffect } from 'react';
import { Mail, Send } from 'lucide-react';
import api from '../services/api';

function InstructorForm({ instructor, talleres, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tallerId: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        tallerId: form.tallerId ? parseInt(form.tallerId) : null
      };

      if (instructor) {
        await api.patch(`/instructores/${instructor.id}`, payload);
      } else {
        await api.post('/instructores', payload);
      }
      onSave();
      onClose();
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

        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Taller Asignado</label>
          <select
            name="tallerId"
            value={form.tallerId}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white focus:outline-none focus:border-pink-500/50"
          >
            <option value="" className="text-black">Sin taller asignado</option>
            {talleres.map(t => (
              <option key={t.id} value={t.id} className="text-black">{t.nombreTaller}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info: cómo funciona la activación */}
      {!instructor && (
        <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-4 rounded-2xl border border-blue-500/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
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
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
          <p className="text-xs font-medium">{error}</p>
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
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
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
