import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ArrowPathIcon, SparklesIcon, FireIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import useToastStore from '../store/useToastStore';

const toastTypeStyles = {
  // Auth toasts
  success: {
    border: 'border-l-4 border-success-600',
    iconBg: 'bg-success-100',
    iconColor: 'text-success-700',
    bg: 'bg-success-50',
    text: 'text-success-900',
    icon: <CheckCircleIcon className="w-7 h-7" />,
  },
  error: {
    border: 'border-l-4 border-error-600',
    iconBg: 'bg-error-100',
    iconColor: 'text-error-700',
    bg: 'bg-error-50',
    text: 'text-error-900',
    icon: <ExclamationCircleIcon className="w-7 h-7" />,
  },
  warning: {
    border: 'border-l-4 border-warning-500',
    iconBg: 'bg-warning-100',
    iconColor: 'text-warning-700',
    bg: 'bg-warning-50',
    text: 'text-warning-900',
    icon: <ExclamationTriangleIcon className="w-7 h-7" />,
  },
  info: {
    border: 'border-l-4 border-primary-500',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-700',
    bg: 'bg-primary-50',
    text: 'text-primary-900',
    icon: <InformationCircleIcon className="w-7 h-7" />,
  },
  // Swap toasts
  'swap-success': {
    border: 'border-l-4 border-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    icon: <SparklesIcon className="w-7 h-7" />,
  },
  'swap-error': {
    border: 'border-l-4 border-indigo-600',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    icon: <ExclamationCircleIcon className="w-7 h-7" />,
  },
  'swap-warning': {
    border: 'border-l-4 border-yellow-500',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    icon: <FireIcon className="w-7 h-7" />,
  },
  // Skill toasts
  'skill-success': {
    border: 'border-l-4 border-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    bg: 'bg-green-50',
    text: 'text-green-900',
    icon: <CheckCircleIcon className="w-7 h-7" />,
  },
  'skill-error': {
    border: 'border-l-4 border-red-600',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    bg: 'bg-red-50',
    text: 'text-red-900',
    icon: <ExclamationCircleIcon className="w-7 h-7" />,
  },
  'skill-warning': {
    border: 'border-l-4 border-yellow-600',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    icon: <ExclamationTriangleIcon className="w-7 h-7" />,
  },
  // Profile toasts
  'profile-success': {
    border: 'border-l-4 border-purple-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    icon: <UserCircleIcon className="w-7 h-7" />,
  },
  'profile-error': {
    border: 'border-l-4 border-rose-700',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    icon: <ExclamationCircleIcon className="w-7 h-7" />,
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[1000] space-y-4 w-96 max-w-full">
      {toasts.map((toast) => {
        const style = toastTypeStyles[toast.type] || toastTypeStyles.info;
        return (
          <div
            key={toast.id}
            className={`relative flex items-center gap-4 ${style.bg} shadow-2xl ${style.border} rounded-2xl px-5 py-4 ring-1 ring-black/10 animate-slide-down`}
            style={{ minHeight: '72px' }}
          >
            <div className={`flex items-center justify-center rounded-full ${style.iconBg} ${style.iconColor} w-10 h-10`}>
              {style.icon}
            </div>
            <div className={`flex-1 text-base font-semibold ${style.text} pr-10`}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-3 right-3 text-secondary-400 hover:text-secondary-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
} 