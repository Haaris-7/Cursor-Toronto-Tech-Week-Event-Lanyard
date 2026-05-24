"use client";

import LanyardWithControls from "@/components/lanyard-with-controls";

export default function LanyardPage() {
  return (
    <div className="relative h-dvh w-full">
      <div className="hidden lg:block absolute inset-0">
        <LanyardWithControls
          position={[0, 0, 11]}
          containerClassName="absolute inset-0 select-none"
        />
      </div>
      <div className="lg:hidden flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="font-mono text-2xl font-semibold text-[#ededf0]">
            3D Lanyard Designer
          </h1>
          <p className="max-w-xs text-pretty text-sm text-[#8a8a92]">
            The interactive 3D lanyard designer works best on a desktop browser.
          </p>
          <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#1c1c20] px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-[#5a5a62]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <p className="font-mono text-xs text-[#5a5a62]">
              Open on desktop for the full experience
            </p>
          </div>
          <a
            href="/"
            className="mt-2 inline-flex h-10 items-center rounded-full border border-white/[0.08] px-5 font-mono text-sm text-[#8a8a92] transition-colors hover:bg-white/[0.04]"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
