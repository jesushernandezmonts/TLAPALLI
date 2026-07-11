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
            <div key={insc.id} className="bg-gradient-to-br from-violet-600/10 to-purple-600/5 border border-violet-500/20 rounded-2xl p-6 hover:border-violet-500/40 transition-all duration-300 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-violet-500/20">
                  <Palette size={24} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{insc.taller?.nombreTaller}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                    Inscrito desde {new Date(insc.fechaInscripcion).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock size={14} className="text-cyan-400" />
                  <span>{insc.taller?.horarioDescripcion || 'Horario no especificado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <DollarSign size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold">${Number(insc.taller?.costoMensual).toFixed(2)} / mes</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/15">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  insc.estatusPago === 'al_corriente'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : insc.estatusPago === 'deudor'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {insc.estatusPago === 'al_corriente' ? 'Al corriente' : insc.estatusPago === 'deudor' ? 'Deudor' : 'Pendiente'}
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
