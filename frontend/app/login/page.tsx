'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('formflow_auth', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-page-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
            <div className="grid grid-cols-2 gap-1.5 w-6 h-6">
              <div className="bg-card-bg rounded-[2px]"></div>
              <div className="bg-card-bg rounded-[2px] opacity-70"></div>
              <div className="bg-card-bg rounded-[2px] opacity-40"></div>
              <div className="bg-card-bg rounded-[2px] opacity-90"></div>
            </div>
          </Link>
        </div>
        
        <h2 className="text-center text-3xl font-bold tracking-tight text-text-primary mb-2">
          Welcome back
        </h2>
        <p className="text-center text-sm text-text-secondary mb-8">
          Log in to continue building better forms.
        </p>

        <div className="bg-card-bg py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border-soft">
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-2.5 px-4 border border-border-strong rounded-lg shadow-sm bg-card-bg text-sm font-medium text-text-primary hover:bg-card-elevated transition-colors"
            >
              Continue with Google
            </button>
            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-2.5 px-4 border border-border-strong rounded-lg shadow-sm bg-card-bg text-sm font-medium text-text-primary hover:bg-card-elevated transition-colors"
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

          <form className="space-y-6" onSubmit={handleLogin}>
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
                  defaultValue="demo@formflow.com"
                  placeholder="you@example.com"
                  className="appearance-none block w-full px-3 py-2.5 border border-border-strong rounded-lg shadow-sm bg-input-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
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
                  autoComplete="current-password"
                  required
                  defaultValue="password"
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2.5 border border-border-strong rounded-lg shadow-sm bg-input-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-hover">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
              >
                Log in
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-8 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
