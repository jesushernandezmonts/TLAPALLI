import { Search, X } from 'lucide-react';

function SearchBar({ value, onChange, placeholder = 'Buscar...', onClear }) {
  return (
    <div className="relative flex-1 sm:max-w-xl w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
      <input
        className="w-full rounded-2xl border border-white/15 bg-slate-900/85 pl-12 pr-10 py-3 text-base text-white/90 caret-white shadow-inner shadow-black/20 placeholder-white/45 transition-all hover:border-white/30 hover:bg-black/35 focus:border-pink-400/70 focus:bg-slate-900/95 focus:outline-none focus:ring-2 focus:ring-pink-500/25"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => { onChange(''); onClear?.(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
