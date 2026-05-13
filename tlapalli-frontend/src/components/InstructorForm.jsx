import { useState, useEffect } from 'react';
import api from '../services/api';

function InstructorForm({ instructor, talleres, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tallerId: '',
    activo: true,
    password: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (instructor) {
      setForm({
        nombre: instructor.nombre || '',
        email: instructor.email || '',
        telefono: instructor.telefono || '',
        tallerId: instructor.tallerId || '',
        activo: instructor.activo ?? true,
        password: '' // No editamos el password desde aquí por ahora
      });
    }
  }, [instructor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        tallerId: form.tallerId ? parseInt(form.tallerId) : null
      };
      
      // Si estamos editando, no enviamos el password vacío
      if (instructor && !payload.password) {
        delete payload.password;
      }

      if (instructor) {
        await api.patch(`/instructores/${instructor.id}`, payload);
      } else {
        await api.post('/instructores', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar instructor');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Nombre Completo</label>
          <input
            name="nombre"
            placeholder="Ej. Juan Pérez"
            value={form.nombre}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Email (Gmail o Institucional)</label>
          <input
            name="email"
            type="email"
            placeholder="profesor@ejemplo.com"
            value={form.email}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
            required
          />
        </div>
      </div>

      {!instructor && (
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
          <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">Opción B: Registro Manual</p>
          <div className="space-y-1">
            <label className="text-sm text-white/60 ml-1">Contraseña Temporal</label>
            <input
              name="password"
              type="password"
              placeholder="Ej. Profe2026!"
              value={form.password}
              onChange={handleChange}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
            />
            <p className="text-[10px] text-white/40 italic">El profesor podrá usar esta clave para entrar si no usa Google.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Teléfono</label>
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

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          name="activo"
          id="activo"
          checked={form.activo}
          onChange={handleChange}
          className="w-4 h-4 accent-pink-600"
        />
        <label htmlFor="activo" className="text-sm text-white/80 cursor-pointer">Instructor activo</label>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

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
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl font-bold text-white transition shadow-lg shadow-pink-600/20"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

export default InstructorForm;
