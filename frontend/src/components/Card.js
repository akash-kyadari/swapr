export default function Card({ children, className = '', variant = 'default', hover = false, padding = 'default', fullWidth = false }) {
  const base = 'bg-white/80 backdrop-blur-sm border border-secondary-200/60 rounded-3xl shadow-sm transition-all duration-300';
  
  const variants = {
    default: 'bg-white/80 backdrop-blur-sm border border-secondary-200/60',
    elevated: 'bg-white shadow-lg border border-secondary-200/60 hover:shadow-2xl',
    glass: 'bg-white/40 backdrop-blur-md border border-white/20',
    gradient: 'bg-gradient-to-br from-white/90 to-secondary-50/90 backdrop-blur-sm border border-secondary-200/60',
    dark: 'bg-secondary-800/90 backdrop-blur-sm border border-secondary-700/60 text-white',
    primary: 'bg-gradient-to-br from-primary-50/90 to-primary-100/90 backdrop-blur-sm border border-primary-200/60',
    success: 'bg-gradient-to-br from-success-50/90 to-success-100/90 backdrop-blur-sm border border-success-200/60',
    warning: 'bg-gradient-to-br from-warning-50/90 to-warning-100/90 backdrop-blur-sm border border-warning-200/60',
    error: 'bg-gradient-to-br from-error-50/90 to-error-100/90 backdrop-blur-sm border border-error-200/60',
  };
  
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const hoverEffects = hover ? 'hover:shadow-2xl hover:scale-[1.025] hover:border-secondary-300/60 card-hover' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${base} ${variants[variant]} ${hoverEffects} ${widthClass} ${className}`}>
      <div className={paddingSizes[padding]}>
        {children}
      </div>
    </div>
  );
} 