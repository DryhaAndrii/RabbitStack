import { Suspense } from "react";
import Overview from "@/components/overview";
import GlassContainer from "@/components/surfaces/GlassContainer";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <GlassContainer className="mt-8 mb-8">
        <Suspense fallback={<OverviewFallback />}>
          <Overview />
        </Suspense>
      </GlassContainer>
    </main>
  );
}

function OverviewFallback() {
  return (
    <div className="min-h-[400px] w-full">
      <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Overview
      </h1>
    </div>
  );
}
