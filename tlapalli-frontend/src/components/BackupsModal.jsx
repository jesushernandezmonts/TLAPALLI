import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Download, Trash2, Plus, Loader2, AlertCircle, HardDrive, RefreshCw, X, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function BackupsModal({ isOpen, onClose }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchBackups();
    }
  }, [isOpen]);

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/backups');
      setBackups(data);
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'No se pudieron cargar los respaldos', true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBackup = async () => {
    try {
      setGenerating(true);
      setError(null);
      const { data } = await api.post('/backups/generate');
      showNotification(`Respaldo '${data.filename}' generado correctamente (${data.sizeFormatted})`);
      await fetchBackups();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Error al generar el respaldo de la base de datos', true);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await api.get(`/backups/download/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification(`Descarga de '${filename}' iniciada`);
    } catch (err) {
      console.error(err);
      showNotification('Error al descargar el archivo de respaldo', true);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el respaldo '${filename}'?`)) {
      return;
    }
    try {
      setDeletingFile(filename);
      await api.delete(`/backups/${filename}`);
      showNotification(`Respaldo '${filename}' eliminado correctamente`);
      await fetchBackups();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'No se pudo eliminar el respaldo', true);
    } finally {
      setDeletingFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Respaldos de Base de Datos</h2>
                <p className="text-xs text-white/50">Administración de copias de seguridad (.sql.gz)</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Banner informativo / Notificaciones */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p className="flex-1">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
                <HardDrive size={18} className="shrink-0" />
                <p className="flex-1">{successMsg}</p>
              </div>
            )}

            {/* Acciones principales */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-800/50 border border-white/10 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Generación Manual</h3>
                <p className="text-xs text-white/50">Crea un volcado inmediato de PostgreSQL comprimido en servidor.</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateBackup}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Generando...
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Crear Nuevo Respaldo
                  </>
                )}
              </motion.button>
            </div>

            {/* Lista de Respaldos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">Archivos Disponibles ({backups.length})</h4>
                <button
                  onClick={fetchBackups}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualizar
                </button>
              </div>

              {loading && backups.length === 0 ? (
                <div className="py-12 text-center text-white/40 space-y-2">
                  <Loader2 size={24} className="animate-spin mx-auto text-indigo-400" />
                  <p className="text-xs">Cargando la lista de respaldos...</p>
                </div>
              ) : backups.length === 0 ? (
                <div className="py-10 border border-dashed border-white/10 rounded-2xl text-center text-white/40 space-y-2">
                  <Database size={32} className="mx-auto text-white/20" />
                  <p className="text-sm font-medium">No hay copias de seguridad almacenadas</p>
                  <p className="text-xs text-white/30">Haz clic arriba para generar el primer respaldo.</p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 bg-slate-800/30">
                  {backups.map((b) => (
                    <div key={b.filename} className="flex items-center justify-between p-4 hover:bg-white/5 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                          <HardDrive size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white font-mono">{b.filename}</p>
                          <p className="text-xs text-white/40">
                            {new Date(b.createdAt).toLocaleString('es-MX', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })} — <span className="text-indigo-300 font-semibold">{b.sizeFormatted}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(b.filename)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-600/40 transition cursor-pointer"
                        >
                          <Download size={14} /> Descargar
                        </button>

                        <button
                          onClick={() => handleDelete(b.filename)}
                          disabled={deletingFile === b.filename}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition cursor-pointer disabled:opacity-50"
                          title="Eliminar respaldo"
                        >
                          {deletingFile === b.filename ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-white/40">
            <span className="flex items-center gap-1">
              <ShieldAlert size={14} className="text-amber-400" />
              Solo accesible para administradores
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
