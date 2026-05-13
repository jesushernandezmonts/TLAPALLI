import { useState, useEffect } from 'react';
import api from '../services/api';

function ExpedienteDigital({ alumnoId }) {
  const [documentos, setDocumentos] = useState([]);
  const [tipo, setTipo] = useState('acta_nacimiento');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocumentos();
  }, [alumnoId]);

  const fetchDocumentos = async () => {
    try {
      const { data } = await api.get(`/documentos/alumno/${alumnoId}`);
      setDocumentos(data);
    } catch (err) {
      console.error('Error al cargar documentos', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('tipo', tipo);
    try {
      await api.post(`/documentos/upload/${alumnoId}`, formData);
      setArchivo(null);
      fetchDocumentos();
    } catch (err) {
      alert('Error al subir documento');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('¿Eliminar este documento?')) {
      try {
        await api.delete(`/documentos/${id}`);
        fetchDocumentos();
      } catch (err) {
        alert('Error al eliminar documento');
      }
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-white/90">Expediente Digital</h3>
      
      {/* Subir documento */}
      <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-3 mb-6">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500/50 transition">
          <option value="acta_nacimiento" className="text-black">Acta de Nacimiento</option>
          <option value="curp" className="text-black">CURP</option>
          <option value="identificacion" className="text-black">Identificación</option>
          <option value="foto" className="text-black">Foto</option>
          <option value="constancia_medica" className="text-black">Constancia Médica</option>
          <option value="otro" className="text-black">Otro</option>
        </select>
        <div className="flex-1 flex items-center gap-2">
          <input type="file" onChange={(e) => setArchivo(e.target.files[0])}
            className="text-white/70 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-600/20 file:text-pink-400 hover:file:bg-pink-600/30 transition cursor-pointer" 
            accept=".pdf,.jpg,.png" />
        </div>
        <button type="submit" disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg">
          {loading ? 'Subiendo...' : 'Subir'}
        </button>
      </form>

      {/* Lista de documentos */}
      <div className="space-y-3">
        {documentos.length === 0 ? (
          <p className="text-white/40 text-sm italic py-4">No hay documentos registrados para este alumno.</p>
        ) : (
          documentos.map(doc => (
            <div key={doc.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition group">
              <div>
                <p className="text-sm font-medium text-white/90">{doc.nombre}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{doc.tipo.replace('_', ' ')} • {new Date(doc.subidoEn).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-4">
                <a href={`http://localhost:3000${doc.url}`} target="_blank" rel="noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition text-sm font-medium">Ver</a>
                <button onClick={() => handleRemove(doc.id)} className="text-rose-400 hover:text-rose-300 transition text-sm font-medium">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExpedienteDigital;
