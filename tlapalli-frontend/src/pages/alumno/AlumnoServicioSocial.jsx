import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import {
  Loader2,
  HeartHandshake,
  Clock,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Plus,
  X,
  Upload,
} from 'lucide-react';

function AlumnoServicioSocial() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ssList, setSsList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    horas: '',
    descripcion: '',
    comentarios: '',
  });

  const fetchSS = async () => {
    try {
      const { data } = await api.get('/alumnos/me/servicio-social');
      setSsList(data);
    } catch (err) {
      console.error('Error loading servicio social', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSS(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.horas || parseInt(formData.horas) < 1) {
      setError('Las horas deben ser al menos 1');
      return;
    }
    if (!formData.descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/servicio-social/alumno/actividades', {
        servicioSocialId: ss.id,
        horas: parseInt(formData.horas),
        descripcion: formData.descripcion,
        comentarios: formData.comentarios,
      });
      setSuccess('Horas registradas exitosamente. Quedan pendientes de aprobación por el admin.');
      setFormData({ horas: '', descripcion: '', comentarios: '' });
      setShowForm(false);
      fetchSS();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar horas');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-pink-500" /></div>;
  }

  const ss = ssList[0];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white/90">Servicio Social</h1>
        {ss && ss.estatus === 'en_curso' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl transition shadow-lg shadow-amber-600/20"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancelar' : 'Registrar Horas'}
          </button>
        )}
      </div>

      {/* Notificaciones */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm font-bold text-red-300">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-bold text-emerald-300">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!ss ? (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-12 text-center">
          <HeartHandshake size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 font-medium">No tienes un registro de servicio social activo.</p>
          <p className="text-white/30 text-sm mt-2">Contacta al administrador para iniciar tu servicio social.</p>
        </div>
      ) : (
        <>
          {/* Progreso */}
          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Target size={20} className="text-amber-400" />
                  Progreso
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  {ss.institucion && `${ss.institucion}`}
                  {ss.programa && ` — ${ss.programa}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                ss.estatus === 'completado'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : ss.estatus === 'en_curso'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : ss.estatus === 'suspendido'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {ss.estatus === 'completado' ? '✅ Completado' : ss.estatus === 'en_curso' ? 'En curso' : ss.estatus === 'suspendido' ? 'Suspendido' : 'Baja'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70 font-medium">{ss.horasCompletadas} hrs completadas</span>
                <span className="text-white/50">{ss.horasRequeridas} hrs requeridas</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    ss.estatus === 'completado'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((ss.horasCompletadas / ss.horasRequeridas) * 100))}%` }}
                />
              </div>
              <p className="text-right text-xs text-white/40 mt-1">
                {Math.round((ss.horasCompletadas / ss.horasRequeridas) * 100)}% completado
              </p>
            </div>

            {ss.supervisor && <p className="text-sm text-white/60"><span className="text-white/40">Supervisor:</span> {ss.supervisor}</p>}
            {ss.fechaInicio && <p className="text-sm text-white/60 mt-1"><span className="text-white/40">Inicio:</span> {new Date(ss.fechaInicio).toLocaleDateString()}</p>}
            {ss.fechaFin && <p className="text-sm text-white/60 mt-1"><span className="text-white/40">Fin:</span> {new Date(ss.fechaFin).toLocaleDateString()}</p>}
          </div>

          {/* Formulario para registrar horas */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-black/40 backdrop-blur-2xl border border-amber-500/20 rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                    <Clock size={20} className="text-amber-400" />
                    Registrar Horas
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1 block mb-2">
                        Horas *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.horas}
                        onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                        placeholder="Ej. 4"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1 block mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={new Date().toISOString().split('T')[0]}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 focus:outline-none transition-all cursor-not-allowed"
                      />
                      <p className="text-[10px] text-white/30 mt-1 ml-1">Se usa la fecha actual</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1 block mb-2">
                      Descripción *
                    </label>
                    <input
                      type="text"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Ej. Apoyo en la biblioteca, organización de archivos..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1 block mb-2">
                      Comentarios adicionales
                    </label>
                    <textarea
                      value={formData.comentarios}
                      onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                      placeholder="Detalles sobre las actividades realizadas..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition border border-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2"
                    >
                      {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><Upload size={16} /> Enviar para aprobación</>}
                    </button>
                  </div>

                  <p className="text-[10px] text-white/30 text-right">
                    ⏳ Tus horas quedarán pendientes hasta que el administrador las apruebe.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historial de actividades */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-lg md:text-xl font-bold text-white/90 flex items-center gap-2 mb-6">
              <BookOpen size={20} className="text-amber-400" />
              Actividades Registradas
            </h2>
            {ss.actividades.length === 0 ? (
              <p className="text-white/40 italic">Aún no se han registrado actividades.</p>
            ) : (
              <div className="space-y-4">
                {ss.actividades.map((act) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white/90 text-sm">{act.descripcion}</h4>
                          {/* Badge de estatus */}
                          {act.estatus === 'pendiente' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                              Pendiente
                            </span>
                          )}
                          {act.estatus === 'aprobada' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                              Aprobada
                            </span>
                          )}
                          {act.estatus === 'rechazada' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase tracking-wider">
                              Rechazada
                            </span>
                          )}
                        </div>
                        {act.comentarios && (
                          <p className="text-xs text-white/50 mt-1">{act.comentarios}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`font-black text-lg ${
                          act.estatus === 'aprobada' ? 'text-emerald-400' : act.estatus === 'rechazada' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {act.horas} hrs
                        </span>
                        <div className="flex items-center gap-1 text-xs text-white/40 mt-1 justify-end">
                          <Calendar size={10} />
                          {new Date(act.fecha).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total horas aprobadas</span>
                    <span className="text-emerald-400 font-bold">{ss.horasCompletadas} hrs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AlumnoServicioSocial;
