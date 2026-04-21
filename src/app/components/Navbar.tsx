"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Search, Shield } from "lucide-react";

const navItems = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/admin", label: "Admin", icon: Shield },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur page-section">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="interactive-base text-left">
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
            data-active={pathname === "/"}
            className={`nav-link interactive-button inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
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
                data-active={isActive}
                className={`nav-link interactive-button inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
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
      </div>
    </nav>
  );
}
