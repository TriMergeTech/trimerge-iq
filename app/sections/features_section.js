// Icon Components
function ShieldIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
      <path
        d="M32 8L12 16V32C12 48 32 56 32 56C32 56 52 48 52 32V16L32 8Z"
        fill="#E0E7FF"
      />
      <path
        d="M32 8L12 16V32C12 48 32 56 32 56C32 56 52 48 52 32V16L32 8Z"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <path
        d="M26 32L30 36L38 28"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="44" cy="20" r="6" fill="#60A5FA" />
    </svg>
  );
}

function DocumentChatIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
      <rect
        x="12"
        y="16"
        width="28"
        height="40"
        rx="2"
        fill="#E0E7FF"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <line
        x1="16"
        y1="24"
        x2="36"
        y2="24"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      <line
        x1="16"
        y1="30"
        x2="36"
        y2="30"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      <line
        x1="16"
        y1="36"
        x2="32"
        y2="36"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      <path
        d="M36 44C36 44 44 42 48 38C52 34 50 28 44 28"
        fill="#60A5FA"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <circle cx="42" cy="32" r="2" fill="#BFDBFE" />
      <circle cx="48" cy="34" r="2" fill="#BFDBFE" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
      <rect
        x="16"
        y="20"
        width="24"
        height="28"
        rx="3"
        fill="#E0E7FF"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <circle cx="22" cy="28" r="1.5" fill="#3B82F6" />
      <circle cx="28" cy="28" r="1.5" fill="#3B82F6" />
      <circle cx="34" cy="28" r="1.5" fill="#3B82F6" />
      <path
        d="M20 38L16 44H28"
        fill="#E0E7FF"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <path
        d="M42 32C42 26 46 22 52 22C56 22 58 24 58 28C58 34 54 36 50 38"
        fill="#60A5FA"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <circle cx="48" cy="28" r="1" fill="#BFDBFE" />
    </svg>
  );
}

function DocumentPenIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
      <rect
        x="16"
        y="16"
        width="28"
        height="36"
        rx="2"
        fill="#E0E7FF"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <line
        x1="20"
        y1="24"
        x2="40"
        y2="24"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      <line
        x1="20"
        y1="30"
        x2="40"
        y2="30"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      <line
        x1="20"
        y1="36"
        x2="36"
        y2="36"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      <path
        d="M40 44L44 40L52 32C53 31 54 31 55 32L51 40L48 48Z"
        fill="#60A5FA"
        stroke="#3B82F6"
        strokeWidth="2"
      />
    </svg>
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
          <h3 className="text-xl md:text-2xl leading-tight font-semibold text-slate-900 mb-2">
            {title}
          </h3>
          <p className="text-lg text-slate-600 leading-snug">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Features Grid Section
function FeaturesSection() {
  const features = [
    {
      icon: ShieldIcon,
      title: "Confidential & In-House AI",
      description: "Your data never leaves TriMerge",
    },
    {
      icon: DocumentChatIcon,
      title: "Knowledge Search",
      description: "Find any document or policy",
    },
    {
      icon: ChatBubbleIcon,
      title: "Process Q&A",
      description: "Ask about procedures & clients",
    },
    {
      icon: DocumentPenIcon,
      title: "Content Drafting",
      description: "Generate proposals & reports",
    },
  ];

  return (
    <section className="w-full pt-16 pb-8 px-6 bg-[#EEF2F8]">
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

export default FeaturesSection;
