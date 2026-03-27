import Link from "next/link";

// Reusable Components

// Logo and Brand Header
function BrandHeader() {
  return (
    <header className="w-full pt-10 pb-8 px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
        {/* TriMerge Logo */}
        <div className="flex items-center gap-3">
          <svg className="w-12 h-12 md:w-14 md:h-14" viewBox="0 0 48 48" fill="none">
            {/* Shield shape with blue gradient */}
            <path d="M24 4L8 12V24C8 35 24 44 24 44C24 44 40 35 40 24V12L24 4Z" fill="url(#logoGrad)" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
            {/* Checkmark - light blue */}
            <path d="M16 24L22 30L32 18" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="text-4xl md:text-[3.25rem] font-bold text-slate-900 leading-none tracking-tight">
            TriMerge <span className="text-blue-600">IQ</span>
          </span>
        </div>
        <div className="h-px w-full max-w-md bg-slate-200 mt-1"></div>
        <p className="text-xl md:text-[2rem] text-slate-700 font-medium">In-House AI Knowledge Tool</p>
      </div>
    </header>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="w-full py-10 px-6 bg-[#EEF2F8]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl md:text-[2.7rem] font-bold text-slate-900 tracking-tight">
          Private & Secure AI Assistant for TriMerge
        </h2>
      </div>
    </section>
  );
}

// Feature Card Component with Icon
function FeatureCard({ icon: IconComponent, title, description }) {
  return (
    <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_14px_rgba(37,99,235,0.10)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.14)] transition-shadow">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <IconComponent />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl leading-tight font-semibold text-slate-900 mb-2">{title}</h3>
          <p className="text-lg text-slate-600 leading-snug">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function ShieldIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
      <path d="M32 8L12 16V32C12 48 32 56 32 56C32 56 52 48 52 32V16L32 8Z" fill="#E0E7FF" />
      <path d="M32 8L12 16V32C12 48 32 56 32 56C32 56 52 48 52 32V16L32 8Z" stroke="#3B82F6" strokeWidth="2" />
      <path d="M26 32L30 36L38 28" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="44" cy="20" r="6" fill="#60A5FA" />
    </svg>
  );
}

function DocumentChatIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
      <rect x="12" y="16" width="28" height="40" rx="2" fill="#E0E7FF" stroke="#3B82F6" strokeWidth="2" />
      <line x1="16" y1="24" x2="36" y2="24" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="16" y1="30" x2="36" y2="30" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="16" y1="36" x2="32" y2="36" stroke="#3B82F6" strokeWidth="1.5" />
      <path d="M36 44C36 44 44 42 48 38C52 34 50 28 44 28" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="42" cy="32" r="2" fill="#BFDBFE" />
      <circle cx="48" cy="34" r="2" fill="#BFDBFE" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
      <rect x="16" y="20" width="24" height="28" rx="3" fill="#E0E7FF" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="22" cy="28" r="1.5" fill="#3B82F6" />
      <circle cx="28" cy="28" r="1.5" fill="#3B82F6" />
      <circle cx="34" cy="28" r="1.5" fill="#3B82F6" />
      <path d="M20 38L16 44H28" fill="#E0E7FF" stroke="#3B82F6" strokeWidth="2" />
      <path d="M42 32C42 26 46 22 52 22C56 22 58 24 58 28C58 34 54 36 50 38" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="48" cy="28" r="1" fill="#BFDBFE" />
    </svg>
  );
}

function DocumentPenIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
      <rect x="16" y="16" width="28" height="36" rx="2" fill="#E0E7FF" stroke="#3B82F6" strokeWidth="2" />
      <line x1="20" y1="24" x2="40" y2="24" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="20" y1="30" x2="40" y2="30" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="20" y1="36" x2="36" y2="36" stroke="#3B82F6" strokeWidth="1.5" />
      <path d="M40 44L44 40L52 32C53 31 54 31 55 32L51 40L48 48Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" />
    </svg>
  );
}

// Features Grid Section
function FeaturesSection() {
  const features = [
    {
      icon: ShieldIcon,
      title: "Confidential & In-House AI",
      description: "Your data never leaves TriMerge"
    },
    {
      icon: DocumentChatIcon,
      title: "Knowledge Search",
      description: "Find any document or policy"
    },
    {
      icon: ChatBubbleIcon,
      title: "Process Q&A",
      description: "Ask about procedures & clients"
    },
    {
      icon: DocumentPenIcon,
      title: "Content Drafting",
      description: "Generate proposals & reports"
    }
  ];

  return (
    <section className="w-full py-8 px-6 bg-[#EEF2F8]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

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
              <svg className="w-full max-w-xs h-auto" viewBox="0 0 300 280" fill="none">
                {/* Person */}
                <circle cx="80" cy="60" r="18" fill="#1F2937" />
                <path d="M80 80C75 85 60 90 55 95" stroke="#EA580C" strokeWidth="12" strokeLinecap="round" />
                <rect x="55" y="95" width="50" height="60" fill="#EA580C" rx="4" />
                <path d="M55 110L40 130" stroke="#1F2937" strokeWidth="10" strokeLinecap="round" />
                <path d="M105 110L125 135" stroke="#1F2937" strokeWidth="10" strokeLinecap="round" />
                
                {/* Computer */}
                <rect x="140" y="50" width="140" height="100" rx="4" fill="#E5E7EB" stroke="#3B82F6" strokeWidth="2" />
                <rect x="145" y="55" width="130" height="85" fill="#1F2937" />
                
                {/* Chat bubbles on screen */}
                <rect x="155" y="65" width="90" height="20" rx="4" fill="#3B82F6" />
                <line x1="160" y1="70" x2="165" y2="78" strokeWidth="1" stroke="#BFDBFE" />
                <line x1="170" y1="70" x2="175" y2="78" strokeWidth="1" stroke="#BFDBFE" />
                
                <rect x="160" y="90" width="85" height="18" rx="3" fill="#60A5FA" />
                <line x1="166" y1="95" x2="170" y2="101" strokeWidth="1" stroke="#DBEAFE" />
                <line x1="178" y1="95" x2="182" y2="101" strokeWidth="1" stroke="#DBEAFE" />
                
                {/* Monitor stand */}
                <rect x="210" y="150" width="20" height="30" fill="#3B82F6" />
                <rect x="200" y="178" width="40" height="8" fill="#3B82F6" />
                
                {/* Floating documents */}
                <rect x="200" y="130" width="35" height="45" rx="2" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" transform="rotate(-15 217.5 152.5)" />
                <line x1="210" y1="138" x2="225" y2="138" stroke="#3B82F6" strokeWidth="1" />
                <line x1="210" y1="144" x2="225" y2="144" stroke="#3B82F6" strokeWidth="1" />
                
                {/* Plants */}
                <ellipse cx="40" cy="180" rx="20" ry="30" fill="#10B981" opacity="0.3" />
                <path d="M30 180Q40 160 50 180" stroke="#059669" strokeWidth="2" fill="none" />
                <path d="M35 175Q40 170 45 175" stroke="#059669" strokeWidth="1.5" fill="none" />
                
                {/* Cup */}
                <rect x="250" y="160" width="20" height="25" rx="2" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
                <path d="M270 168C275 168 275 172 270 172" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            
            {/* Text content */}
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                AI-Powered Knowledge at Your Fingertips
              </h3>
              <p className="text-slate-700 leading-relaxed mb-6">
                Organize, search, and leverage all your company's knowledge with intelligent AI assistance. Keep everything private, secure, and under your control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section with Buttons
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
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="group min-w-[270px] px-8 py-3.5 bg-white text-slate-800 font-semibold text-lg rounded-xl border-2 border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            Log In
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Main Page Component
export default function Home() {
  return (
    <main className="w-full bg-white">
      <BrandHeader />
      <HeroSection />
      <FeaturesSection />
      <IllustrationSection />
      <CTASection />
    </main>
  );
}
