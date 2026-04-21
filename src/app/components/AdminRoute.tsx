"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPage from "./AdminPage";
import LoginPage from "./LoginPage";
import Navbar from "./Navbar";

export default function AdminRoute() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    setIsAdminAuthenticated(
      Boolean(
        localStorage.getItem("trimerge_admin_auth") &&
        localStorage.getItem("trimerge_admin_access_token"),
      ),
    );
    setIsReady(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    router.replace("/admin");
  };

  const handleLogout = () => {
    localStorage.removeItem("trimerge_admin_auth");
    localStorage.removeItem("trimerge_admin_email");
    localStorage.removeItem("trimerge_admin_access_token");
    localStorage.removeItem("trimerge_admin_refresh_token");
    setIsAdminAuthenticated(false);
    router.push("/");
    router.refresh();
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-500">Loading admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {isAdminAuthenticated ? (
        <AdminPage onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
