import { Search, X } from 'lucide-react';

function SearchBar({ value, onChange, placeholder = 'Buscar...', onClear }) {
  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-pink-400" />
      <input
        className="w-full rounded-[1.5rem] border-2 border-white/20 bg-slate-900/90 pl-14 pr-12 py-3.5 text-xl font-bold text-white caret-pink-500 shadow-xl shadow-black/30 placeholder-white/50 transition-all hover:border-white/40 hover:bg-black/50 focus:border-pink-500 focus:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-500/30"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => { onChange(''); onClear?.(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
