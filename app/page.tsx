import HeroSection from "@/components/hero-section";
import SponsorCarousel from "@/components/sponsor-carousel";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeroSection />
      <SponsorCarousel />
    </div>
  );
}
