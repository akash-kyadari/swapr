import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Input({ 
  label, 
  error, 
  success,
  className = '', 
  icon: Icon,
  helperText,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  ...props 
}) {
  const base = 'block text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 bg-white/80 dark:bg-secondary-700/50 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 input-focus shadow-sm';
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };
  
  const variants = {
    default: 'border-secondary-300/60 focus:ring-primary-500/20 focus:border-primary-500',
    error: 'border-error-300 focus:ring-error-500/20 focus:border-error-500',
    success: 'border-success-300 focus:ring-success-500/20 focus:border-success-500',
    warning: 'border-warning-300 focus:ring-warning-500/20 focus:border-warning-500',
  };
  
  const getVariant = () => {
    if (error) return variants.error;
    if (success) return variants.success;
    return variants[variant];
  };
  
  const getIconColor = () => {
    if (error) return 'text-error-500';
    if (success) return 'text-success-500';
    return 'text-secondary-400';
  };
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`space-y-2 ${widthClass}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${getIconColor()}`} />
          </div>
        )}
        <input
          className={`
            ${base} ${sizes[size]} ${getVariant()}
            ${Icon ? 'pl-12' : ''}
            ${error || success ? 'pr-10' : ''}
            ${className}
            ${widthClass}
          `}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-error-500" />
          </div>
        )}
        {success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircleIcon className="h-5 w-5 text-success-500" />
          </div>
        )}
      </div>
      {(error || success || helperText) && (
        <div className="flex items-start space-x-1">
          {error && <ExclamationCircleIcon className="h-4 w-4 text-error-500 mt-0.5 flex-shrink-0" />}
          {success && <CheckCircleIcon className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />}
          <p className={`text-sm ${error ? 'text-error-600' : success ? 'text-success-600' : 'text-secondary-500'}`}>
            {error || success || helperText}
          </p>
        </div>
      )}
    </div>
  );
} 