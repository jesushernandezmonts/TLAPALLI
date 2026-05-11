import { useState, useEffect } from 'react';
import api from '../services/api';

function InstructorForm({ instructor, onClose, onSave }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (instructor) {
      setForm({ nombre: instructor.nombre, email: instructor.email, password: '' });
    }
  }, [instructor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (instructor) {
        const payload = { nombre: form.nombre, email: form.email };
        if (form.password) payload.password = form.password;
        await api.patch(`/instructores/${instructor.id}`, payload);
      } else {
        await api.post('/instructores', form);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="nombre"
        placeholder="Nombre completo"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full placeholder-white/50"
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full placeholder-white/50"
        required
      />
      <input
        name="password"
        type="password"
        placeholder={instructor ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full placeholder-white/50"
        required={!instructor}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl font-bold"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

export default InstructorForm;
