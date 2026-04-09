import Link from "next/link";

function CTASection() {
  return (
    <section className="w-full pt-6 pb-20 px-6 bg-[#EEF2F8]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="group min-w-[270px] px-8 py-3.5 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition-all shadow-[0_6px_16px_rgba(37,99,235,0.28)] flex items-center justify-center gap-2"
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
            href="/login"
            className="group min-w-[270px] px-8 py-3.5 bg-white text-slate-800 font-semibold text-lg rounded-xl border-2 border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
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

export default CTASection;
