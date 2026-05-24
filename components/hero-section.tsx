"use client";

import { useState, useEffect } from "react";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import DecryptedText from "@/components/DecryptedText";
import { transitionVariants } from "@/lib/utils";
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

function useLoaderDone() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if ((window as any).__loaderComplete) {
      setDone(true);
      return;
    }
    const handler = () => setDone(true);
    window.addEventListener("loader-complete", handler);
    return () => window.removeEventListener("loader-complete", handler);
  }, []);

  return done;
}

export default function HeroSection() {
  const isDesktop = useIsDesktop();
  const loaderDone = useLoaderDone();

  if (isDesktop) {
    return (
      <section className="relative flex-1 min-h-0 overflow-hidden">
        <div className="absolute inset-0 z-0" id="lanyard">
          <LanyardWithControls
            position={[0, 0, 11]}
          />
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-center w-[35%] min-w-[340px] max-w-[480px] py-12 pl-10 pr-8">
          <div className="max-w-md">
            {loaderDone && (
              <>
                <DecryptedText
                  text="CURSOR × TORONTO TECH WEEK"
                  animateOn="view"
                  revealDirection="start"
                  sequential
                  useOriginalCharsOnly={false}
                  speed={70}
                  className="font-mono text-sm tracking-widest text-[#8a8a92]"
                />
                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mt-6 text-balance text-4xl font-semibold text-[#ededf0] md:text-5xl xl:text-6xl"
                >
                  Build with
                </TextEffect>
                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="text-balance text-4xl font-semibold text-[#ededf0] md:text-5xl xl:text-6xl"
                >
                  Cursor IRL
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mt-6 max-w-sm text-pretty text-base text-[#8a8a92] lg:text-lg"
                >
                  Workshops, hackathon, panels & networking. Canada&apos;s largest Cursor event during Toronto Tech Week happening on May 27, 2026.
                </TextEffect>
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: { staggerChildren: 0.05, delayChildren: 0.75 },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="pointer-events-auto mt-8 flex items-start gap-3"
                >
                  <a
                    href="https://luma.com/11fprizv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center rounded-full bg-white px-6 font-mono text-sm font-medium text-[#131315] transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-100"
                  >
                    Register on Luma
                  </a>
                </AnimatedGroup>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex flex-col">
      <LanyardWithControls position={[0, -0.5, 8]} />

      {loaderDone && (
        <div className="flex flex-col items-center gap-6 px-6 py-8 text-center">
          <DecryptedText
            text="CURSOR × TORONTO TECH WEEK"
            animateOn="view"
            revealDirection="start"
            sequential
            useOriginalCharsOnly={false}
            speed={70}
            className="font-mono text-xs tracking-widest text-[#8a8a92]"
          />

          <div className="flex flex-col items-center gap-2">
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="text-balance text-4xl font-semibold text-[#ededf0]"
            >
              Build with
            </TextEffect>
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="text-balance text-4xl font-semibold text-[#ededf0]"
            >
              Cursor IRL
            </TextEffect>
          </div>

          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.5}
            as="p"
            className="max-w-xs text-pretty text-base text-[#8a8a92]"
          >
            Workshops, hackathon, panels & networking. Canada&apos;s largest Cursor event during Toronto Tech Week happening on May 27, 2026.
          </TextEffect>

          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.75 },
                },
              },
              ...transitionVariants,
            }}
            className="flex flex-col items-center gap-3"
          >
            <a
              href="https://luma.com/11fprizv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-full bg-white px-6 font-mono text-sm font-medium text-[#131315] transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-100"
            >
              Register on Luma
            </a>
          </AnimatedGroup>
        </div>
      )}
    </section>
  );
}
