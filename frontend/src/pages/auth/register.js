import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useUserStore from '../../store/useUserStore';
import useToastStore from '../../store/useToastStore';

export default function Register() {
  const { signup, loading, error } = useUserStore();
  const { addToast } = useToastStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const success = await signup(form);
    if (success) {
      // Redirect to profile page as requested
      window.location.href = '/profile/edit';
    }
  };

  const handleGoogle = () => {
    window.location.href = (process.env.NEXT_PUBLIC_API_URL || '') + '/api/auth/google';
  };

  useEffect(() => {
    if (error) {
      addToast({ message: error, type: 'error' });
    }
  }, [error]);

  return (
    <>
      <Head>
        <title>Create Account - SkillSwap</title>
        <meta name="description" content="Join SkillSwap and start exchanging skills with professionals" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-700">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-secondary-900">Join SkillSwap</h2>
              <p className="text-secondary-600 mt-2">Create your account and start exchanging skills</p>
            </div>
          </div>

          <Card variant="elevated" className="space-y-6 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                icon={UserIcon}
                placeholder="Enter your full name"
                required
                size="lg"
                fullWidth
              />
              
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                icon={EnvelopeIcon}
                placeholder="Enter your email"
                required
                size="lg"
                fullWidth
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="block w-full pl-10 pr-10 py-4 text-secondary-900 placeholder-secondary-500 bg-white/80 backdrop-blur-sm border border-secondary-300/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 input-focus shadow-sm"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-secondary-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-secondary-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-secondary-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-secondary-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              {error && (
                <div className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-lg p-3 animate-slide-up">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-error-500 rounded-full mr-2"></div>
                    {error}
                  </div>
                </div>
              )}

              <Button type="submit" loading={loading} fullWidth size="lg">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-secondary-500">Or continue with</span>
              </div>
            </div>

            <Button 
              onClick={handleGoogle} 
              variant="secondary" 
              fullWidth
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </Card>

          <div className="text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <a href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 