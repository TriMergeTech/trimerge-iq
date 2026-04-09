// Logo and Brand Header
function BrandHeader() {
  return (
    <header className="w-full pt-10 pb-10 px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
        {/* TriMerge Logo */}
        <div className="flex items-center gap-3">
          <svg
            className="w-12 h-12 md:w-14 md:h-14"
            viewBox="0 0 48 48"
            fill="none"
          >
            {/* Shield shape with blue gradient */}
            <path
              d="M24 4L8 12V24C8 35 24 44 24 44C24 44 40 35 40 24V12L24 4Z"
              fill="url(#logoGrad)"
            />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
            {/* Checkmark - light blue */}
            <path
              d="M16 24L22 30L32 18"
              stroke="#93C5FD"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="text-4xl md:text-[3.25rem] font-bold text-slate-900 leading-none tracking-tight">
            TriMerge <span className="text-blue-600">IQ</span>
          </span>
        </div>
        <div className="h-px w-full max-w-md bg-slate-200 mt-1"></div>
        <p className="text-xl md:text-[2rem] text-slate-700 font-medium">
          In-House AI Knowledge Tool
        </p>
      </div>
    </header>
  );
}

export default BrandHeader;
