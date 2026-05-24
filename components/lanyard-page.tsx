"use client";

import LanyardWithControls from "@/components/lanyard-with-controls";

export default function LanyardPage() {
  return (
    <div className="relative flex flex-col min-h-dvh lg:h-dvh w-full">
      <LanyardWithControls
        position={[0, 0, 11]}
      />
    </div>
  );
}
