import { useState, useEffect } from 'react';
import api from '../services/api';

function AlumnoForm({ alumno, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    curp: '',
    fechaNacimiento: '',
    telefono: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (alumno) {
      setForm({
        nombre: alumno.nombre || '',
        apellidoPaterno: alumno.apellidoPaterno || '',
        apellidoMaterno: alumno.apellidoMaterno || '',
        curp: alumno.curp || '',
        fechaNacimiento: alumno.fechaNacimiento ? alumno.fechaNacimiento.slice(0, 10) : '',
        telefono: alumno.telefono || '',
      });
    }
  }, [alumno]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (alumno) {
        const { data } = await api.patch(`/alumnos/${alumno.id}`, form);
        onSave(data);
      } else {
        const { data } = await api.post('/alumnos', form);
        onSave(data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar alumno');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 placeholder-white/50 w-full"
          required
        />
        <input
          name="apellidoPaterno"
          placeholder="Apellido Paterno"
          value={form.apellidoPaterno}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 placeholder-white/50 w-full"
          required
        />
        <input
          name="apellidoMaterno"
          placeholder="Apellido Materno"
          value={form.apellidoMaterno}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 placeholder-white/50 w-full"
        />
        <input
          name="curp"
          placeholder="CURP"
          value={form.curp}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 placeholder-white/50 w-full"
          maxLength={18}
          required
        />
        <input
          name="fechaNacimiento"
          type="date"
          value={form.fechaNacimiento}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white/70 w-full"
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 placeholder-white/50 w-full"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
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

export default AlumnoForm;
