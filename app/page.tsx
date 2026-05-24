import HeroSection from "@/components/hero-section";
import SponsorCarousel from "@/components/sponsor-carousel";

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-1 lg:min-h-0">
      <HeroSection />
      <SponsorCarousel />
    </div>
  );
}
