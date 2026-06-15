import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import TallerForm from '../components/TallerForm';
import { Plus, Search, Edit3, Trash2, Calendar, AlertTriangle, CheckCircle, Eye, Users, DollarSign, TrendingUp, Palette, Music, Dumbbell, BookOpen, Laptop, Briefcase, Guitar, Piano, Drama, Mic, Heart, Sparkles } from 'lucide-react';

// Mapea el nombre del taller a un ícono y color representativo
const getTallerIcon = (nombreTaller) => {
  const name = (nombreTaller || '').toLowerCase();

  // Música
  if (name.includes('guitarra')) return { icon: Guitar, color: 'text-amber-400', bg: 'bg-amber-500/10' };
  if (name.includes('piano')) return { icon: Piano, color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
  if (name.includes('violín') || name.includes('violin')) return { icon: Music, color: 'text-purple-400', bg: 'bg-purple-500/10' };
  if (name.includes('canto')) return { icon: Mic, color: 'text-pink-400', bg: 'bg-pink-500/10' };

  // Artes plásticas
  if (name.includes('pintura') || name.includes('dibujo') || name.includes('plásticas') || name.includes('plasticas'))
    return { icon: Palette, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };

  // Danza
  if (name.includes('danza') || name.includes('ballet') || name.includes('flamenco') || name.includes('ritmos'))
    return { icon: Sparkles, color: 'text-rose-400', bg: 'bg-rose-500/10' };

  // Teatro
  if (name.includes('teatro')) return { icon: Drama, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };

  // Lectura
  if (name.includes('lectura') || name.includes('cuentacuentos'))
    return { icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };

  // Bienestar
  if (name.includes('yoga')) return { icon: Heart, color: 'text-teal-400', bg: 'bg-teal-500/10' };

  // Deporte
  if (name.includes('deporte') || name.includes('ejercicio'))
    return { icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10' };

  // Tecnología
  if (name.includes('tecnología') || name.includes('computación') || name.includes('programación'))
    return { icon: Laptop, color: 'text-blue-400', bg: 'bg-blue-500/10' };

  // Default
  return { icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/10' };
};
import ConfirmModal from '../components/ConfirmModal';
import { AnimatePresence, motion } from 'framer-motion';

function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTaller, setEditTaller] = useState(null);
  const [detailTaller, setDetailTaller] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const talleresPerPage = 8;

  const [toast, setToast] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {}, confirmText: 'Eliminar' });

  useEffect(() => {
    fetchTalleres();
  }, []);

  const fetchTalleres = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [talleresRes, pagosRes] = await Promise.all([
        api.get('/talleres'),
        api.get('/pagos')
      ]);
      // Ordenar por ID de forma ascendente para mantener un orden estable
      const sortedTalleres = (talleresRes.data || []).sort((a, b) => a.id - b.id);
      setTalleres(sortedTalleres);
      setPagos(pagosRes.data);
    } catch (err) {
      console.error('Error al cargar talleres y pagos', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const showToast = (title, message = '', type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openConfirm = (config) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };

  const handleEdit = (taller) => {
    setEditTaller(taller);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditTaller(null);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    openConfirm({
      title: '¿Eliminar Taller?',
      message: 'Esta acción es permanente y eliminará este taller de la oferta académica. Asegúrate de que no haya alumnos inscritos activos. ¿Deseas continuar?',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => {
        try {
          await api.delete(`/talleres/${id}`);
          showToast('Taller eliminado', 'El taller se eliminó correctamente.', 'delete');
          fetchTalleres(true);
        } catch (err) {
          showToast('Error al eliminar', err.response?.data?.message || 'No se puede eliminar: tiene inscripciones activas.', 'error');
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const handleSave = () => {
    setModalOpen(false);
    fetchTalleres(true);
    if (editTaller) {
      showToast('Cambios guardados', 'La información del taller se actualizó correctamente.', 'success');
    } else {
      showToast('Taller registrado', 'El taller se registró correctamente en la oferta académica.', 'success');
    }
  };

  const filtered = talleres.filter(t =>
    (t.nombreTaller || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.descripcion || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.horarioDescripcion || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / talleresPerPage));
  const startIndex = (currentPage - 1) * talleresPerPage;
  const paginatedTalleres = filtered.slice(startIndex, startIndex + talleresPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Cálculos de KPIs
  const totalTalleres = talleres.length;
  
  const totalAlumnos = talleres.reduce((acc, t) => {
    const active = t.inscripciones ? t.inscripciones.filter(i => i.estatusPago !== 'baja').length : 0;
    return acc + active;
  }, 0);

  const talleresLlenos = talleres.filter(t => {
    const active = t.inscripciones ? t.inscripciones.filter(i => i.estatusPago !== 'baja').length : 0;
    return active >= t.cupoMaximo;
  }).length;

  const ingresosReales = pagos.reduce((acc, p) => {
    return acc + Number(p.monto);
  }, 0);

  const getActiveCount = (taller) => {
    return taller.inscripciones ? taller.inscripciones.filter(i => i.estatusPago !== 'baja').length : 0;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Gestión de Talleres
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Administra la oferta académica
          </p>
        </div>
      </div>

      {/* KPIs Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Talleres', value: totalTalleres, icon: Calendar, color: 'bg-white/15 border-white/25 text-white hover:shadow-white/20' },
          { label: 'Alumnos Inscritos', value: totalAlumnos, icon: Users, color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:shadow-emerald-500/20' },
          { label: 'Talleres Llenos', value: talleresLlenos, icon: TrendingUp, color: 'bg-rose-500/20 border-rose-500/30 text-rose-300 hover:shadow-rose-500/20' },
          { label: 'Ingresos Reales 💰', value: `$${ingresosReales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-amber-500/20 border-amber-500/30 text-amber-300 hover:shadow-amber-500/20' },
        ].map(kpi => (
          <motion.div 
            key={kpi.label}
            whileHover={{ scale: 1.02 }}
            className={`rounded-2xl p-4 border backdrop-blur-md ${kpi.color} flex items-center gap-3 shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative group`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
            <kpi.icon size={22} className="opacity-90 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{kpi.label}</p>
              <p className="text-lg md:text-xl font-black tracking-tighter truncate max-w-[140px] md:max-w-none">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Barra de Controles Unificada en Glassmorphic */}
      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/20 bg-slate-950/45 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl ring-1 ring-white/5 mt-2">
        <div className="relative flex-1 sm:max-w-xl w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
          <input
            className="w-full rounded-2xl border border-white/15 bg-black/25 pl-12 pr-5 py-3 text-sm text-white shadow-inner shadow-black/20 placeholder-white/45 transition-all hover:border-white/30 hover:bg-black/35 focus:border-pink-400/70 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-pink-500/25"
            placeholder="Buscar taller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button 
          onClick={handleNew} 
          className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ring-1 ring-pink-300/20"
        >
          <Plus size={16} />
          <span className="whitespace-nowrap">Nuevo Taller</span>
        </button>
      </div>

      <div className="responsive-table-container mt-2">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Nombre del Taller</th>
              <th>Costo Mensual</th>
              <th>Cupo Máx.</th>
              <th>Horario / Descripción</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center animate-pulse text-white/20 font-bold">Cargando talleres...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center text-white/20 italic font-medium">No se encontraron talleres.</td></tr>
            ) : (
              paginatedTalleres.map(t => (
                <tr key={t.id} className="hover:bg-white/5 transition group">
                  <td data-label="Taller">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const { icon: TallerIcon, color, bg } = getTallerIcon(t.nombreTaller);
                        return (
                          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                            <TallerIcon size={20} />
                          </div>
                        );
                      })()}
                      <span className="font-bold text-white/90">{t.nombreTaller}</span>
                    </div>
                  </td>
                  <td data-label="Costo">
                    <span className="text-emerald-300 font-bold drop-shadow-sm">${Number(t.costoMensual).toFixed(2)}</span>
                  </td>
                  <td data-label="Cupo">
                    <div className="flex flex-col gap-1.5 max-w-[130px]">
                      <div className="flex items-center justify-between text-xs font-bold text-white/80">
                        <span>{getActiveCount(t)} / {t.cupoMaximo}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                          getActiveCount(t) >= t.cupoMaximo
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : t.cupoMaximo - getActiveCount(t) <= 3
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {getActiveCount(t) >= t.cupoMaximo
                            ? 'Lleno'
                            : t.cupoMaximo - getActiveCount(t) <= 3
                            ? 'Últimos'
                            : 'Libre'}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            getActiveCount(t) >= t.cupoMaximo
                              ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                              : t.cupoMaximo - getActiveCount(t) <= 3
                              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          }`}
                          style={{ width: `${Math.min(100, (getActiveCount(t) / t.cupoMaximo) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td data-label="Horario" className="text-sm text-white/90 font-medium max-w-xs break-words drop-shadow-sm leading-tight">{t.horarioDescripcion || 'Sin horario definido'}</td>
                  <td data-label="Acciones" className="text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setDetailTaller(t)} 
                        className="p-2.5 bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-purple-500/30 text-white/60" 
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(t)} 
                        className="p-2.5 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-cyan-500/30 text-white/60" 
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)} 
                        className="p-2.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all duration-300 border border-white/5 hover:border-rose-500/30 text-white/60" 
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > talleresPerPage && (
        <div className="mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 shadow-lg shadow-black/20 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            Mostrando {startIndex + 1}-{Math.min(startIndex + talleresPerPage, filtered.length)} de {filtered.length} talleres
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/10 disabled:hover:shadow-none"
            >
              Anterior
            </button>
            <span className="min-w-28 text-center text-xs font-black uppercase tracking-wider text-white/80">
              Página <span className="text-emerald-400">{currentPage}</span> de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/10 disabled:hover:shadow-none"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
             title={editTaller ? 'Editar Taller' : 'Nuevo Taller'}
             maxWidth="max-w-2xl">
        <TallerForm taller={editTaller} onClose={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>

      {/* Modal Detalle Taller */}
      {detailTaller && (
        <Modal isOpen={!!detailTaller} onClose={() => setDetailTaller(null)} title="Detalle del Taller" maxWidth="max-w-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {(() => {
                const { icon: TallerIcon, color, bg } = getTallerIcon(detailTaller.nombreTaller);
                return (
                  <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center ${color} border border-white/10`}>
                    <TallerIcon size={32} />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-xl font-black text-white">{detailTaller.nombreTaller}</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border mt-1.5 ${
                  getActiveCount(detailTaller) >= detailTaller.cupoMaximo
                    ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                    : detailTaller.cupoMaximo - getActiveCount(detailTaller) <= 3
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    getActiveCount(detailTaller) >= detailTaller.cupoMaximo
                      ? 'bg-rose-500 animate-pulse'
                      : detailTaller.cupoMaximo - getActiveCount(detailTaller) <= 3
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-emerald-500 animate-pulse'
                  }`} />
                  {getActiveCount(detailTaller) >= detailTaller.cupoMaximo
                    ? 'Cupo Agotado'
                    : detailTaller.cupoMaximo - getActiveCount(detailTaller) <= 3
                    ? `Últimos ${detailTaller.cupoMaximo - getActiveCount(detailTaller)} lugares`
                    : 'Inscripciones Abiertas'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:col-span-2 overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Descripción del Taller</p>
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">{detailTaller.descripcion || 'Sin descripción disponible.'}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Horario Definido</p>
                <p className="text-sm text-white/90 font-bold">{detailTaller.horarioDescripcion || 'Sin horario definido.'}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Inversión Mensual</p>
                <p className="text-lg text-emerald-400 font-black">${Number(detailTaller.costoMensual).toFixed(2)} MXN</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Ocupación y Cupo</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-white/80">
                    <span>Ocupado: {getActiveCount(detailTaller)} / {detailTaller.cupoMaximo} lugares</span>
                    <span>{Math.round((getActiveCount(detailTaller) / detailTaller.cupoMaximo) * 100)}% de ocupación</span>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        getActiveCount(detailTaller) >= detailTaller.cupoMaximo
                          ? 'bg-rose-500'
                          : detailTaller.cupoMaximo - getActiveCount(detailTaller) <= 3
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (getActiveCount(detailTaller) / detailTaller.cupoMaximo) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailTaller(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-bold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText="Cancelar"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`fixed right-6 top-6 z-200 flex items-center gap-3 rounded-2xl bg-slate-950/90 px-5 py-4 text-white shadow-2xl backdrop-blur-xl ${
              toast.type === 'delete' || toast.type === 'error'
                ? 'border border-rose-500/25 shadow-rose-500/10'
                : 'border border-emerald-500/20 shadow-emerald-500/10'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              toast.type === 'delete' || toast.type === 'error'
                ? 'border-rose-500/25 bg-rose-500/10 text-rose-400'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
            }`}>
              {toast.type === 'delete' || toast.type === 'error' ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
            </div>
            <div>
              <p className="text-sm font-black">{toast.title}</p>
              <p className="text-xs font-medium text-white/50">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Talleres;
