const statusConfig = {
  activo: {
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Activo',
  },
  pendiente: {
    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Pendiente',
  },
  inactivo: {
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    label: 'Inactivo',
  },
  completo: {
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Completo',
  },
  critico: {
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    label: 'Crítico',
  },
  incompleto: {
    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Incompleto',
  },
};

function StatusBadge({ status, label, classes, dotColor, size = 'sm' }) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm'
    ? 'px-3 py-1 text-[10px]'
    : 'px-4 py-1.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-tighter border ${sizeClasses} ${
        classes || config?.classes || 'bg-white/5 text-white/40 border-white/10'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          dotColor || config?.dot || 'bg-white/30'
        }`}
      />
      {label || config?.label || status}
    </span>
  );
}

export default StatusBadge;
