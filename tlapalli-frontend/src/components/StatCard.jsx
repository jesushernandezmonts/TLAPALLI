import { motion } from 'framer-motion';

const colorMap = {
  white: 'bg-slate-800 border-white/25 text-white hover:shadow-white/20',
  emerald: 'bg-emerald-500/90 border-emerald-400/40 text-white hover:shadow-emerald-500/20',
  amber: 'bg-amber-500/90 border-amber-400/40 text-white hover:shadow-amber-500/20',
  rose: 'bg-rose-500/90 border-rose-400/40 text-white hover:shadow-rose-500/20',
  purple: 'bg-purple-500/90 border-purple-400/40 text-white hover:shadow-purple-500/20',
  cyan: 'bg-cyan-500/90 border-cyan-400/40 text-white hover:shadow-cyan-500/20',
};

function StatCard({ icon: Icon, label, value, color = 'white' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl p-4 border  ${colorMap[color] || colorMap.white} flex items-center gap-3 shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative group`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-800/80 rounded-full blur-2xl group-hover:bg-slate-800/90 transition-all" />
      <Icon size={22} className="opacity-90 shrink-0" />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-xl font-black tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}

export default StatCard;
