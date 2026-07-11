function Pagination({ currentPage, totalPages, startIndex, itemsPerPage, filteredLength, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/15 bg-slate-950/80 px-5 py-4 shadow-lg shadow-black/20 ">
      <p className="text-xs font-bold uppercase tracking-wider text-white/80">
        Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLength)} de {filteredLength} registros
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-full border border-white/15 bg-slate-800/90 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:bg-slate-800/90 disabled:hover:shadow-none"
        >
          Anterior
        </button>
        <span className="min-w-28 text-center text-xs font-black uppercase tracking-wider text-white/80">
          Página <span className="text-emerald-400">{currentPage}</span> de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-full border border-white/15 bg-slate-800/90 px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:bg-slate-800/90 disabled:hover:shadow-none"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Pagination;
