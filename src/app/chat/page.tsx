"use client";

import ChatPage from "./_components/ChatPage";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "../_shared/LoginPage";
import Navbar from "../_shared/Navbar";
import { PROFILE_SERVICE } from "../_shared/adminAuth";

export default function Route_sign() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    let tok =
      localStorage.getItem("trimerge_staff_access_token") ||
      localStorage.getItem("trimerge_admin_access_token");
    setIsAdminAuthenticated(Boolean(tok));
    setIsReady(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    router.replace("/staff");
  };

  const handleLogout = useCallback(async () => {
    setIsAdminAuthenticated(false);

    localStorage.removeItem("trimerge_admin_auth");
    localStorage.removeItem("trimerge_staff_access_token");
    router.push("/");
    router.refresh();

    let response = await fetch(`${PROFILE_SERVICE}/signout`, {
      method: "POST",
      headers: {
        "x-api-version": "v3",
        "x-api-key": process.env.NEXT_PUBLIC_PROFILE_API_KEY ?? "",
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("trimerge_staff_access_token")}`,
      },
      body: JSON.stringify({}),
    });
  }, [router]);

  useEffect(() => {
    window.addEventListener("trimerge_admin_session_expired", handleLogout);

    return () => {
      window.removeEventListener(
        "trimerge_admin_session_expired",
        handleLogout,
      );
    };
  }, [handleLogout]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {isAdminAuthenticated ? (
        <ChatPage />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} kind="staff" />
      )}
    </div>
  );
}
