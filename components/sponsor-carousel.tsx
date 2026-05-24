import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const sponsors = [
  { name: "WisprFlow", tier: "platinum" },
  { name: "Drive Capital", tier: "gold" },
  { name: "Composio", tier: "gold" },
  { name: "Boardy", tier: "gold" },
  { name: "Carousel Studio", tier: "gold" },
  { name: "Valsea", tier: "silver" },
  { name: "ElevenLabs", tier: "silver" },
  { name: "Squid Media", tier: "silver" },
  { name: "BrainStation", tier: "bronze" },
];

function SponsorLogo({ name, tier }: { name: string; tier: string }) {
  const sizeClass =
    tier === "platinum"
      ? "text-[13px] font-semibold"
      : tier === "gold"
        ? "text-xs font-medium"
        : "text-[11px] font-normal";

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span
        className={`font-mono uppercase tracking-widest text-[#6a6a72] ${sizeClass}`}
      >
        {name}
      </span>
      {tier === "platinum" && (
        <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#ededf0]">
          Platinum
        </span>
      )}
    </div>
  );
}

export default function SponsorCarousel() {
  return (
    <section className="shrink-0 border-t border-white/[0.06] py-3">
      <div className="group relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-0">
          <div className="shrink-0 md:w-28 md:border-r md:border-white/[0.06] md:pr-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#5a5a62] md:text-right">
              Sponsors
            </p>
          </div>
          <div className="relative w-full overflow-hidden py-2 md:w-[calc(100%-7rem)] md:pl-6">
            <InfiniteSlider speedOnHover={20} speed={40} gap={80}>
              {sponsors.map((s) => (
                <SponsorLogo key={s.name} name={s.name} tier={s.tier} />
              ))}
            </InfiniteSlider>
            <div className="bg-linear-to-r from-[#131315] absolute inset-y-0 left-0 w-16" />
            <div className="bg-linear-to-l from-[#131315] absolute inset-y-0 right-0 w-16" />
            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-0 h-full w-16"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute right-0 top-0 h-full w-16"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
