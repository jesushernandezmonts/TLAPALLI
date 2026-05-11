function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      {/* Contenido del modal con glassmorphism */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
