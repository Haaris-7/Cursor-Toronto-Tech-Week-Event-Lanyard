"use client";

import { useState, useEffect } from "react";
import LanyardWithControls from "@/components/lanyard-with-controls";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isDesktop;
}

export default function LanyardPage() {
  const isDesktop = useIsDesktop();

  return (
    <div className="relative h-dvh w-full">
      {isDesktop ? (
        <div className="absolute inset-0">
          <LanyardWithControls
            position={[0, 0, 11]}
            containerClassName="absolute inset-0 select-none"
          />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="flex flex-col items-center gap-6">
            <h1 className="font-mono text-2xl font-semibold text-[#ededf0]">
              3D Lanyard Designer
            </h1>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.1] bg-[#1c1c20]/90 px-6 py-5 backdrop-blur-sm">
              <svg className="h-8 w-8 text-[#8a8a92]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              <p className="max-w-[260px] text-center font-mono text-sm leading-relaxed text-[#8a8a92]">
                The <span className="font-medium text-[#ededf0]">Design your 3D lanyard</span> experience is best viewed on desktop
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
      )}
    </div>
  );
}
