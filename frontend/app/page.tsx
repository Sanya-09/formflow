import Link from 'next/link';
import { ArrowRight, Sparkles, Layout, Zap, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFA]/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="bg-white rounded-sm"></div>
                <div className="bg-white rounded-sm opacity-70"></div>
                <div className="bg-white rounded-sm opacity-40"></div>
                <div className="bg-white rounded-sm opacity-90"></div>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">FormFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#" className="hover:text-gray-900 transition-colors">Product</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">Solutions</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">Templates</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-sm">
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8 border border-indigo-100">
            <Sparkles className="w-4 h-4" />
            <span>Meet the new FormFlow 2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-8">
            Forms that feel like <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">conversations.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
            Create beautiful, interactive forms that turn responses into meaningful insights. Keep your audience engaged with one question at a time.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto text-center text-lg font-semibold bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-1">
              Get started — it&apos;s free
            </Link>
            <Link href="#features" className="w-full sm:w-auto text-center text-lg font-medium text-gray-900 px-8 py-4 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
              Explore forms
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="flex-1 w-full max-w-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-50 rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden aspect-[4/3] flex flex-col relative z-0">
            <div className="h-1 bg-gray-100 w-full"><div className="h-full bg-indigo-600 w-1/3"></div></div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <span className="text-indigo-600 font-bold mb-4 flex items-center gap-2">
                1 <ArrowRight className="w-4 h-4" />
              </span>
              <h2 className="text-3xl font-medium text-gray-900 mb-8 leading-tight">
                What&apos;s your preferred method of contact?
              </h2>
              <div className="space-y-3 w-full max-w-md">
                {['Email', 'Phone', 'Carrier Pigeon'].map((opt, i) => (
                  <div key={opt} className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 ${i === 0 ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-white'}`}>
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border ${i === 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`text-lg ${i === 0 ? 'text-indigo-900 font-medium' : 'text-gray-600'}`}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Everything you need to build better forms</h2>
            <p className="text-xl text-gray-600">Stop fighting with clunky builders. Our intuitive interface makes creating complex forms a breeze.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-6 text-indigo-600">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Drag & Drop Builder</h3>
              <p className="text-gray-600 leading-relaxed">Visually arrange your questions. What you see is exactly what your respondents will see.</p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-6 text-indigo-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Preview</h3>
              <p className="text-gray-600 leading-relaxed">Instantly test your forms as you build them. Perfect the flow before you publish.</p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-6 text-indigo-600">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Built-in Validation</h3>
              <p className="text-gray-600 leading-relaxed">Ensure you get the right data with automatic email, number, and required field validation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-gray-900 text-white text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Ready to transform your forms?</h2>
        <Link href="/signup" className="inline-block text-lg font-semibold bg-white text-gray-900 px-8 py-4 rounded-full hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-xl">
          Get started for free
        </Link>
      </section>
    </div>
  );
}
