import Link from "next/link";
import Image from "next/image";

export default function FooterSection() {
  return (
    <footer className="shrink-0 border-t border-white/[0.06] py-3">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 sm:flex-row sm:justify-between lg:px-12">
        <div className="flex items-center gap-3">
          <Image
            src="/cursor-brand-assets/General Logos/Cube/PNG/CUBE_2D_DARK.png"
            alt="Cursor"
            width={20}
            height={23}
            className="h-3.5 w-auto opacity-40"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a4a52]">
            Cursor {"×"} Toronto Tech Week · May 27, 2026
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="https://luma.com/11fprizv"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-[#5a5a62] transition-colors hover:text-[#ededf0]"
          >
            Register
          </Link>
          <span className="text-[#2a2a2f]">·</span>
          <Link
            href="https://torontotechweek.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-[#5a5a62] transition-colors hover:text-[#ededf0]"
          >
            TTW
          </Link>
          <span className="text-[#2a2a2f]">·</span>
          <Link
            href="https://cursor.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-[#5a5a62] transition-colors hover:text-[#ededf0]"
          >
            Cursor
          </Link>
          <span className="text-[#2a2a2f]">·</span>
          <span className="font-mono text-[11px] text-[#5a5a62]">Built by</span>
          <Link
            href="https://www.linkedin.com/in/haarissadiq/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1 font-mono text-sm text-white transition-colors hover:text-white/80"
          >
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-white via-white/30 to-white bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_4s_ease-in-out_infinite]">
                Haaris Sadiq
              </span>
            </span>
            <svg
              className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" />
            </svg>
          </Link>
        </div>
      </div>

    </footer>
  );
}
