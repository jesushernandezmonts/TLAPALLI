import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown } from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CustomDatePicker({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const parsed = value ? new Date(value + 'T12:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, () => null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDate = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setOpen(false);
  };

  const formattedDate = value
    ? new Date(value + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Seleccionar fecha';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-800/80 border border-white/15 rounded-xl text-left text-sm font-medium transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800/90 hover:border-pink-500/30'}
          ${open ? 'border-pink-500/50 bg-slate-800/90 shadow-lg shadow-pink-500/5' : ''}
        `}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center">
            <CalendarDays size={15} className="text-pink-400" />
          </div>
          <span className="text-white/80">{formattedDate}</span>
        </div>
        <ChevronDown size={14} className={`text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900/95  border border-white/15 rounded-2xl p-4 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800/95 border border-white/15 text-white/50 hover:text-white transition-all">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-black text-white/90 uppercase tracking-wider">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800/95 border border-white/15 text-white/50 hover:text-white transition-all">
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-[9px] font-black text-white/25 uppercase py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {padding.map((_, i) => (<div key={`pad-${i}`} className="aspect-square" />))}
              {days.map(day => {
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dateStr === value;
                const isToday = dateStr === todayStr;
                return (
                  <motion.button
                    key={day}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => selectDate(day)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-150 relative
                      ${isSelected
                        ? 'bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
                        : isToday
                        ? 'bg-slate-800/90 text-white border border-pink-500/40'
                        : 'text-white/60 hover:bg-slate-800/90 hover:text-white'}
                    `}
                  >
                    {isToday && !isSelected && (
                      <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-pink-400" />
                    )}
                    {day}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-3 pt-2 border-t border-white/15 flex justify-center">
              <button
                type="button"
                onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); selectDate(today.getDate()); }}
                className="text-[10px] font-black text-pink-400 hover:text-pink-300 uppercase tracking-wider transition-colors"
              >
                Ir a Hoy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
