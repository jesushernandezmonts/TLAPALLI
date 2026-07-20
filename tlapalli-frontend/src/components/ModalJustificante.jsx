import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';
import { Calendar, FileText, Upload, AlertCircle, CheckCircle2, Loader2, Paperclip, X } from 'lucide-react';

function ModalJustificante({ isOpen, onClose, onSuccess, talleres = [] }) {
  const [fechaFalta, setFechaFalta] = useState('');
  const [tallerId, setTallerId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Establecer fecha por defecto a hoy (YYYY-MM-DD)
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaFalta(hoy);
      setTallerId('');
      setMotivo('');
      setArchivo(null);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe exceder los 10MB');
        return;
      }
      setArchivo(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fechaFalta) {
      setError('Por favor selecciona la fecha de la falta');
      return;
    }
    if (!motivo.trim()) {
      setError('Por favor escribe el motivo de la falta');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fechaFalta', fechaFalta);
      formData.append('motivo', motivo.trim());
      if (tallerId) {
        formData.append('tallerId', tallerId);
      }
      if (archivo) {
        formData.append('comprobante', archivo);
      }

      await api.post('/instructores/me/justificaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Justificante enviado exitosamente al administrador');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error al enviar justificante', err);
      setError(err.response?.data?.message || 'Error al enviar el justificante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar Justificante de Falta"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-semibold">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fecha de la falta */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1">
              <Calendar size={12} /> Fecha de Falta <span className="text-pink-500">*</span>
            </label>
            <input
              type="date"
              value={fechaFalta}
              onChange={(e) => setFechaFalta(e.target.value)}
              required
              className="bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2 text-sm text-white w-full outline-none focus:border-pink-500/50 transition"
            />
          </div>

          {/* Taller opcional */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1">
              Taller Afectado (Opcional)
            </label>
            <select
              value={tallerId}
              onChange={(e) => setTallerId(e.target.value)}
              className="bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2 text-sm text-white w-full outline-none focus:border-pink-500/50 transition cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">Todos los talleres / General</option>
              {talleres.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.nombreTaller}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Motivo de la falta */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1">
            <FileText size={12} /> Motivo o Causa de la Falta <span className="text-pink-500">*</span>
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            rows="3"
            placeholder="Describe la causa (ej. Cita médica en ISSSTE, trámite oficial, urgencia familiar...)"
            className="bg-slate-800/80 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-white/25 w-full outline-none focus:border-pink-500/50 transition resize-none"
          />
        </div>

        {/* Carga de Comprobante / Evidencia */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1">
            <Paperclip size={12} /> Evidencia o Comprobante Probatorio (PDF / Imagen)
          </label>
          <div className="bg-slate-800/80 border border-white/15 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-white/25 transition">
            <div className="min-w-0 flex-1">
              {archivo ? (
                <span className="text-xs text-pink-400 font-bold truncate block" title={archivo.name}>
                  ✓ Adjunto: {archivo.name}
                </span>
              ) : (
                <span className="text-xs text-white/40 italic block">
                  Adjunta incapacidad, receta o constancia médica (Máx 10MB)
                </span>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {archivo ? (
                <button
                  type="button"
                  onClick={() => setArchivo(null)}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 hover:bg-rose-500/35 transition"
                >
                  Quitar
                </button>
              ) : (
                <>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="comprobante-justificante-input"
                    accept=".pdf,image/*"
                  />
                  <label
                    htmlFor="comprobante-justificante-input"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-pink-600/20 border border-pink-500/30 text-pink-300 hover:bg-pink-600/30 transition cursor-pointer select-none"
                  >
                    <Upload size={14} /> Adjuntar
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-2 pt-3 border-t border-white/15">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-800/90 text-white/70 rounded-xl font-bold transition text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !fechaFalta || !motivo.trim()}
            className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-xl font-black tracking-wider transition shadow-lg shadow-pink-600/20 text-xs flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Enviando...</>
            ) : (
              'Enviar Justificante'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalJustificante;
