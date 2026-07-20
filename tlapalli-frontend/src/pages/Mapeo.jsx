import { useState, useEffect } from 'react';
import api from '../services/api';
import MapaHuamantla from '../components/MapaHuamantla';
import { Loader2, MapPin } from 'lucide-react';

export default function Mapeo() {
  const [dataBarrios, setDataBarrios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/stats/dashboard');
      if (data && data.alumnosPorBarrio) {
        setDataBarrios(data.alumnosPorBarrio);
      }
    } catch (err) {
      console.error('Error al cargar datos del mapa:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)] flex items-center gap-3">
            <MapPin className="text-pink-500 shrink-0" size={32} />
            Mapeo Geográfico de Huamantla
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Análisis de distribución de inscripciones por barrio, colonia y comunidad
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/60 border border-white/15 rounded-3xl">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-3" />
          <p className="text-white/50 text-sm font-semibold">Cargando ubicaciones y marcadores...</p>
        </div>
      ) : (
        <MapaHuamantla datosBarrios={dataBarrios} />
      )}
    </div>
  );
}
