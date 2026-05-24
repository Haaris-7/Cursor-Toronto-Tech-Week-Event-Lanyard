"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Lanyard from "@/components/ui/lanyard";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Video, Link as LinkIcon, Check, Loader2, ChevronDown, RotateCcw } from "lucide-react";
import { parseParams, serializeParams, TRACKS, type Track } from "@/lib/lanyard-params";
import {
  getCanonicalUrl,
  copyToClipboard,
  linkedInShareUrl,
  xShareUrl,
} from "@/lib/share";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function BorderBeam({ duration = 1.5 }: { duration?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
      style={{
        overflow: "hidden",
        padding: 1,
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
      } as React.CSSProperties}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "300%",
          aspectRatio: "1",
          marginLeft: "-150%",
          marginTop: "-150%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(255,255,255,0.03) 290deg, rgba(255,255,255,0.15) 320deg, rgba(255,255,255,0.4) 345deg, rgba(255,255,255,0.7) 360deg)",
          animationName: "beam-spin",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationFillMode: "both",
        }}
      />
    </div>
  );
}

function pickMime(): string {
  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
  ];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

function fileExt(mime: string): string {
  return mime.startsWith("video/mp4") ? "mp4" : "webm";
}

function makeSlug(name: string): string {
  return (name || "lanyard")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const MAX_CHARS = 32;

interface LanyardWithControlsProps {
  position?: [number, number, number];
  containerClassName?: string;
}

export default function LanyardWithControls({
  position = [0, 0, 11],
  containerClassName,
}: LanyardWithControlsProps) {
  const router = useRouter();

  const emptyFields = { name: "", track: "" as Track | "", tagline: "" };
  const [fields, setFields] = useState(emptyFields);
  const [appliedFields, setAppliedFields] = useState(emptyFields);
  const [paramsLoaded, setParamsLoaded] = useState(false);

  useEffect(() => {
    if (paramsLoaded) return;
    const params = new URLSearchParams(window.location.search);
    const parsed = parseParams(params);
    setFields(parsed);
    setAppliedFields(parsed);
    setParamsLoaded(true);
  }, [paramsLoaded]);

  const [resetKey, setResetKey] = useState(0);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [videoSpin, setVideoSpin] = useState(false);
  const [captureBack, setCaptureBack] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isBusy = recording || countdown !== null || captureBack;

  const syncUrl = useCallback(
    (f: typeof fields) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const qs = serializeParams(f);
        router.replace(`/${qs}`, { scroll: false });
      }, 300);
    },
    [router]
  );

  const handleFrontExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `cursor-ttw-lanyard-${makeSlug(appliedFields.name)}-front.png`;
    a.click();
  };

  const handleBackExport = useCallback(async () => {
    if (isBusy) return;
    setCaptureBack(true);
    await new Promise((r) => setTimeout(r, 400));
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `cursor-ttw-lanyard-${makeSlug(appliedFields.name)}-back.png`;
      a.click();
    }
    setCaptureBack(false);
  }, [isBusy, appliedFields.name]);

  const handleApply = () => {
    setAppliedFields({ ...fields });
    syncUrl(fields);
  };

  const handleRecord = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || isBusy) return;

    const mime = pickMime();
    if (!mime) {
      alert("Video recording is not supported in this browser.");
      return;
    }

    setCountdown(3);
    await new Promise((r) => setTimeout(r, 1000));
    setCountdown(2);
    await new Promise((r) => setTimeout(r, 1000));
    setCountdown(1);
    await new Promise((r) => setTimeout(r, 1000));
    setCountdown(null);

    setRecording(true);
    setVideoSpin(true);

    try {
      setResetKey((prev) => prev + 1);
      await new Promise((r) => setTimeout(r, 200));

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
      });

      recorder.start();

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      await new Promise((r) =>
        setTimeout(r, prefersReducedMotion ? 4000 : 11000)
      );
      recorder.stop();

      const blob = await done;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cursor-ttw-lanyard-${makeSlug(appliedFields.name)}.${fileExt(mime)}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setRecording(false);
      setVideoSpin(false);
    }
  }, [isBusy, appliedFields.name]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleApply();
  };

  const hasChanges =
    fields.name !== appliedFields.name ||
    fields.track !== appliedFields.track ||
    fields.tagline !== appliedFields.tagline;

  const shareUrl = getCanonicalUrl(appliedFields);
  const shareText =
    "I'm building at the Cursor Hackathon during Toronto Tech Week. Check out my lanyard\n\nDon't forget to tag the creator of the project @Haaris Sadiq";

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [activeBeam, setActiveBeam] = useState<string | null>(null);

  useEffect(() => {
    if (isBusy) {
      setActiveBeam(null);
      return;
    }

    let targets: string[];
    if (hasChanges) {
      targets = ["apply"];
    } else if (!fields.name) {
      targets = ["name"];
      if (!fields.track) targets.push("track");
      if (!fields.tagline) targets.push("tagline");
    } else {
      targets = ["export-section", "share-buttons"];
    }

    let cancelled = false;
    const BEAM_MS = 1500;
    const GAP_MS = 200;
    const CYCLE_WAIT_MS = 20_000;
    const INITIAL_DELAY_MS = 5_000;

    async function cycle() {
      await new Promise((r) => setTimeout(r, INITIAL_DELAY_MS));
      while (!cancelled) {
        for (let i = 0; i < targets.length; i++) {
          if (cancelled) return;
          setActiveBeam(targets[i]);
          await new Promise((r) => setTimeout(r, BEAM_MS));
          if (cancelled) return;
          setActiveBeam(null);
          if (i < targets.length - 1) {
            await new Promise((r) => setTimeout(r, GAP_MS));
          }
        }
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, CYCLE_WAIT_MS));
      }
    }

    cycle();
    return () => {
      cancelled = true;
      setActiveBeam(null);
    };
  }, [
    hasChanges,
    fields.name,
    fields.track,
    fields.tagline,
    isBusy,
  ]);

  const actionBtnClass =
    "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-[#2a2a2f] font-mono text-xs text-[#8a8a92] transition-colors hover:border-white/20 hover:text-[#ededf0] disabled:opacity-50";

  return (
    <div className="relative h-full w-full">
      <Lanyard
        position={position}
        containerClassName={containerClassName}
        canvasRef={canvasRef}
        textFields={appliedFields}
        resetKey={resetKey}
        videoSpin={videoSpin}
        recording={isBusy}
        captureBack={captureBack}
      />

      {countdown !== null && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-black/60 backdrop-blur-md">
            <span className="font-mono text-6xl font-bold text-white tabular-nums">
              {countdown}
            </span>
          </div>
        </div>
      )}

      {recording && (
        <div className="absolute left-1/2 top-6 z-30 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="font-mono text-xs font-medium text-red-400">Recording</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-20 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[320px]">
        <div className="rounded-xl border border-[#2a2a2f]/60 bg-[#131315]/80 p-4 backdrop-blur-md">
          <label className="mb-3 block font-mono text-xs font-medium uppercase tracking-widest text-[#8a8a92]">
            Design your lanyard
          </label>

          <div className="flex flex-col gap-2">
            <div className="relative rounded-md">
              <input
                type="text"
                value={fields.name}
                onChange={(e) => {
                  if (e.target.value.length > MAX_CHARS) return;
                  setFields((prev) => ({ ...prev, name: e.target.value }));
                }}
                onKeyDown={handleKeyDown}
                placeholder="Name *"
                maxLength={MAX_CHARS}
                aria-label="Name"
                disabled={isBusy}
                className="h-10 w-full rounded-md border border-[#2a2a2f] bg-[#1c1c20] px-3 py-2 font-mono text-sm text-[#ededf0] placeholder:text-[#5a5a62] focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
              />
              {activeBeam === "name" && <BorderBeam />}
            </div>

            <div className="relative rounded-md">
              <select
                value={fields.track}
                onChange={(e) =>
                  setFields((prev) => ({
                    ...prev,
                    track: e.target.value as Track | "",
                  }))
                }
                aria-label="Track"
                disabled={isBusy}
                className="h-10 w-full appearance-none rounded-md border border-[#2a2a2f] bg-[#1c1c20] px-3 py-2 pr-8 font-mono text-sm text-[#ededf0] focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50 [&:not(:valid)]:text-[#5a5a62]"
              >
                <option value="" disabled className="text-[#5a5a62]">
                  Select track
                </option>
                {TRACKS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a5a62]" />
              {activeBeam === "track" && <BorderBeam />}
            </div>

            <div className="relative rounded-md">
              <input
                type="text"
                value={fields.tagline}
                onChange={(e) => {
                  if (e.target.value.length > MAX_CHARS) return;
                  setFields((prev) => ({ ...prev, tagline: e.target.value }));
                }}
                onKeyDown={handleKeyDown}
                placeholder="@handle, company, school..."
                maxLength={MAX_CHARS}
                aria-label="Custom text"
                disabled={isBusy}
                className="h-10 w-full rounded-md border border-[#2a2a2f] bg-[#1c1c20] px-3 py-2 font-mono text-sm text-[#ededf0] placeholder:text-[#5a5a62] focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
              />
              {activeBeam === "tagline" && <BorderBeam />}
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={!hasChanges || isBusy}
            className={`mt-3 flex h-10 w-full items-center justify-center rounded-md bg-white font-mono text-sm font-medium text-[#131315] transition-colors hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed ${
              activeBeam === "apply"
                ? "animate-[apply-pulse_1.2s_ease-in-out]"
                : ""
            }`}
          >
            Apply
          </button>

          <div className="relative mt-4 rounded-lg border-t border-[#2a2a2f]/60 pt-4">
            {activeBeam === "export-section" && <BorderBeam />}

            <span className="mb-3 block font-mono text-[10px] font-medium uppercase tracking-widest text-[#5a5a62]">
              Export & Share
            </span>

            <TooltipProvider delayDuration={300}>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleFrontExport}
                        disabled={isBusy}
                        className={actionBtnClass}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Front</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Download front of card as PNG</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleBackExport}
                        disabled={isBusy}
                        className={actionBtnClass}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Back</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Flip card and download back as PNG</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRecord}
                      disabled={isBusy}
                      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-[#2a2a2f] font-mono text-xs text-[#8a8a92] transition-colors hover:border-white/20 hover:text-[#ededf0] disabled:opacity-50"
                    >
                      {recording ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Recording...</span>
                        </>
                      ) : (
                        <>
                          <Video className="h-3.5 w-3.5" />
                          <span>Record Video</span>
                        </>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Record entrance animation with 360 spin</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center gap-2 border-t border-[#2a2a2f]/40 pt-3 mt-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#5a5a62]">
                    Share
                  </span>
                  <div className="relative flex items-center gap-1 rounded-lg px-1 py-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() =>
                            window.open(
                              xShareUrl(shareUrl, shareText),
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          variant="outline"
                          size="icon"
                          disabled={isBusy}
                          className="h-7 w-7 shrink-0 border-[#2a2a2f] text-[#8a8a92] hover:border-white/20 hover:text-[#ededf0]"
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Share on X</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() =>
                            window.open(
                              linkedInShareUrl(shareUrl, shareText),
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          variant="outline"
                          size="icon"
                          disabled={isBusy}
                          className="h-7 w-7 shrink-0 border-[#2a2a2f] text-[#8a8a92] hover:border-white/20 hover:text-[#ededf0]"
                        >
                          <LinkedInIcon className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Share on LinkedIn</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          size="icon"
                          disabled={isBusy}
                          className="h-7 w-7 shrink-0 border-[#2a2a2f] text-[#8a8a92] hover:border-white/20 hover:text-[#ededf0]"
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <LinkIcon className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? "Copied!" : "Copy link"}</p>
                      </TooltipContent>
                    </Tooltip>
                    {activeBeam === "share-buttons" && <BorderBeam />}
                  </div>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
