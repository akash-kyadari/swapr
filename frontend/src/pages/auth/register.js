import { useState, useEffect } from "react";
import Head from "next/head";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import useUserStore from "../../store/useUserStore";
import useToastStore from "../../store/useToastStore";

export default function Register() {
  const { signup, loading, error } = useUserStore();
  const { addToast } = useToastStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(form);
    if (success) {
      window.location.href = "/profile/edit";
    }
  };

  const handleGoogle = () => {
    window.location.href =
      (process.env.NEXT_PUBLIC_API_URL || "") + "/api/auth/google";
  };

  useEffect(() => {
    if (error) {
      addToast({ message: error, type: "error" });
    }
  }, [error]);

  return (
    <>
      <Head>
        <title>Create Account - SkillSwap</title>
        <meta
          name="description"
          content="Join SkillSwap and start exchanging skills with professionals"
        />
      </Head>

      <div className="flex items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8 w-full md:w-[35rem]">
        <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-lg p-8 sm:p-10 md:p-10 transition-all">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-sm text-gray-500">
              Join SkillSwap and start exchanging skills
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition placeholder-gray-400 text-base"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition placeholder-gray-400 text-base"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className="block w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition placeholder-gray-400 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full py-3 px-6 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Login Redirect */}
          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-indigo-600 font-medium hover:text-indigo-700 transition"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
