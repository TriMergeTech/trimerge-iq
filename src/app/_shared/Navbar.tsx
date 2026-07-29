"use client";

import { useRouter, usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    let tok = localStorage.getItem("trimerge_admin_access_token");
    setIsAdminAuthenticated(Boolean(tok));
  }, []);

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

        {isAdminAuthenticated ? (
          <>
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
          </>
        ) : (
          <button
            type="button"
            className={active("/signin")}
            onClick={() => router.push("/signin")}
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
            <span className={styles.labelText}>Sign-in</span>
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
        )}
      </nav>
    </header>
  );
}

// f3818c7f6db7da7feef4aa0219a5f7f74c9617939cc055593631cab1f99070fc14dfc4f8734e0bfda6e9ea6009f9976e
