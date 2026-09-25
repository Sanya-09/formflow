'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, Bell, HelpCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simple mock auth check
    const isAuth = localStorage.getItem('formflow_auth');
    if (!isAuth) {
      router.push('/login');
    }
  }, [router]);

  const isBuilder = typeof window !== 'undefined' && window.location.pathname.includes('/edit');

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-page-bg font-sans flex flex-col">
      {/* Top Navigation */}
      {!isBuilder && (
        <header className="bg-card-bg border-b border-border-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-1 w-4 h-4">
                    <div className="bg-card-bg rounded-sm"></div>
                    <div className="bg-card-bg rounded-sm opacity-70"></div>
                    <div className="bg-card-bg rounded-sm opacity-40"></div>
                    <div className="bg-card-bg rounded-sm opacity-90"></div>
                  </div>
                </div>
                <span className="font-bold text-xl tracking-tight text-ink-dark">FormFlow</span>
              </Link>
              
              {/* Nav Links */}
              <nav className="hidden md:flex space-x-1">
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-ink-dark bg-purple-light">
                  Forms
                </Link>
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-ink-dark hover:bg-gray-50 transition-colors">
                  Responses
                </Link>
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-ink-dark hover:bg-gray-50 transition-colors">
                  Templates
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button className="text-text-secondary hover:text-ink-dark transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="text-text-secondary hover:text-ink-dark transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-purple-light flex items-center justify-center border border-purple-lavender cursor-pointer">
                <span className="text-sm font-medium text-primary-dark">DC</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full mx-auto ${isBuilder ? 'px-0 py-0 max-w-none' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8'}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
