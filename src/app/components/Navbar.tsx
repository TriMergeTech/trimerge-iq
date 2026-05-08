"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageSquare, Search, Shield } from "lucide-react";

const navItems = [
  { href: "/search", label: "Search", icon: Search, hasCaret: true },
  { href: "/admin", label: "Admin", icon: Shield, hasCaret: true },
  { href: "/chat", label: "Chat", icon: MessageSquare, hasCaret: false },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="z-40 bg-white page-section">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-14">
        <Link
          href="/"
          className="interactive-base flex items-center gap-3 text-left"
          aria-label="TriMerge Consulting Group home"
        >
          <svg className="h-16 w-16 shrink-0" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path
              d="M9 52 32 10 55 52H9Z"
              fill="white"
              stroke="#1f2858"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <path d="M20 50 32 27 44 50H20Z" fill="#efb01a" />
          </svg>
          <div className="leading-none">
            <div className="text-[42px] font-extrabold tracking-normal sm:text-[48px]">
              <span className="text-[#1f2858]">Tri</span>
              <span className="text-[#efb01a]">Merge</span>
            </div>
            <div className="mt-2 font-sans text-[15px] font-semibold uppercase tracking-[0.38em] text-[#7a82a6] sm:text-[17px]">
              Consulting Group
            </div>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            data-active={pathname === "/"}
            className={`interactive-button inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[15px] font-semibold ${
              pathname === "/"
                ? "bg-[#2e2bff] text-white shadow-md shadow-indigo-500/20"
                : "text-[#1f2858] hover:bg-[#f3f4f9]"
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
                className={`interactive-button inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-semibold ${
                  isActive
                    ? "bg-[#2e2bff] text-white shadow-md shadow-indigo-500/20"
                    : "text-[#1f2858] hover:bg-[#f3f4f9]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.hasCaret ? (
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
