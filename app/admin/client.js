"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPage from "../pages/AdminPage";
import Navbar from "../components/Navbar";

export default function AdminRoute({ searchParams }) {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logged_profile, setProfile] = useState(null);
  // Compute auth synchronously from localStorage on every render. Because
  // this file is marked `"use client"`, reading `localStorage` here is safe

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedProfile = localStorage.getItem("profile");

    if (!token) {
      router.push("/login?redirect=admin");
      return;
    }

    setIsAuthenticated(true);

    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);

        if (parsed.profile !== "52a1d68b-87d6-4adf-8d38-777656a427d6") {
          router.push("/staff");
          return;
        }

        setProfile(parsed);
      } catch (e) {
        console.error("Invalid profile in localStorage");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("profile");
    localStorage.removeItem("token");
    router.push("/");
    router.refresh();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <AdminPage
        searchParams={searchParams}
        profile={logged_profile}
        onLogout={handleLogout}
      />
    </div>
  );
}
