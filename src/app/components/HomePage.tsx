"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Monitor,
  ShieldCheck,
  Star,
  User,
  Users,
} from "lucide-react";
import Navbar from "./Navbar";

const services = [
  {
    title: "Strategy Consulting",
    description:
      "Transform your business with data-driven strategies and actionable insights.",
    Icon: BarChart3,
  },
  {
    title: "Digital Transformation",
    description:
      "Navigate the digital landscape with cutting-edge technology solutions.",
    Icon: Monitor,
  },
  {
    title: "Operational Excellence",
    description:
      "Optimize processes and maximize efficiency across your organization.",
    Icon: ShieldCheck,
  },
];

const stats = [
  { value: "500+", label: "Clients Served", Icon: Users },
  { value: "98%", label: "Client Satisfaction", Icon: Star },
  { value: "25+", label: "Years Experience", Icon: Briefcase },
  { value: "150+", label: "Expert Consultants", Icon: User },
];

const heroLeftDots = makeDotWave({
  rows: 20,
  cols: 18,
  dx: 18,
  dy: 16,
  amp: 30,
  freq: 2,
  phase: 0,
  opacity: 0.9,
  radius: 1.6,
});

const heroRightDots = makeDotWave({
  rows: 18,
  cols: 28,
  dx: 18,
  dy: 16,
  amp: 36,
  freq: 2.4,
  phase: 1,
  opacity: 0.9,
  radius: 1.6,
});

const ctaDots = makeDotWave({
  rows: 22,
  cols: 14,
  dx: 18,
  dy: 16,
  amp: 22,
  freq: 2,
  phase: 0.4,
  opacity: 0.7,
  radius: 1.4,
});

const ctaRightDots = makeDotWave({
  rows: 22,
  cols: 14,
  dx: 18,
  dy: 16,
  amp: 22,
  freq: 2,
  phase: 2,
  opacity: 0.7,
  radius: 1.4,
});

const stars = Array.from({ length: 70 }, (_, index) => {
  const shapes = ["shape-dot", "shape-dot", "shape-dot", "shape-streak", "shape-spark"];
  const tints = ["", "", "tint-cyan", "tint-violet"];
  const shape = shapes[index % shapes.length];
  const duration = 4 + ((index * 17) % 80) / 10;

  return {
    shape,
    tint: tints[(index * 7) % tints.length],
    left: `${(index * 37) % 100}%`,
    duration: `${duration}s`,
    delay: `${-((index * 13) % Math.max(duration, 1))}s`,
    height: shape === "shape-streak" ? `${40 + ((index * 19) % 60)}px` : undefined,
    size: shape === "shape-spark" ? `${6 + ((index * 11) % 10)}px` : undefined,
  };
});

const twinkles = Array.from({ length: 60 }, (_, index) => ({
  left: `${(index * 29) % 100}%`,
  top: `${(index * 47) % 100}%`,
  delay: `${((index * 11) % 30) / 10}s`,
  duration: `${2 + ((index * 5) % 30) / 10}s`,
}));

function makeDotWave({
  rows,
  cols,
  dx,
  dy,
  amp,
  freq,
  phase,
  opacity,
  radius,
}: {
  rows: number;
  cols: number;
  dx: number;
  dy: number;
  amp: number;
  freq: number;
  phase: number;
  opacity: number;
  radius: number;
}) {
  const dots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      dots.push({
        cx: col * dx,
        cy: row * dy + Math.sin((col / cols) * Math.PI * freq + phase) * amp,
        opacity: opacity * (0.4 + 0.6 * (1 - row / rows)),
        radius,
      });
    }
  }

  return dots;
}

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-display text-[#0f1430] page-shell">
      <Navbar />

      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,#131b6a_0%,transparent_60%),radial-gradient(ellipse_100%_80%_at_0%_0%,#1a1166_0%,transparent_55%),linear-gradient(180deg,#060a36_0%,#050829_100%)] px-6 py-24 text-center text-white md:py-28">
        <svg className="pointer-events-none absolute left-[-40px] top-28 hidden w-[380px] opacity-90 sm:block" viewBox="0 0 380 380" aria-hidden="true">
          {heroLeftDots.map((dot, index) => (
            <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.radius} fill="#a78bfa" opacity={dot.opacity} />
          ))}
        </svg>
        <svg className="pointer-events-none absolute bottom-10 right-[-40px] hidden w-[520px] opacity-90 md:block" viewBox="0 0 520 380" aria-hidden="true">
          {heroRightDots.map((dot, index) => (
            <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.radius} fill="#6b8eff" opacity={dot.opacity} />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {twinkles.map((twinkle, index) => (
            <span
              key={`twinkle-${index}`}
              className="twinkle"
              style={{
                left: twinkle.left,
                top: twinkle.top,
                animationDelay: twinkle.delay,
                animationDuration: twinkle.duration,
              }}
            />
          ))}
          {stars.map((star, index) => (
            <span
              key={`star-${index}`}
              className={`star ${star.shape} ${star.tint}`}
              style={{
                left: star.left,
                animationDuration: star.duration,
                animationDelay: star.delay,
                height: star.height,
                width: star.size,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-[920px]">
          <h1 className="mb-7 text-4xl font-bold leading-[1.08] tracking-normal sm:text-5xl lg:text-[62px]">
            Strategic Consulting for
            <br className="hidden sm:block" /> Modern{" "}
            <span className="bg-gradient-to-r from-[#7c5cff] via-[#4f7bff] to-[#2bc5ff] bg-clip-text text-transparent">
              Business
            </span>
          </h1>
          <p className="mx-auto mb-11 max-w-2xl font-sans text-[17px] leading-7 text-[#c8cdee]">
            TriMerge Consulting Group delivers comprehensive solutions that drive innovation,
            efficiency, and sustainable growth for organizations worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="interactive-button rounded-[10px] bg-[#2e2bff] px-9 py-4 text-[17px] font-semibold text-white shadow-[0_10px_30px_rgba(46,43,255,0.35)] hover:bg-[#2120e0]"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="interactive-button rounded-[10px] border border-white/60 px-9 py-4 text-[17px] font-semibold text-white hover:border-white hover:bg-white/10"
            >
              Admin Access
            </button>
          </div>
        </div>
      </section>

      <section className="page-section px-6 py-20 md:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-14 text-center">
            <h2 className="section-title mb-3 inline-block text-4xl font-bold tracking-normal text-[#0b1340]">
              Our Services
            </h2>
            <p className="font-sans text-base text-[#5b6079]">
              Tailored solutions to meet your organization&apos;s unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.Icon;

              return (
                <article
                  key={service.title}
                  className="card-lift rounded-2xl border border-[#e6e8f1] bg-white p-8 md:p-9"
                >
                  <div className="mb-6 grid h-14 w-14 place-items-center rounded-xl bg-[#efeaff] text-[#6b4eff]">
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <h3 className="mb-3 text-[21px] font-bold tracking-normal text-[#0b1340]">
                    {service.title}
                  </h3>
                  <p className="font-sans text-[14.5px] leading-6 text-[#5b6079]">
                    {service.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-section bg-gradient-to-b from-[#f4f4fc] to-[#ecedf8] px-6 py-14">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {stats.map((stat) => {
            const Icon = stat.Icon;

            return (
              <div key={stat.label} className="interactive-base flex items-center justify-center gap-5">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,#e9ecf6)] text-[#1f2858] shadow-[inset_0_0_0_1px_rgba(31,40,88,0.06)]">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="bg-gradient-to-r from-[#4f7bff] to-[#2bc5ff] bg-clip-text text-[32px] font-bold leading-none text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-sans text-[13.5px] text-[#5b6079]">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="page-section relative overflow-hidden px-6 py-24 text-center">
        <svg className="pointer-events-none absolute left-0 top-8 hidden w-[280px] opacity-50 md:block" viewBox="0 0 280 380" aria-hidden="true">
          {ctaDots.map((dot, index) => (
            <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.radius} fill="#7c5cff" opacity={dot.opacity} />
          ))}
        </svg>
        <svg className="pointer-events-none absolute bottom-8 right-0 hidden w-[280px] opacity-50 md:block" viewBox="0 0 280 380" aria-hidden="true">
          {ctaRightDots.map((dot, index) => (
            <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.radius} fill="#7c5cff" opacity={dot.opacity} />
          ))}
        </svg>

        <div className="relative z-10 mx-auto max-w-[760px]">
          <h2 className="mb-4 text-4xl font-bold tracking-normal text-[#0b1340]">
            Ready to Transform Your Business?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl font-sans text-base text-[#5b6079]">
            Let&apos;s discuss how TriMerge Consulting Group can help you achieve your
            strategic goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="interactive-button rounded-[10px] bg-[#2e2bff] px-9 py-4 text-[17px] font-semibold text-white shadow-[0_10px_30px_rgba(46,43,255,0.28)] hover:bg-[#2120e0]"
            >
              Schedule a Consultation
            </button>
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="interactive-button rounded-[10px] border border-[#2e2bff] bg-white px-9 py-4 text-[17px] font-semibold text-[#2e2bff] hover:bg-[#f1f1ff]"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <footer className="page-section bg-[#050828] px-6 py-7 font-sans text-sm text-[#c0c5e2] sm:px-14">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p>&copy; 2026 TriMerge Consulting Group. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-5 md:gap-9">
            <a href="#" className="interactive-base hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="interactive-base hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="interactive-base hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
