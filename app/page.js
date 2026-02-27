import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4 bg-[#30638E] shadow-md">
        <Link href="/" className="text-white text-xl font-bold tracking-tight">
          CommutePro
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <a href="#how-it-works" className="text-white/80 hover:text-white text-sm font-medium transition hidden sm:block">
            How it Works
          </a>
          <Link href="/login">
            <button className="px-4 py-2 rounded-lg bg-[#EDAE49] hover:bg-[#EDAE49]/90 text-zinc-900 font-semibold text-sm transition shadow-sm">
              Login / Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16">
        <Image
          src="/bg.png"
          alt="city background"
          fill
          className="object-cover brightness-[0.35]"
          priority
        />

        <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 max-w-3xl mx-auto">
          <span className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/20 backdrop-blur-sm">
            Your smart commute companion
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            Commute<span style={{ color: "#EDAE49" }}>Pro</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-md">
            Stop guessing. Start commuting smarter with AI-powered insights built around your journey.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 mt-2">
            <Link href="/register">
              <button className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#EDAE49] hover:bg-[#EDAE49]/90 text-zinc-900 font-semibold text-sm transition shadow-lg">
                Get Started Free
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition">
                How it Works
              </button>
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/40">
          <span className="text-xs">Scroll to learn more</span>
          <div className="w-px h-8 bg-white/20" />
        </div>
      </section>

      {/* ── Problem + How It Works ── */}
      <section id="how-it-works" className="bg-white py-16 sm:py-20 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00798C]">The Problem</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Traffic: A Commuter's Nightmare
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-16 items-start">

            {/* Problem card */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: "#D1495B20" }}>
                🚦
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900">Unpredictable Delays</h3>
              <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">
                Commuting in large cities in the Philippines can be a battle against the unknown. People rely on guesses to plan departure times, resulting in unpredictable delays and hours wasted. The absence of reliable insights makes commuting a drain on both productivity and mental health.
              </p>
            </div>

            {/* How it works card */}
            <div className="space-y-4 sm:space-y-5">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#00798C]">The Solution</span>
                <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 mt-1">How CommutePro Works</h3>
              </div>

              {[
                { step: "01", color: "#30638E", title: "Real-Time Logging",    desc: "Start your commute and let the app track your journey with high-precision GPS to record actual travel times." },
                { step: "02", color: "#00798C", title: "Data Archiving",       desc: "Each commute is saved to your history, building a personalized database based on your unique behavior." },
                { step: "03", color: "#EDAE49", title: "Pattern Recognition",  desc: "Your data is compared with community trends to identify congestion hotspots and peak bottlenecks." },
                { step: "04", color: "#D1495B", title: "AI Smart Suggestions", desc: "Get personalized recommendations on when to leave to minimize travel time and reduce stress." },
              ].map(({ step, color, title, desc }) => (
                <div key={step} className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 text-white mt-0.5"
                    style={{ backgroundColor: color }}
                  >
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{title}</p>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28 bg-gray-50 gap-5 sm:gap-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#00798C]">Get Started</span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 max-w-xl leading-tight">
          Ready to become a commuter pro?
        </h2>
        <p className="text-sm sm:text-base text-zinc-500 max-w-sm">
          Join now and start making sense of your daily commute with data that's actually yours.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-2">
          <Link href="/register">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#30638E] hover:bg-[#00798C] text-white font-semibold text-sm transition shadow-md">
              Create Free Account
            </button>
          </Link>
          <Link href="/login">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-[#30638E] text-[#30638E] hover:bg-[#30638E] hover:text-white font-semibold text-sm transition">
              Sign In
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-zinc-900 text-zinc-500 text-xs text-center py-5 px-4">
        © {new Date().getFullYear()} CommutePro · By Franz Orcasitas for IT103 Project
      </footer>

    </div>
  );
}