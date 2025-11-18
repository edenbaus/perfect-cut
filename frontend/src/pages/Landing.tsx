import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-2xl font-bold text-white">Perfect Cut</span>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="text-white hover:text-amber-400 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-amber-500 text-slate-900 px-6 py-2 rounded-lg hover:bg-amber-400 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="text-left">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Professional <span className="text-amber-400">Cutting Plans</span> for Woodworkers
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Transform your woodworking projects with intelligent optimization. Minimize waste, reduce cuts, and save time with Perfect Cut's advanced algorithms.
            </p>
            <div className="flex gap-4">
              <Link
                to="/register"
                className="bg-amber-500 text-slate-900 px-8 py-4 rounded-lg hover:bg-amber-400 font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Optimizing Free
              </Link>
              <Link
                to="/login"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg hover:bg-white/20 font-semibold text-lg border border-white/30 transition-all"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-8 flex gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free forever
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 rounded-2xl blur-3xl"></div>
            <img
              src="https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1200&auto=format&fit=crop"
              alt="Circular saw cutting plywood sheet"
              className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover border-4 border-white/10"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Why Choose Perfect Cut?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20 hover:border-amber-400/50 transition-all hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                Minimize Waste
              </h3>
              <p className="text-slate-300 text-lg">
                Advanced bin-packing algorithms optimize material usage, saving you money on every project.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20 hover:border-amber-400/50 transition-all hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                Fewer Cuts
              </h3>
              <p className="text-slate-300 text-lg">
                Smart cutting sequences combine adjacent cuts, reducing setup time and blade wear.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white/20 hover:border-amber-400/50 transition-all hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                Grain Matching
              </h3>
              <p className="text-slate-300 text-lg">
                Maintain professional-quality grain direction across all your pieces for polished results.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            How It Works
          </h2>
          <div className="bg-white/10 backdrop-blur-sm p-10 rounded-xl shadow-xl border border-white/20">
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-xl text-white mb-2">Input Your Materials</h4>
                  <p className="text-slate-300 text-lg">
                    Enter sheet dimensions and the pieces you need. Support for imperial and metric units.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-xl text-white mb-2">Choose Optimization Mode</h4>
                  <p className="text-slate-300 text-lg">
                    Select from multiple strategies: minimize waste, reduce cuts, optimize for grain direction, or balanced approach.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-xl text-white mb-2">Get Your Cutting Plan</h4>
                  <p className="text-slate-300 text-lg">
                    View interactive visual layouts with numbered cut sequences and detailed step-by-step instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-amber-500 to-amber-600 p-12 rounded-2xl shadow-2xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Ready to Optimize Your Workflow?
          </h2>
          <p className="text-xl text-slate-800 mb-8 max-w-2xl mx-auto">
            Join woodworkers who are saving time and materials with intelligent cutting plans.
          </p>
          <Link
            to="/register"
            className="inline-block bg-slate-900 text-white px-10 py-4 rounded-lg hover:bg-slate-800 font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  )
}
