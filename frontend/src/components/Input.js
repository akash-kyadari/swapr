import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Input({ 
  label, 
  error, 
  success,
  className = '', 
  icon: Icon,
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          className={`
            block w-full px-4 py-3 text-slate-900 placeholder-slate-500
            bg-white/80 backdrop-blur-sm border border-slate-300/60 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200
            ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''}
            ${success ? 'border-green-300 focus:ring-green-500/20 focus:border-green-500' : ''}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
        {success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 flex items-center">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          {success}
        </p>
      )}
    </div>
  );
} 