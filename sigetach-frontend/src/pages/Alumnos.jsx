import { useState, useEffect } from 'react';
import api from '../services/api';

function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const { data } = await api.get('/alumnos');
      setAlumnos(data);
    } catch (err) {
      console.error('Error al cargar alumnos', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = alumnos.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.curp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white/90">Gestión de Alumnos</h1>
        <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-lg">
          + Nuevo Alumno
        </button>
      </div>
      
      <div className="relative w-full md:w-96">
        <input
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 pl-10 placeholder-white/40 text-white focus:outline-none focus:border-pink-500/50 backdrop-blur-sm"
          placeholder="Buscar por nombre o CURP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="absolute left-3 top-2.5 opacity-40">🔍</span>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Nombre Completo</th>
                <th className="p-4 font-semibold">CURP</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center animate-pulse text-white/60">Cargando alumnos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-white/40 italic">No se encontraron registros.</td></tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-white/5 transition group">
                    <td className="p-4">
                      <div className="font-medium text-white/90">{a.nombre} {a.apellidoPaterno} {a.apellidoMaterno}</div>
                      <div className="text-xs text-white/40">ID: #{a.id}</div>
                    </td>
                    <td className="p-4 text-sm font-mono text-white/70">{a.curp}</td>
                    <td className="p-4 text-sm text-white/70">{a.telefono || <span className="opacity-30">N/A</span>}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${a.estatusActivo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                        {a.estatusActivo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button className="text-cyan-400 hover:text-cyan-300 transition text-sm font-medium">Editar</button>
                      <button className="text-rose-400 hover:text-rose-300 transition text-sm font-medium">Borrar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Alumnos;
