import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, CreditCard, Calendar, DollarSign, CheckCircle2, XCircle } from 'lucide-react';

function AlumnoPagos() {
  const { alumno } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const { data } = await api.get('/alumnos/me/pagos');
        setPagos(data);
      } catch (err) {
        console.error('Error loading pagos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-violet-500" /></div>;
  }

  const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Mis Pagos
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75">
            Historial de tus pagos en TLAPALLI
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl px-6 py-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Total pagado</p>
          <p className="text-2xl font-black text-white">${totalPagado.toFixed(2)}</p>
        </div>
      </div>

      {pagos.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-12 text-center">
          <CreditCard size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 font-medium">No hay pagos registrados aún.</p>
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Mes</th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Monto</th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Método</th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Fecha de Pago</th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-white/40">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pagos.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-white/90 font-medium capitalize">{p.mesCorrespondiente}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-emerald-400 font-black text-lg">${Number(p.monto).toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        {p.metodoPago}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <Calendar size={14} />
                        {new Date(p.fechaPago).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 size={14} />
                        Pagado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumnoPagos;
