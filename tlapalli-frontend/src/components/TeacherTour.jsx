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
  BookOpen,
  ClipboardCheck,
  CreditCard,
  User,
  LayoutDashboard
} from 'lucide-react';

const TOUR_STEPS = [
  {
    target: null, // Modal central de bienvenida
    title: '¡Bienvenido(a) a Tlapalli!',
    description: 'Te damos la bienvenida a tu panel de instructor. Te guiaremos paso a paso por las herramientas que utilizarás a diario.',
    icon: Sparkles,
    badge: 'Paso 1 de 6',
  },
  {
    target: '[data-tour="sidebar-mis-grupos"]',
    title: 'Mis Grupos',
    description: 'En esta sección podrás consultar tus talleres asignados, crear grupos de clase y administrar a tus alumnos inscritos.',
    icon: LayoutDashboard,
    badge: 'Paso 2 de 6',
  },
  {
    target: '[data-tour="sidebar-asistencia"]',
    title: 'Pasar Lista',
    description: 'Registra la asistencia diaria de tus alumnos de forma rápida, marcar justificantes o consultar el historial de asistencias.',
    icon: ClipboardCheck,
    badge: 'Paso 3 de 6',
  },
  {
    target: '[data-tour="sidebar-pagos"]',
    title: 'Pagos y Mensualidades',
    description: 'Consulta el estado de cuotas y recibos de pago de los alumnos de tus talleres para un seguimiento adecuado.',
    icon: CreditCard,
    badge: 'Paso 4 de 6',
  },
  {
    target: '[data-tour="sidebar-perfil"]',
    title: 'Mi Perfil',
    description: 'Actualiza tu foto de perfil, datos de contacto y contraseña de acceso en cualquier momento.',
    icon: User,
    badge: 'Paso 5 de 6',
  },
  {
    target: '[data-tour="sidebar-help-tour"]',
    title: 'Centro de Ayuda / Reorganizar Guía',
    description: 'Esta guía automática se mostrará en tus primeras 3 visitas. Si deseas volver a revisarla en el futuro, siempre podrás hacer clic en este botón.',
    icon: HelpCircle,
    badge: 'Paso 6 de 6',
  },
];

export default function TeacherTour({ forceOpen = false, onCloseForce }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const storageKey = user?.id ? `tlapalli_profesor_tour_count_${user.id}` : 'tlapalli_profesor_tour_count';

  // Manejar apertura automática o forzada
  useEffect(() => {
    if (user?.rol !== 'profesor') return;

    if (forceOpen) {
      setCurrentStep(0);
      setIsOpen(true);
      return;
    }

    const count = parseInt(localStorage.getItem(storageKey) || '0', 10);
    if (count < 3) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user, forceOpen, storageKey]);

  // Escuchar evento personalizado global para abrir el tour desde cualquier parte
  useEffect(() => {
    const handleOpenEvent = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('open-teacher-tour', handleOpenEvent);
    return () => window.removeEventListener('open-teacher-tour', handleOpenEvent);
  }, []);

  // Calcular posición del elemento destacado
  const updateTargetRect = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
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
    if (currentStep < TOUR_STEPS.length - 1) {
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

  if (!isOpen || user?.rol !== 'profesor') return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const isCentered = !step.target || !targetRect;

  // Cálculo inteligente de posición de la tarjeta emergente
  let tooltipStyle = {};
  if (!isCentered && targetRect) {
    const spaceRight = window.innerWidth - (targetRect.left + targetRect.width);
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);

    if (spaceRight > 320) {
      // Posicionar a la derecha del target (ideal para sidebar)
      tooltipStyle = {
        top: Math.max(16, Math.min(targetRect.top, window.innerHeight - 260)),
        left: targetRect.left + targetRect.width + 16,
      };
    } else if (spaceBelow > 260) {
      // Posicionar debajo del target
      tooltipStyle = {
        top: targetRect.top + targetRect.height + 16,
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 340)),
      };
    } else {
      // Posicionar arriba
      tooltipStyle = {
        top: Math.max(16, targetRect.top - 240),
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

        {/* Foco o resplandor sobre el elemento objetivo */}
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

        {/* Tarjeta del Tour */}
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
                <Sparkles size={12} className="text-pink-400" />
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
              </div>
            </div>

            {/* Progreso en barra */}
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-6 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-pink-500 to-orange-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Botones de Navegación */}
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
                  {currentStep === TOUR_STEPS.length - 1 ? (
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
