"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      (window as any).__loaderComplete = true;
      window.dispatchEvent(new Event("loader-complete"));
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!fadeOut) return;
    const timer = setTimeout(() => {
      setVisible(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [fadeOut]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#131315] transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="loader-logo mb-8 opacity-0">
        <Image
          src="/cursor-brand-assets/General Logos/Cube/PNG/CUBE_2D_DARK.png"
          alt="Cursor"
          width={48}
          height={56}
          className="h-12 w-auto"
          priority
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <h1 className="loader-title opacity-0 font-mono text-xs tracking-[0.3em] uppercase text-[#5a5a62]">
          Cursor {"×"} Toronto Tech Week
        </h1>

        <div className="loader-subtitle opacity-0 flex flex-col items-center gap-1.5">
          <span className="text-xl font-semibold tracking-tight text-[#ededf0] sm:text-2xl">
            3D Lanyard Experience
          </span>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#3a3a42]">
            May 27, 2026
          </span>
        </div>
      </div>

      <div className="loader-bar mt-10 h-[1px] w-32 overflow-hidden rounded-full bg-[#2a2a2f] opacity-0">
        <div className="h-full w-full origin-left animate-[loader-fill_1.8s_ease-in-out_forwards] bg-gradient-to-r from-[#5a5a62] to-white" />
      </div>
    </div>
  );
}
