import { useState, useEffect } from 'react';
import api from '../services/api';
import { Music, FileText, DollarSign, Users, Clock, AlertTriangle } from 'lucide-react';

function TallerForm({ taller, onClose, onSave }) {
  const [form, setForm] = useState({
    nombreTaller: '',
    descripcion: '',
    costoMensual: '',
    cupoMaximo: '',
    horarioDescripcion: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "bg-white/5 border border-white/15 rounded-xl pl-11 pr-4 w-full text-white placeholder-white/25 focus:outline-none focus:border-pink-500/60 focus:bg-white/8 focus:ring-2 focus:ring-pink-500/15 text-sm h-12 transition-all duration-200 hover:border-white/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Nombre del Taller */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
          Nombre del Taller
        </label>
        <div className="relative">
          <Music size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400/70" />
          <input
            name="nombreTaller"
            placeholder="Ej. Violín, Pintura, Teatro"
            value={form.nombreTaller}
            onChange={handleChange}
            className={inputBase}
            required
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
          Descripción
        </label>
        <div className="relative">
          <FileText size={16} className="absolute left-3.5 top-3.5 text-pink-400/70" />
          <textarea
            name="descripcion"
            placeholder="Breve descripción de los temas o el taller..."
            value={form.descripcion}
            onChange={handleChange}
            className="bg-white/5 border border-white/15 rounded-xl pl-11 pr-4 py-3 w-full text-white placeholder-white/25 focus:outline-none focus:border-pink-500/60 focus:bg-white/8 focus:ring-2 focus:ring-pink-500/15 text-sm transition-all duration-200 hover:border-white/30 resize-none"
            rows="3"
          />
        </div>
      </div>

      {/* Costo y Cupo en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
            Costo Mensual
          </label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70" />
            <input
              name="costoMensual"
              type="number"
              step="0.01"
              min="0"
              placeholder="350.00"
              value={form.costoMensual}
              onChange={handleChange}
              className={inputBase}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
            Cupo Máximo
          </label>
          <div className="relative">
            <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400/70" />
            <input
              name="cupoMaximo"
              type="number"
              min="1"
              placeholder="15"
              value={form.cupoMaximo}
              onChange={handleChange}
              className={inputBase}
              required
            />
          </div>
        </div>
      </div>

      {/* Horario */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
          Horario del Taller
        </label>
        <div className="relative">
          <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/70" />
          <input
            name="horarioDescripcion"
            placeholder="Ej. Lunes y Miércoles 16:00 - 18:00"
            value={form.horarioDescripcion}
            onChange={handleChange}
            className={inputBase}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium px-4 py-3 rounded-xl">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Separador */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white/8 hover:bg-white/15 rounded-xl text-white/80 hover:text-white text-sm font-bold transition-all duration-200 border border-white/10 hover:border-white/20"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 disabled:bg-pink-600/50 rounded-xl text-white text-sm font-black transition-all duration-200 shadow-lg shadow-pink-600/25 hover:shadow-pink-500/35 disabled:shadow-none ring-1 ring-pink-400/20 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              taller ? 'Guardar Cambios' : 'Crear Taller'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default TallerForm;
