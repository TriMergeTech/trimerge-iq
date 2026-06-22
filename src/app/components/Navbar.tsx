"use client";

import { useRouter, usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const active = (path: string) =>
    `${styles.navBtn}${pathname === path ? ` ${styles.primary}` : ""}`;

  return (
    <header className={styles.nav}>
      <div className={styles.logo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/trimerge-iq-logo.png"
          alt="TriMerge IQ"
          className={styles.logoImage}
        />
      </div>

      <nav className={styles.navLinks}>
        <button
          type="button"
          className={active("/")}
          onClick={() => router.push("/")}
        >
          Home
        </button>
        <button
          type="button"
          className={active("/search")}
          onClick={() => router.push("/search")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className={styles.labelText}>Search</span>
          <svg
            className={styles.caret}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m2 4 4 4 4-4" />
          </svg>
        </button>
        <button
          type="button"
          className={active("/admin")}
          onClick={() => router.push("/admin")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
          <span className={styles.labelText}>Admin</span>
          <svg
            className={styles.caret}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m2 4 4 4 4-4" />
          </svg>
        </button>
        <button
          type="button"
          className={active("/chat")}
          onClick={() => router.push("/chat")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1.1 4.1A8 8 0 0 1 21 12Z" />
          </svg>
          <span className={styles.labelText}>Chat</span>
        </button>

        <button
          type="button"
          className={active("/proposal-hub")}
          onClick={() => router.push("/proposal-hub")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1.1 4.1A8 8 0 0 1 21 12Z" />
          </svg>
          <span className={styles.labelText}>Proposal Hub</span>
        </button>
      </nav>
    </header>
  );
}
