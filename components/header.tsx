"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

export const HeroHeader = () => {
  return (
    <header>
      <nav className="fixed z-50 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
          <Link
            href="/"
            aria-label="home"
            className="flex items-center gap-3"
          >
            <Image
              src="/cursor-brand-assets/General Logos/Lockup Horizontal/PNG/LOCKUP_HORIZONTAL_2D_DARK.png"
              alt="Cursor"
              width={120}
              height={24}
              className="h-5 w-auto"
              priority
            />
            <span className="font-mono text-[10px] text-[#3a3a42]">
              {"×"}
            </span>
            <span className="font-mono text-xs font-medium tracking-widest text-[#6a6a72]">
              TTW
            </span>
          </Link>
          <Link
            href="https://luma.com/11fprizv"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 rounded-full border border-white/[0.08] px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-[#8a8a92] transition-all hover:border-white/20 hover:text-[#ededf0]"
          >
            Register
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path
                d="M6 3h7v7M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
};
