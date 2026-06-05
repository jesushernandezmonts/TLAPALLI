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
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1">
        <label className="text-sm text-white/60 ml-1">Nombre del Taller</label>
        <input
          name="nombreTaller"
          placeholder="Ej. Violín, Pintura, Teatro"
          value={form.nombreTaller}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl px-3 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 text-sm h-11"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/60 ml-1">Descripción</label>
        <textarea
          name="descripcion"
          placeholder="Breve descripción de los temas o el taller..."
          value={form.descripcion}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl p-3 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 text-sm"
          rows="2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Costo Mensual ($)</label>
          <input
            name="costoMensual"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 350.00"
            value={form.costoMensual}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 text-sm h-11"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-white/60 ml-1">Cupo Máximo</label>
          <input
            name="cupoMaximo"
            type="number"
            min="1"
            placeholder="Ej. 15"
            value={form.cupoMaximo}
            onChange={handleChange}
            className="bg-white/10 border border-white/20 rounded-xl px-3 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 text-sm h-11"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/60 ml-1">Horario del Taller</label>
        <input
          name="horarioDescripcion"
          placeholder="Ej. Lunes y Miércoles 16:00-18:00"
          value={form.horarioDescripcion}
          onChange={handleChange}
          className="bg-white/10 border border-white/20 rounded-xl px-3 w-full text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 text-sm h-11"
        />
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3.5 py-2 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-bold transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 rounded-xl text-white text-sm font-black transition shadow-lg shadow-pink-600/20"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}

export default TallerForm;
