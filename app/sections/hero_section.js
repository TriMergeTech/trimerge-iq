import Link from "next/link";

// Hero Section
function HeroSection() {
  return (
    <section className="w-full pt-16 pb-16 px-6 bg-[#EEF2F8]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="mx-auto max-w-[700px] text-4xl sm:text-5xl md:text-[3rem] font-bold text-slate-900 tracking-tight leading-tight">
          Private & Secure AI Assistant for TriMerge
        </h2>
        <p className="mt-5 text-lg text-slate-600 md:text-xl">
          Access your company's knowledge instantly with AI
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link
            href="/signup?redirect=admin"
            className="group min-w-[220px] px-12 py-[14px] h-[52px] bg-blue-600 text-white font-semibold text-[1.125rem] rounded-2xl hover:bg-blue-700 transition-all shadow-[0_10px_24px_rgba(37,99,235,0.30)] flex items-center justify-center gap-2"
          >
            Sign Up
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          <Link
            href="/login?redirect=admin"
            className="group min-w-[220px] px-12 py-[14px] h-[52px] bg-white text-slate-800 font-semibold text-[1.125rem] rounded-2xl border-2 border-blue-300 hover:bg-blue-50 transition-all shadow-[0_8px_20px_rgba(15,23,42,0.07)] flex items-center justify-center gap-2"
          >
            Log In
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
