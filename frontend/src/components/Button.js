import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Button({ 
  children, 
  type = 'button', 
  loading, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  disabled,
  fullWidth = false,
  ...props 
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden shadow-sm';
  
  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
    xl: 'px-9 py-4 text-lg',
    '2xl': 'px-12 py-5 text-xl',
  };
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-2xl focus:ring-primary-500 btn-hover',
    secondary: 'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 hover:border-secondary-400 focus:ring-secondary-500 shadow-sm hover:shadow-md',
    outline: 'bg-transparent text-primary-600 border-2 border-primary-600 hover:bg-primary-50 hover:border-primary-700 focus:ring-primary-500',
    ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
    danger: 'bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 text-white shadow-lg hover:shadow-2xl focus:ring-error-500 btn-hover',
    success: 'bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white shadow-lg hover:shadow-2xl focus:ring-success-500 btn-hover',
    warning: 'bg-gradient-to-r from-warning-600 to-warning-700 hover:from-warning-700 hover:to-warning-800 text-white shadow-lg hover:shadow-2xl focus:ring-warning-500 btn-hover',
    accent: 'bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white shadow-lg hover:shadow-2xl focus:ring-accent-500 btn-hover',
    glass: 'glass text-white border border-white/20 hover:bg-white/30 focus:ring-white/50',
    'glass-dark': 'glass-dark text-white border border-white/10 hover:bg-black/40 focus:ring-white/50',
  };
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${widthClass} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
} 