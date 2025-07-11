import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  FireIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';

import useToastStore from '../store/useToastStore';

const toastTypeStyles = {
  success: {
    icon: () => <CheckCircleIcon className="w-5 h-5" />,
    gradient: 'from-green-400 to-green-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-green-800',
  },
  error: {
    icon: () => <ExclamationCircleIcon className="w-5 h-5" />,
    gradient: 'from-red-400 to-red-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-red-800',
  },
  warning: {
    icon: () => <ExclamationTriangleIcon className="w-5 h-5" />,
    gradient: 'from-yellow-400 to-yellow-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-yellow-800',
  },
  info: {
    icon: () => <InformationCircleIcon className="w-5 h-5" />,
    gradient: 'from-blue-400 to-blue-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-blue-800',
  },
  'swap-success': {
    icon: () => <SparklesIcon className="w-5 h-5" />,
    gradient: 'from-sky-400 to-blue-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-blue-900',
  },
  'swap-error': {
    icon: () => <ExclamationCircleIcon className="w-5 h-5" />,
    gradient: 'from-indigo-400 to-indigo-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-indigo-800',
  },
  'swap-warning': {
    icon: () => <FireIcon className="w-5 h-5" />,
    gradient: 'from-orange-400 to-yellow-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-yellow-800',
  },
  'skill-success': {
    icon: () => <CheckCircleIcon className="w-5 h-5" />,
    gradient: 'from-emerald-400 to-green-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-emerald-800',
  },
  'skill-error': {
    icon: () => <ExclamationCircleIcon className="w-5 h-5" />,
    gradient: 'from-rose-400 to-red-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-rose-800',
  },
  'skill-warning': {
    icon: () => <ExclamationTriangleIcon className="w-5 h-5" />,
    gradient: 'from-yellow-300 to-yellow-600',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-yellow-800',
  },
  'profile-success': {
    icon: () => <UserCircleIcon className="w-5 h-5" />,
    gradient: 'from-purple-400 to-purple-700',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-purple-800',
  },
  'profile-error': {
    icon: () => <ExclamationCircleIcon className="w-5 h-5" />,
    gradient: 'from-rose-400 to-rose-700',
    bg: 'bg-white/60 backdrop-blur-md',
    text: 'text-rose-800',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 left-6 z-[1000] space-y-4 w-full max-w-sm">
      {toasts.map((toast) => {
        const style = toastTypeStyles[toast.type] || toastTypeStyles.info;
        return (
          <div
            key={toast.id}
            className={`relative flex items-center gap-4 px-5 py-4 rounded-xl shadow-lg border border-white/20 ${style.bg} animate-slide-up`}
          >
            {/* Icon Badge */}
            <div className={`bg-gradient-to-br ${style.gradient} rounded-full p-2 shadow-md`}>
              <div className="bg-white p-1 rounded-full">
                {style.icon()} {/* <-- Function call for fresh JSX */}
              </div>
            </div>

            {/* Message */}
            <div className={`flex-1 text-sm leading-tight font-medium ${style.text}`}>
              {toast.message}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 bg-white/30 backdrop-blur-sm hover:bg-white/60 p-1 rounded-full transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
              aria-label="Close"
            >
              <XMarkIcon className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
