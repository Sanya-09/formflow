'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Signup() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('formflow_auth', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FBFBFA]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
            <div className="grid grid-cols-2 gap-1.5 w-6 h-6">
              <div className="bg-card-bg rounded-[2px]"></div>
              <div className="bg-card-bg rounded-[2px] opacity-70"></div>
              <div className="bg-card-bg rounded-[2px] opacity-40"></div>
              <div className="bg-card-bg rounded-[2px] opacity-90"></div>
            </div>
          </Link>
        </div>
        
        <h2 className="text-center text-3xl font-bold tracking-tight text-text-primary mb-2">
          Create your account
        </h2>
        <p className="text-center text-sm text-text-secondary mb-8">
          Start building forms that feel like conversations.
        </p>

        <div className="bg-card-bg py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border-soft">
          <div className="space-y-4">
            <button
              onClick={handleSignup}
              className="w-full flex justify-center py-2.5 px-4 border border-border-strong rounded-lg shadow-sm bg-card-bg text-sm font-medium text-text-secondary hover:bg-card-elevated transition-colors"
            >
              Continue with Google
            </button>
            <button
              onClick={handleSignup}
              className="w-full flex justify-center py-2.5 px-4 border border-border-strong rounded-lg shadow-sm bg-card-bg text-sm font-medium text-text-secondary hover:bg-card-elevated transition-colors"
            >
              Continue with Microsoft
            </button>
          </div>

          <div className="mt-8 mb-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border-soft" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-card-bg text-text-muted uppercase tracking-widest text-[10px] font-bold">Or</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2.5 border border-border-strong rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2.5 border border-border-strong rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2.5 border border-border-strong rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-border-strong rounded cursor-pointer"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="terms" className="text-text-muted">
                  I agree to the <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Terms of Service</a> and <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-text-primary hover:bg-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
