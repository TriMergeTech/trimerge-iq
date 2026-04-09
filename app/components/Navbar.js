"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare, Search, Shield } from "lucide-react";

const navItems = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/admin", label: "Admin", icon: Shield },
];

export default function Navbar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setUserEmail(localStorage.getItem("trimerge_admin_email") ?? "");
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/trimerge-logo.png"
            alt="TriMerge Consulting Group"
            className="h-auto w-[220px] sm:w-[260px]"
          />
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              pathname === "/"
                ? "bg-trimerge-blue text-white shadow-md"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Home
          </Link>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-trimerge-blue text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {pathname === "/admin" && userEmail ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Logged in as
            </p>
            <p className="text-sm font-semibold text-slate-900">{userEmail}</p>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
