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
    activo: true,
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taller) {
      setForm({
        nombreTaller: taller.nombreTaller || '',
        descripcion: taller.descripcion || '',
        costoMensual: String(taller.costoMensual || ''),
        cupoMaximo: String(taller.cupoMaximo || ''),
        horarioDescripcion: taller.horarioDescripcion || '',
        activo: taller.activo !== false,
      });
    }
  }, [taller]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Limpiar error del campo al escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!form.nombreTaller.trim()) {
      errors.nombreTaller = 'El nombre del taller es obligatorio';
    }

    if (!form.costoMensual || parseFloat(form.costoMensual) < 0) {
      errors.costoMensual = 'El costo debe ser mayor o igual a 0';
    }

    if (!form.cupoMaximo || parseInt(form.cupoMaximo) < 1) {
      errors.cupoMaximo = 'El cupo debe ser al menos 1';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

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

  const getInputClass = (fieldName) => {
    const base = "bg-white/5 border rounded-xl pl-11 pr-4 w-full text-white placeholder-white/25 focus:outline-none focus:ring-2 text-sm h-12 transition-all duration-200";
    if (fieldErrors[fieldName]) {
      return `${base} border-rose-500/50 focus:border-rose-500/60 focus:ring-rose-500/20 hover:border-rose-500/60`;
    }
    return `${base} border-white/15 focus:border-pink-500/60 focus:ring-pink-500/15 hover:border-white/30`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
      {/* Nombre del Taller */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
          Nombre del Taller <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Music size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.nombreTaller ? 'text-rose-400/70' : 'text-pink-400/70'}`} />
          <input
            name="nombreTaller"
            placeholder="Ej. Violín, Pintura, Teatro"
            value={form.nombreTaller}
            onChange={handleChange}
            className={getInputClass('nombreTaller')}
          />
        </div>
        {fieldErrors.nombreTaller && (
          <p className="text-rose-400 text-[11px] font-medium ml-1 flex items-center gap-1.5 mt-1">
            <AlertTriangle size={12} />
            {fieldErrors.nombreTaller}
          </p>
        )}
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
            className="bg-white/5 border border-white/15 rounded-xl pl-11 pr-4 py-3 w-full text-white placeholder-white/25 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 text-sm transition-all duration-200 hover:border-white/30 resize-none"
            rows="3"
          />
        </div>
      </div>

      {/* Costo y Cupo en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
            Costo Mensual <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <DollarSign size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.costoMensual ? 'text-rose-400/70' : 'text-emerald-400/70'}`} />
            <input
              name="costoMensual"
              type="number"
              step="0.01"
              placeholder="350.00"
              value={form.costoMensual}
              onChange={handleChange}
              className={getInputClass('costoMensual')}
            />
          </div>
          {fieldErrors.costoMensual && (
            <p className="text-rose-400 text-[11px] font-medium ml-1 flex items-center gap-1.5 mt-1">
              <AlertTriangle size={12} />
              {fieldErrors.costoMensual}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
            Cupo Máximo <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Users size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${fieldErrors.cupoMaximo ? 'text-rose-400/70' : 'text-blue-400/70'}`} />
            <input
              name="cupoMaximo"
              type="number"
              placeholder="15"
              value={form.cupoMaximo}
              onChange={handleChange}
              className={getInputClass('cupoMaximo')}
            />
          </div>
          {fieldErrors.cupoMaximo && (
            <p className="text-rose-400 text-[11px] font-medium ml-1 flex items-center gap-1.5 mt-1">
              <AlertTriangle size={12} />
              {fieldErrors.cupoMaximo}
            </p>
          )}
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
            className={getInputClass('horarioDescripcion')}
          />
        </div>
      </div>

      {/* Activo (solo al editar) */}
      {taller && (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5">
          <input
            type="checkbox"
            name="activo"
            id="activo"
            checked={form.activo}
            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            className="w-4 h-4 rounded text-pink-600 bg-black/20 border-white/15 focus:ring-pink-500 cursor-pointer"
          />
          <label htmlFor="activo" className="text-sm font-semibold text-white/90 cursor-pointer select-none">
            Taller Activo (Disponible para inscripciones)
          </label>
        </div>
      )}

      {/* Error del servidor */}
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
