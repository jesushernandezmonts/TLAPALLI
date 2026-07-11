import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

function Toast({ toast, onClose }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`fixed right-6 top-6 z-200 flex items-center gap-3 rounded-2xl bg-slate-950/90 px-5 py-4 text-white shadow-2xl  ${
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
            {toast.type === 'delete' || toast.type === 'error' ? (
              <AlertTriangle size={22} />
            ) : (
              <CheckCircle size={22} />
            )}
          </div>
          <div>
            <p className="text-sm font-black">{toast.title}</p>
            {toast.message && (
              <p className="text-xs font-medium text-white/50">{toast.message}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
