function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-slate-950" onClick={onClose}></div>
      {/* Contenido del modal con glassmorphism */}
      <div className={`relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full ${maxWidth} shadow-none text-white max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
