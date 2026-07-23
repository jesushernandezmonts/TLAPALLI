import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  HelpCircle,
  LayoutDashboard,
  Users,
  UserSquare2,
  Palette,
  ClipboardCheck,
  BarChart3,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Lock
} from 'lucide-react';

const ADMIN_TOUR_STEPS = [
  {
    target: null, // Modal central de bienvenida
    title: '¡Bienvenido(a) Administrador(a)!',
    description: 'Te damos la bienvenida al panel de administración de TLAPALLI. Tienes el control total sobre los talleres, alumnos, profesores, reportes y configuraciones del sistema.',
    icon: Sparkles,
    badge: 'Paso 1 de 10',
  },
  {
    target: '[data-tour="sidebar-dashboard"]',
    title: 'Dashboard General',
    description: 'Consulta métricas y estadísticas clave en tiempo real: total de alumnos inscritos, instructores activos, asistencia general y accesos rápidos.',
    icon: LayoutDashboard,
    badge: 'Paso 2 de 10',
  },
  {
    target: '[data-tour="sidebar-alumnos"]',
    title: 'Gestión de Alumnos',
    description: 'Registra nuevos estudiantes, edita su información personal, consulta documentos y gestiona el estatus de inscripción.',
    icon: Users,
    badge: 'Paso 3 de 10',
  },
  {
    target: '[data-tour="sidebar-instructores"]',
    title: 'Instructores y Profesores',
    description: 'Administra la plantilla de profesores, genera credenciales de acceso, asigna correos institucionales y supervisa sus asignaciones.',
    icon: UserSquare2,
    badge: 'Paso 4 de 10',
  },
  {
    target: '[data-tour="sidebar-talleres"]',
    title: 'Catálogo de Talleres',
    description: 'Crea y edita la oferta de talleres culturales/artísticos, configura cupos disponibles, horarios, áreas y costos.',
    icon: Palette,
    badge: 'Paso 5 de 10',
  },
  {
    target: '[data-tour="sidebar-asistencia-admin"]',
    title: 'Supervisión de Asistencias y Desbloqueos',
    description: 'Monitorea el pase de lista de todos los grupos. Desde aquí podrás administrar el **desbloqueo de profesores** que acumularon 2 omisiones de lista.',
    warning: 'Recuerda que si un profesor acumula 2 faltas al pasar lista, el sistema bloquea su cuenta por seguridad. Solo el rol de Administrador puede realizar el desbloqueo tras validar la situación.',
    icon: ClipboardCheck,
    badge: 'Paso 6 de 10',
  },
  {
    target: '[data-tour="sidebar-reportes"]',
    title: 'Módulo de Reportes',
    description: 'Genera e imprime reportes consolidados en formato PDF o listas ejecutivas sobre inscripciones, asistencias y rendimiento general.',
    icon: BarChart3,
    badge: 'Paso 7 de 10',
  },
  {
    target: '[data-tour="sidebar-mapeo"]',
    title: 'Mapeo Territorial',
    description: 'Visualiza la geolocalización de talleres y la distribución geográfica de los estudiantes registrados en Huamantla.',
    icon: MapPin,
    badge: 'Paso 8 de 10',
  },
  {
    target: '[data-tour="sidebar-servicio-social"]',
    title: 'Servicio Social',
    description: 'Administra a los prestadores de servicio social, registra sus horas cumplidas y supervisa la expedición de constancias.',
    icon: HeartHandshake,
    badge: 'Paso 9 de 10',
  },
  {
    target: '[data-tour="sidebar-help-tour"]',
    title: 'Centro de Ayuda y Reinicio',
    description: 'Esta guía automática se mostrará en tus primeras 3 visitas. Si deseas volver a consultarla en el futuro, haz clic en este botón en cualquier momento.',
    icon: HelpCircle,
    badge: 'Paso 10 de 10',
  },
];

export default function AdminTour({ forceOpen = false, onCloseForce }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const storageKey = user?.id ? `tlapalli_admin_tour_count_${user.id}` : 'tlapalli_admin_tour_count';

  // Manejar apertura automática o forzada
  useEffect(() => {
    const isAdmin = user?.rol?.toLowerCase() === 'admin';

    if (forceOpen) {
      setCurrentStep(0);
      setIsOpen(true);
      return;
    }

    if (!isAdmin) return;

    const count = parseInt(localStorage.getItem(storageKey) || '0', 10);
    if (count < 3) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user, forceOpen, storageKey]);

  // Escuchar evento personalizado global para abrir el tour de admin
  useEffect(() => {
    const handleOpenEvent = () => {
      if (user?.rol?.toLowerCase() === 'admin') {
        setCurrentStep(0);
        setIsOpen(true);
      }
    };
    window.addEventListener('open-admin-tour', handleOpenEvent);
    return () => window.removeEventListener('open-admin-tour', handleOpenEvent);
  }, [user]);

  // Calcular posición del elemento destacado
  const updateTargetRect = useCallback(() => {
    const step = ADMIN_TOUR_STEPS[currentStep];
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const isVisible = (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.left >= 0 &&
        rect.top >= 0 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );

      if (isVisible) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    updateTargetRect();
    const timer = setTimeout(updateTargetRect, 100);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isOpen, currentStep, updateTargetRect]);

  const incrementCount = () => {
    if (!forceOpen) {
      const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
      localStorage.setItem(storageKey, (current + 1).toString());
    }
  };

  const handleNext = () => {
    if (currentStep < ADMIN_TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    incrementCount();
    setIsOpen(false);
    if (onCloseForce) onCloseForce();
  };

  const handleSkip = () => {
    incrementCount();
    setIsOpen(false);
    if (onCloseForce) onCloseForce();
  };

  if (!isOpen) return null;

  const step = ADMIN_TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const isCentered = !step.target || !targetRect;

  // Posicionamiento de la tarjeta emergente
  let tooltipStyle = {};
  if (!isCentered && targetRect) {
    const spaceRight = window.innerWidth - (targetRect.left + targetRect.width);
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);

    if (spaceRight > 320) {
      tooltipStyle = {
        top: Math.max(16, Math.min(targetRect.top, window.innerHeight - 280)),
        left: targetRect.left + targetRect.width + 16,
      };
    } else if (spaceBelow > 280) {
      tooltipStyle = {
        top: targetRect.top + targetRect.height + 16,
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 340)),
      };
    } else {
      tooltipStyle = {
        top: Math.max(16, targetRect.top - 260),
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 340)),
      };
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto">
        {/* Fondo translúcido oscuro con desenfoque */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-all"
          onClick={handleSkip}
        />

        {/* Resplandor neón sobre el objetivo */}
        {!isCentered && targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute rounded-2xl pointer-events-none ring-4 ring-pink-500/80 shadow-[0_0_35px_rgba(236,72,153,0.6)] bg-pink-500/10 z-10 transition-all duration-300"
            style={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
          />
        )}

        {/* Tarjeta del Tour Admin */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            style={isCentered ? {} : tooltipStyle}
            className={`
              z-20 w-full max-w-md bg-slate-900/95 border border-pink-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-white
              ${isCentered ? 'relative mx-auto' : 'fixed'}
            `}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-pink-400" />
                {step.badge}
              </span>
              <button
                onClick={handleSkip}
                className="p-1.5 text-white/40 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Omitir guía"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 p-[2px] flex-shrink-0 shadow-lg shadow-pink-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <StepIcon size={22} className="text-pink-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight leading-snug">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-white/70 leading-relaxed font-medium">
                  {step.description}
                </p>

                {step.warning && (
                  <div className="mt-3.5 p-3 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-start gap-2.5 shadow-lg shadow-amber-950/20">
                    <Lock size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-amber-300 text-xs block mb-0.5 uppercase tracking-wide">💡 Función Exclusiva Admin</span>
                      <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                        {step.warning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-6 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-pink-500 to-orange-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / ADMIN_TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Botones de navegación */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                className="text-xs font-bold text-white/40 hover:text-white/80 transition px-2 py-1 cursor-pointer"
              >
                Omitir
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white/80 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white rounded-xl text-xs font-black shadow-lg shadow-pink-600/30 transition cursor-pointer"
                >
                  {currentStep === ADMIN_TOUR_STEPS.length - 1 ? (
                    <>Entendido <CheckCircle2 size={14} /></>
                  ) : (
                    <>Siguiente <ChevronRight size={14} /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
