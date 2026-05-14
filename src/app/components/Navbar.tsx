"use client";

import Image from "next/image";
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
    <nav className="z-40 border-b border-[#e6e8f1] bg-white page-section">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-[22px]">
        <Link
          href="/"
          className="interactive-base flex items-center text-left"
          aria-label="TriMerge IQ home"
        >
          <Image
            src="/trimerge-iq-logo.png"
            alt="TriMerge IQ"
            width={2154}
            height={342}
            priority
            unoptimized
            className="h-auto w-[220px] object-contain sm:w-[280px] lg:w-[330px]"
          />
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
                className={`interactive-button inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-medium ${
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
