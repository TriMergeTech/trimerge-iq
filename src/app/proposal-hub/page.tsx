"use client";

import { useRouter } from "next/navigation";
import styles from "../components/HomePage.module.css";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className={styles.homeRoot}>
      <Navbar />

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
