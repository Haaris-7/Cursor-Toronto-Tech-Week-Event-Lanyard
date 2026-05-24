"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Link as LinkIcon } from "lucide-react";

export const HeroHeader = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

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
          <button
            onClick={handleShare}
            className="group flex items-center gap-1.5 rounded-full border border-white/[0.08] px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-[#8a8a92] transition-all hover:border-white/20 hover:text-[#ededf0]"
          >
            {copied ? (
              <>
                Copied
                <Check className="h-3 w-3 text-green-500" />
              </>
            ) : (
              <>
                Share
                <LinkIcon className="h-3 w-3 transition-transform group-hover:scale-110" />
              </>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};
