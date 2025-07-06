import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import useToastStore from '../store/useToastStore';

const toastStyles = {
  success: 'bg-success-600 text-white',
  error: 'bg-error-600 text-white',
  warning: 'bg-warning-600 text-white',
  info: 'bg-primary-600 text-white',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-3 w-80 max-w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl shadow-lg ring-1 ring-black/10 flex items-start overflow-hidden animate-slide-down ${toastStyles[toast.type] || toastStyles.info}`}
        >
          <div className="flex-shrink-0 p-3">
            {toast.type === 'success' && <CheckCircleIcon className="w-6 h-6" />}
            {toast.type === 'error' && <ExclamationCircleIcon className="w-6 h-6" />}
            {toast.type === 'warning' && <ExclamationTriangleIcon className="w-6 h-6" />}
            {toast.type === 'info' && <CheckCircleIcon className="w-6 h-6" />}
          </div>
          <div className="flex-1 p-3 pr-8 text-sm font-medium">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-2 right-2 text-white/80 hover:text-white p-1"
            aria-label="Close"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 