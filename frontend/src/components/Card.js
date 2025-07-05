export default function Card({ children, className = '', variant = 'default', hover = false }) {
  const base = 'bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm';
  
  const variants = {
    default: 'bg-white/80 backdrop-blur-sm border border-slate-200/60',
    elevated: 'bg-white shadow-lg border border-slate-200/60',
    glass: 'bg-white/40 backdrop-blur-md border border-white/20',
    gradient: 'bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm border border-slate-200/60',
  };
  
  const hoverEffects = hover ? 'hover:shadow-xl hover:scale-[1.02] hover:border-slate-300/60' : '';
  
  return (
    <div className={`${base} ${variants[variant]} ${hoverEffects} transition-all duration-300 ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
} 