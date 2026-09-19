import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, Palette, Calendar, Clock, DollarSign } from 'lucide-react';

function AlumnoTalleres() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [talleres, setTalleres] = useState([]);

  useEffect(() => {
    const fetchTalleres = async () => {
      try {
        const { data } = await api.get('/alumnos/me/talleres');
        setTalleres(data);
      } catch (err) {
        console.error('Error loading talleres', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTalleres();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-violet-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
          Mis Talleres
        </h1>
        <p className="mt-1 text-base font-semibold text-white/75">
          Talleres a los que estás inscrito(a)
        </p>
      </div>

      {talleres.length === 0 ? (
        <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-12 text-center">
          <Palette size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 font-medium">No estás inscrito en ningún taller actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talleres.map((insc) => (
            <div key={insc.id} className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 hover:border-pink-500/50 transition-all duration-300 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400">
                  <Palette size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-pink-400 transition-colors">{insc.taller?.nombreTaller}</h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                    Inscrito desde {new Date(insc.fechaInscripcion).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-slate-200 font-medium">
                  <Clock size={16} className="text-cyan-400 shrink-0" />
                  <span>{insc.taller?.horarioDescripcion || 'Horario no especificado'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-200 font-medium">
                  <DollarSign size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-black text-base">${Number(insc.taller?.costoMensual).toFixed(2)} / mes</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                  insc.estatusPago === 'al_corriente'
                    ? 'bg-emerald-500 text-slate-950'
                    : insc.estatusPago === 'deudor'
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-400 text-slate-950'
                }`}>
                  {insc.estatusPago === 'al_corriente' ? '✓ Al corriente' : insc.estatusPago === 'deudor' ? '✕ Deudor' : '⏳ Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlumnoTalleres;
