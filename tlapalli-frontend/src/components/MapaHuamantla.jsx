import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { MapPin, Users, Compass, Award, Building2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Coordenadas aproximadas de las comunidades y barrios de Huamantla, Tlaxcala
const COORDENADAS_HUAMANTLA = {
  'Barrio de San Miguel': [19.3175, -97.9250],
  'Barrio de Santa Ana': [19.3120, -97.9200],
  'Barrio de San José': [19.3150, -97.9300],
  'Barrio de La Preciosa': [19.3190, -97.9180],
  'Barrio de San Lucas': [19.3100, -97.9280],
  'Barrio de la Trinidad': [19.3220, -97.9260],
  'Barrio de Jesús': [19.3080, -97.9210],
  'Barrio de San Antonio': [19.3160, -97.9150],
  'Colonia Cuauhtémoc': [19.3250, -97.9320],
  'Colonia Benito Juárez': [19.3050, -97.9350],
  'Colonia San Rafael': [19.3280, -97.9200],
  'Colonia El Alto': [19.3300, -97.9100],
  'Colonia Volcanes': [19.3020, -97.9150],
  'Colonia Nuevos Horizontes': [19.3200, -97.9400],
  'Ignacio Zaragoza': [19.2780, -97.8920],
  'Benito Juárez (Comunidad)': [19.3450, -97.8750],
  'San José Xicohténcatl': [19.3820, -97.8900],
  'Francisco Villa': [19.2950, -97.8600],
  'Galeana': [19.2680, -97.9500],
  'Chapultepec': [19.3100, -97.8950],
  'Carmen Xalpatlahuaya': [19.2550, -97.9200],
  'Los Pilares': [19.3600, -97.9400],
  'El Carmen Aztama': [19.2800, -97.9600],
  'Concepción Hidalgo': [19.3400, -97.9600],
  'Fuera de Huamantla / Otro': [19.3142, -97.9242],
  'Sin especificar': [19.3142, -97.9242],
};

function MapaHuamantla({ datosBarrios = [] }) {
  // Calcular total de alumnos con información de ubicación
  const totalConUbicacion = useMemo(() => {
    return datosBarrios.reduce((sum, b) => sum + b.cantidad, 0);
  }, [datosBarrios]);

  // Obtener la zona con más alumnos
  const zonaTop = useMemo(() => {
    if (!datosBarrios || datosBarrios.length === 0) return null;
    return datosBarrios[0];
  }, [datosBarrios]);

  // Radio dinámico según cantidad
  const getMarkerRadius = (count) => {
    if (count <= 1) return 12;
    if (count <= 5) return 18;
    if (count <= 15) return 24;
    return 32;
  };

  // Color según densidad
  const getMarkerColor = (count) => {
    if (count >= 10) return '#ec4899'; // Rosa fuerte
    if (count >= 5) return '#a855f7';  // Púrpura
    if (count >= 2) return '#3b82f6';  // Azul
    return '#10b981';                 // Esmeralda
  };

  return (
    <div className="space-y-6">
      {/* Header del Mapeo Geográfico */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-white/15 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <Compass size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              Distribución Geográfica de Inscritos
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300">
                Huamantla
              </span>
            </h3>
            <p className="text-xs font-semibold text-white/60 mt-0.5">
              Análisis visual de los barrios y comunidades con mayor número de alumnos
            </p>
          </div>
        </div>

        {zonaTop && (
          <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl px-4 py-2.5">
            <Award className="text-pink-400 shrink-0" size={20} />
            <div>
              <p className="text-[10px] font-black uppercase text-pink-300/80 tracking-wider">Zona Líder</p>
              <p className="text-xs font-bold text-white">
                {zonaTop.barrio}: <span className="text-pink-400 font-extrabold">{zonaTop.cantidad} alumnos</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenedor del Mapa Interactivo (2 columnas) */}
        <div className="lg:col-span-2 relative h-[450px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl z-10">
          <MapContainer
            center={[19.3142, -97.9242]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ background: '#0f172a' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {datosBarrios.map((item) => {
              const coords = COORDENADAS_HUAMANTLA[item.barrio] || COORDENADAS_HUAMANTLA['Sin especificar'];
              const radius = getMarkerRadius(item.cantidad);
              const color = getMarkerColor(item.cantidad);
              const porcentaje = totalConUbicacion > 0 ? Math.round((item.cantidad / totalConUbicacion) * 100) : 0;

              return (
                <CircleMarker
                  key={item.barrio}
                  center={coords}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.7,
                    color: '#ffffff',
                    weight: 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="text-xs font-bold px-1 py-0.5">
                      <span className="text-slate-900 font-black">{item.barrio}</span>
                      <div className="text-pink-600 font-extrabold">{item.cantidad} inscrito(s) ({porcentaje}%)</div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-1 text-slate-900 space-y-1">
                      <h4 className="font-extrabold text-sm border-b pb-1 flex items-center gap-1.5">
                        <MapPin size={14} className="text-pink-600" /> {item.barrio}
                      </h4>
                      <p className="text-xs font-medium">Alumnos inscritos: <strong>{item.cantidad}</strong></p>
                      <p className="text-xs text-slate-500 font-medium">Proporción: <strong>{porcentaje}% del total</strong></p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Leyenda flotante */}
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/90 border border-white/20 backdrop-blur-md rounded-2xl p-3 shadow-xl flex items-center gap-3 text-[11px] font-bold text-white">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 border border-white/40"></span> 1 alumno</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 border border-white/40"></span> 2-4</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 border border-white/40"></span> 5-9</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-pink-500 border border-white/40"></span> 10+ alumnos</span>
          </div>
        </div>

        {/* Panel Lateral: Lista y Estadísticas por Barrio (1 columna) */}
        <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-5 flex flex-col justify-between shadow-2xl h-[450px]">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Building2 size={16} className="text-pink-400" />
                Desglose por Zona
              </h4>
              <span className="text-xs font-bold text-white/50">{datosBarrios.length} zonas registradas</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1.5 custom-scrollbar">
              {datosBarrios.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs italic">
                  No hay datos registrados de barrios o comunidades.
                </div>
              ) : (
                datosBarrios.map((b, index) => {
                  const pct = totalConUbicacion > 0 ? Math.round((b.cantidad / totalConUbicacion) * 100) : 0;
                  return (
                    <div
                      key={b.barrio}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-white/10 rounded-2xl p-3 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white truncate max-w-[170px]" title={b.barrio}>
                          {index + 1}. {b.barrio}
                        </span>
                        <span className="text-pink-400 font-extrabold shrink-0">
                          {b.cantidad} {b.cantidad === 1 ? 'alumno' : 'alumnos'} ({pct}%)
                        </span>
                      </div>
                      {/* Barra de progreso */}
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60 font-semibold">
            <span className="flex items-center gap-1">
              <Users size={14} className="text-pink-400" /> Total con ubicación:
            </span>
            <span className="text-white font-black">{totalConUbicacion}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaHuamantla;
