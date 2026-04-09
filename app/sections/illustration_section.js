// Illustration Section
function IllustrationSection() {
  return (
    <section className="w-full pt-2 pb-8 px-6 bg-[#EEF2F8]">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 rounded-2xl p-8 md:p-10 flex items-center justify-center min-h-80 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 right-8 w-16 h-16 bg-blue-300 rounded-lg opacity-20"></div>
          <div className="absolute bottom-8 left-12 w-12 h-12 bg-blue-400 rounded-full opacity-20"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-5 w-full relative z-10">
            {/* Illustration placeholder */}
            <div className="flex-1 flex justify-center">
              <svg
                className="w-full max-w-xs h-auto"
                viewBox="0 0 300 280"
                fill="none"
              >
                {/* Person */}
                <circle cx="80" cy="60" r="18" fill="#1F2937" />
                <path
                  d="M80 80C75 85 60 90 55 95"
                  stroke="#EA580C"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <rect
                  x="55"
                  y="95"
                  width="50"
                  height="60"
                  fill="#EA580C"
                  rx="4"
                />
                <path
                  d="M55 110L40 130"
                  stroke="#1F2937"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M105 110L125 135"
                  stroke="#1F2937"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {/* Computer */}
                <rect
                  x="140"
                  y="50"
                  width="140"
                  height="100"
                  rx="4"
                  fill="#E5E7EB"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                <rect x="145" y="55" width="130" height="85" fill="#1F2937" />

                {/* Chat bubbles on screen */}
                <rect
                  x="155"
                  y="65"
                  width="90"
                  height="20"
                  rx="4"
                  fill="#3B82F6"
                />
                <line
                  x1="160"
                  y1="70"
                  x2="165"
                  y2="78"
                  strokeWidth="1"
                  stroke="#BFDBFE"
                />
                <line
                  x1="170"
                  y1="70"
                  x2="175"
                  y2="78"
                  strokeWidth="1"
                  stroke="#BFDBFE"
                />

                <rect
                  x="160"
                  y="90"
                  width="85"
                  height="18"
                  rx="3"
                  fill="#60A5FA"
                />
                <line
                  x1="166"
                  y1="95"
                  x2="170"
                  y2="101"
                  strokeWidth="1"
                  stroke="#DBEAFE"
                />
                <line
                  x1="178"
                  y1="95"
                  x2="182"
                  y2="101"
                  strokeWidth="1"
                  stroke="#DBEAFE"
                />

                {/* Monitor stand */}
                <rect x="210" y="150" width="20" height="30" fill="#3B82F6" />
                <rect x="200" y="178" width="40" height="8" fill="#3B82F6" />

                {/* Floating documents */}
                <rect
                  x="200"
                  y="130"
                  width="35"
                  height="45"
                  rx="2"
                  fill="#DBEAFE"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  transform="rotate(-15 217.5 152.5)"
                />
                <line
                  x1="210"
                  y1="138"
                  x2="225"
                  y2="138"
                  stroke="#3B82F6"
                  strokeWidth="1"
                />
                <line
                  x1="210"
                  y1="144"
                  x2="225"
                  y2="144"
                  stroke="#3B82F6"
                  strokeWidth="1"
                />

                {/* Plants */}
                <ellipse
                  cx="40"
                  cy="180"
                  rx="20"
                  ry="30"
                  fill="#10B981"
                  opacity="0.3"
                />
                <path
                  d="M30 180Q40 160 50 180"
                  stroke="#059669"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M35 175Q40 170 45 175"
                  stroke="#059669"
                  strokeWidth="1.5"
                  fill="none"
                />

                {/* Cup */}
                <rect
                  x="250"
                  y="160"
                  width="20"
                  height="25"
                  rx="2"
                  fill="#FBBF24"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                />
                <path
                  d="M270 168C275 168 275 172 270 172"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>

            {/* Text content */}
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                AI-Powered Knowledge at Your Fingertips
              </h3>
              <p className="text-slate-700 leading-relaxed mb-6">
                Organize, search, and leverage all your company's knowledge with
                intelligent AI assistance. Keep everything private, secure, and
                under your control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IllustrationSection;
