import type { Metadata } from "next";
import LanyardPage from "@/components/lanyard-page";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cursor-ttw-lanyard.vercel.app";

interface PageProps {
  searchParams: Promise<{ n?: string; r?: string; g?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const name = params.n || "Attendee";
  const hasUser = !!params.n;

  const title = hasUser
    ? `${name} | Cursor × Toronto Tech Week`
    : "Generate Your Lanyard | Cursor × Toronto Tech Week";

  const description = hasUser
    ? `${name} is building at the Cursor Hackathon — Toronto Tech Week, May 27 2026.`
    : "Design your personalized Cursor × Toronto Tech Week hackathon lanyard.";

  const ogParams = new URLSearchParams();
  if (params.n) ogParams.set("n", params.n);
  if (params.r) ogParams.set("r", params.r);
  if (params.g) ogParams.set("g", params.g);
  const ogUrl = `${SITE_URL}/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Cursor × Toronto Tech Week",
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default function Page() {
  return <LanyardPage />;
}
