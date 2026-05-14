"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import styles from "./HomePage.module.css";

const services = [
  {
    title: "Knowledge Reliability Engine",
    description:
      "Continuously validate institutional knowledge, flag drift, and keep critical answers accurate across teams.",
    variant: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20H2" />
      </svg>
    ),
  },
  {
    title: "Workflow Intelligence Enablement",
    description:
      "Embed context-aware intelligence into daily workflows so teams can act faster without losing precision.",
    variant: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Governance & Risk Controls",
    description:
      "Apply policy-aware guardrails, role-based access, and auditable decision trails for enterprise confidence.",
    variant: "lilac",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z" />
      </svg>
    ),
  },
] as const;

const stats = [
  {
    value: "42%",
    label: "Faster Decision Cycles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.2" />
        <circle cx="17" cy="9" r="2.6" />
        <path d="M3 19c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
        <path d="M14 19c0-2.4 1.7-4.4 4-5" />
      </svg>
    ),
  },
  {
    value: "99.2%",
    label: "Answer Confidence",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="m12 3 2.7 5.7 6.3.9-4.5 4.4 1 6.3L12 17.5 6.5 20.3l1-6.3-4.5-4.4 6.3-.9L12 3Z" />
      </svg>
    ),
  },
  {
    value: "3x",
    label: "Research Throughput",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M3 13h18" />
      </svg>
    ),
  },
  {
    value: "24/7",
    label: "AI-Assisted Coverage",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
];

type Dot = { x: number; y: number; opacity: number };

function createDotWave(options: {
  rows: number;
  cols: number;
  dx: number;
  dy: number;
  amp: number;
  freq: number;
  phase: number;
  opacity: number;
}): Dot[] {
  const dots: Dot[] = [];
  for (let r = 0; r < options.rows; r += 1) {
    for (let c = 0; c < options.cols; c += 1) {
      const x = c * options.dx;
      const y = r * options.dy + Math.sin((c / options.cols) * Math.PI * options.freq + options.phase) * options.amp;
      const opacity = options.opacity * (0.4 + 0.6 * (1 - r / options.rows));
      dots.push({ x, y, opacity });
    }
  }
  return dots;
}

function rng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

type StarShape = "shapeDot" | "shapeStreak" | "shapeSpark";
type StarTint = "" | "tintCyan" | "tintViolet";

type SkyStar = {
  left: string;
  duration: string;
  delay: string;
  shape: StarShape;
  tint: StarTint;
  height?: string;
  width?: string;
  opacity?: string;
};

type Twinkle = {
  left: string;
  top: string;
  delay: string;
  duration: string;
};

function createSky() {
  const rand = rng(1729);
  const twinkles: Twinkle[] = [];
  for (let i = 0; i < 36; i += 1) {
    twinkles.push({
      left: `${(rand() * 100).toFixed(2)}%`,
      top: `${(rand() * 100).toFixed(2)}%`,
      delay: `${(rand() * 4).toFixed(2)}s`,
      duration: `${(6 + rand() * 6).toFixed(2)}s`,
    });
  }

  const shapes: StarShape[] = ["shapeDot", "shapeDot", "shapeDot", "shapeStreak", "shapeSpark"];
  const tints: StarTint[] = ["", "", "tintCyan", "tintViolet"];
  const stars: SkyStar[] = [];
  for (let i = 0; i < 42; i += 1) {
    const shape = shapes[Math.floor(rand() * shapes.length)];
    const tint = tints[Math.floor(rand() * tints.length)];
    const duration = 10 + rand() * 10;
    const star: SkyStar = {
      left: `${(rand() * 100).toFixed(2)}%`,
      duration: `${duration.toFixed(2)}s`,
      delay: `${(-rand() * duration).toFixed(2)}s`,
      shape,
      tint,
    };

    if (shape === "shapeStreak") {
      star.height = `${(40 + rand() * 60).toFixed(2)}px`;
      star.opacity = "0.85";
    }

    if (shape === "shapeSpark") {
      const size = 6 + rand() * 10;
      star.width = `${size.toFixed(2)}px`;
      star.height = `${size.toFixed(2)}px`;
    }

    stars.push(star);
  }

  return { twinkles, stars };
}

export default function HomePage() {
  const router = useRouter();

  const leftWave = useMemo(
    () =>
      createDotWave({
        rows: 20,
        cols: 18,
        dx: 18,
        dy: 16,
        amp: 30,
        freq: 2,
        phase: 0,
        opacity: 0.9,
      }),
    [],
  );

  const rightWave = useMemo(
    () =>
      createDotWave({
        rows: 18,
        cols: 28,
        dx: 18,
        dy: 16,
        amp: 36,
        freq: 2.4,
        phase: 1,
        opacity: 0.9,
      }),
    [],
  );

  const ctaLeftWave = useMemo(
    () =>
      createDotWave({
        rows: 22,
        cols: 14,
        dx: 18,
        dy: 16,
        amp: 22,
        freq: 2,
        phase: 0.4,
        opacity: 0.7,
      }),
    [],
  );

  const ctaRightWave = useMemo(
    () =>
      createDotWave({
        rows: 22,
        cols: 14,
        dx: 18,
        dy: 16,
        amp: 22,
        freq: 2,
        phase: 2,
        opacity: 0.7,
      }),
    [],
  );

  const sky = useMemo(() => createSky(), []);

  return (
    <div className={styles.homeRoot}>
      <header className={styles.nav}>
        <div className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/trimerge-iq-logo.png" alt="TriMerge IQ" className={styles.logoImage} />
        </div>

        <nav className={styles.navLinks}>
          <button type="button" className={`${styles.navBtn} ${styles.primary}`} onClick={() => router.push("/")}>Home</button>
          <button type="button" className={styles.navBtn} onClick={() => router.push("/search")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className={styles.labelText}>Search</span>
            <svg className={styles.caret} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m2 4 4 4 4-4" />
            </svg>
          </button>
          <button type="button" className={styles.navBtn} onClick={() => router.push("/admin")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
            <span className={styles.labelText}>Admin</span>
            <svg className={styles.caret} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m2 4 4 4 4-4" />
            </svg>
          </button>
          <button type="button" className={styles.navBtn} onClick={() => router.push("/chat")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1.1 4.1A8 8 0 0 1 21 12Z" />
            </svg>
            <span className={styles.labelText}>Chat</span>
          </button>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.wave} aria-hidden="true">
          <svg className={styles.waveLeft} viewBox="0 0 380 380" fill="none">
            {leftWave.map((dot, index) => (
              <circle key={`left-${index}`} cx={dot.x} cy={dot.y} r="1.6" fill="#a78bfa" opacity={dot.opacity} />
            ))}
          </svg>
          <svg className={styles.waveRight} viewBox="0 0 520 380" fill="none">
            {rightWave.map((dot, index) => (
              <circle key={`right-${index}`} cx={dot.x} cy={dot.y} r="1.6" fill="#6b8eff" opacity={dot.opacity} />
            ))}
          </svg>
        </div>

        <div className={styles.sky} aria-hidden="true">
          {sky.twinkles.map((twinkle, index) => (
            <span
              key={`twinkle-${index}`}
              className={styles.twinkle}
              style={{
                left: twinkle.left,
                top: twinkle.top,
                animationDelay: twinkle.delay,
                animationDuration: twinkle.duration,
              }}
            />
          ))}
          {sky.stars.map((star, index) => (
            <span
              key={`star-${index}`}
              className={`${styles.star} ${styles[star.shape]} ${star.tint ? styles[star.tint] : ""}`}
              style={{
                left: star.left,
                animationDuration: star.duration,
                animationDelay: star.delay,
                height: star.height,
                width: star.width,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Strategic Consulting for
            <br />
            Modern <span className={styles.accent}>Business</span>
          </h1>
          <p className={styles.lede}>
            TriMergeIQ unifies your scattered knowledge into one governed intelligence layer so every team can move faster with dependable, permission-aware answers.
          </p>
          <div className={styles.ctaRow}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push("/search")}>Get Started</button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => router.push("/admin")}>Open Admin Workspace</button>
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2>What TriMergeIQ Delivers</h2>
            <p>Purpose-built capabilities for trustworthy, scalable AI operations.</p>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <article key={service.title} className={styles.serviceCard}>
                <div className={`${styles.iconTile} ${styles[service.variant]}`}>{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
          <div className={styles.servicesStatement}>
            <h3>TriMergeIQ governance powered by one, self-improving source of truth</h3>
            <p>
              Bring research, workflows, and enterprise knowledge into a single reliable system that continuously improves with every validated decision.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div>
                <div className={styles.statNum}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <svg className={`${styles.waveDeco} ${styles.left}`} viewBox="0 0 280 380" aria-hidden="true">
          {ctaLeftWave.map((dot, index) => (
            <circle key={`cta-left-${index}`} cx={dot.x} cy={dot.y} r="1.4" fill="#7c5cff" opacity={dot.opacity} />
          ))}
        </svg>
        <svg className={`${styles.waveDeco} ${styles.right}`} viewBox="0 0 280 380" aria-hidden="true">
          {ctaRightWave.map((dot, index) => (
            <circle key={`cta-right-${index}`} cx={dot.x} cy={dot.y} r="1.4" fill="#7c5cff" opacity={dot.opacity} />
          ))}
        </svg>

        <h2>Turn scattered knowledge into reliable execution.</h2>
        <p>See how TriMergeIQ helps your teams answer faster, govern better, and operate with confidence.</p>
        <div className={styles.ctaRowCentered}>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push("/chat")}>Start a Guided Demo</button>
          <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={() => router.push("/search")}>Browse Use Cases</button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>&copy; 2026 TriMergeIQ. All rights reserved.</div>
        <div className={styles.links}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}
