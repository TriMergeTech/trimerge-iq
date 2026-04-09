"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import BrandHeader from "./sections/brandng_section";
import HeroSection from "./sections/hero_section";
import FeaturesSection from "./sections/features_section";
import IllustrationSection from "./sections/illustration_section";
import CTASection from "./sections/landing_cta";
import HomePage from "./home";

export default function Home() {
  const pathname = usePathname(); // 🔥 key trigger

  const [isAuth, setIsAuth] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuth(!!token);
    setReady(true);
    try {
      // eslint-disable-next-line no-console
      console.debug("[home] pathname", pathname, "token", token);
    } catch (e) {}

    function onStorage(e) {
      if (e.key === "token") {
        const t = localStorage.getItem("token");
        setIsAuth(!!t);
        try {
          // eslint-disable-next-line no-console
          console.debug("[home][storage] token changed", t);
        } catch (err) {}
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname]); // 🔥 re-run on every navigation

  // Prevent flicker ONLY on first render
  if (!ready) {
    return null;
  }

  if (isAuth) {
    return <HomePage />;
  }

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
