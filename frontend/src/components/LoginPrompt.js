import Link from 'next/link';
import {
  UserCircleIcon,
  HomeIcon,
  ArrowRightIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

export default function LoginPrompt({ title = "Login Required", message = "Please log in to access this feature." }) {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 mx-auto animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
            <LockClosedIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-3">{title}</h2>
          <p className="text-secondary-600 leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 text-lg"
          >
            <UserCircleIcon className="w-5 h-5" />
            Login to Continue
            <ArrowRightIcon className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium py-3 px-6 rounded-full transition-all duration-200 border border-secondary-300 text-lg"
          >
            <HomeIcon className="w-5 h-5" />
            Go to Home
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-500">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
    </div>
  );
} 