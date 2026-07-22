import { Search, X } from 'lucide-react';

function SearchBar({ value, onChange, placeholder = 'Buscar...', onClear }) {
  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
      <input
        className="w-full rounded-2xl border border-white/20 bg-slate-900/90 pl-10 pr-9 py-2.5 text-sm font-semibold text-white caret-pink-500 shadow-lg placeholder-white/50 transition-all hover:border-white/40 focus:border-pink-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => { onChange(''); onClear?.(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
