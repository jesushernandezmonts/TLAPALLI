import { ChevronDown, Filter } from 'lucide-react';

function FilterDropdown({ options, value, onChange, icon, label, isOpen, onToggle, className = '' }) {
  const selected = options.find(opt => opt.value === value) || options[0];

  return (
    <div data-filter-dropdown className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-left text-xs font-black text-white shadow-inner shadow-black/20 outline-none transition hover:border-white/30 hover:bg-black/35 focus:border-pink-500/50"
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon && <span className="text-white/40 shrink-0">{icon}</span>}
          <span className="truncate">{selected?.label}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-[999] mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-pink-500/25 bg-slate-950 p-1.5 shadow-2xl shadow-black/60">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                option.value === value
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
