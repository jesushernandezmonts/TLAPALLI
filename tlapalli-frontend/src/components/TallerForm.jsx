import { useState, useEffect } from 'react';
import api from '../services/api';

function TallerForm({ taller, onClose, onSave }) {
  const [form, setForm] = useState({
    nombreTaller: '',
    descripcion: '',
    costoMensual: '',
    cupoMaximo: '',
    horarioDescripcion: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (taller) {
      setForm({
        nombreTaller: taller.nombreTaller || '',
        descripcion: taller.descripcion || '',
        costoMensual: String(taller.costoMensual || ''),
        cupoMaximo: String(taller.cupoMaximo || ''),
        horarioDescripcion: taller.horarioDescripcion || '',
      });
    }
  }, [taller]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        costoMensual: parseFloat(form.costoMensual),
        cupoMaximo: parseInt(form.cupoMaximo),
      };
      if (taller) {
        await api.patch(`/talleres/${taller.id}`, payload);
      } else {
        await api.post('/talleres', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar taller');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="nombreTaller" placeholder="Nombre del taller" value={form.nombreTaller}
        onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full placeholder-white/50" required />
      <textarea name="descripcion" placeholder="Descripción" value={form.descripcion}
        onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full placeholder-white/50" rows="2" />
      <div className="grid grid-cols-2 gap-4">
        <input name="costoMensual" type="number" step="0.01" placeholder="Costo mensual" value={form.costoMensual}
          onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 placeholder-white/50" required />
        <input name="cupoMaximo" type="number" placeholder="Cupo máximo" value={form.cupoMaximo}
          onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 placeholder-white/50" required />
      </div>
      <input name="horarioDescripcion" placeholder="Horario (ej: Lunes y Miércoles 16:00-18:00)" value={form.horarioDescripcion}
        onChange={handleChange} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-full placeholder-white/50" />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl font-bold">Guardar</button>
      </div>
    </form>
  );
}

export default TallerForm;
