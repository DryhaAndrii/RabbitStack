import { Suspense } from "react";
import GlassContainer from "@/components/surfaces/GlassContainer";
import AuthForms from "./AuthForms";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <GlassContainer className="w-full max-w-xl">
        <div className="flex flex-col gap-8">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Authentications
          </h1>

          <Suspense
            fallback={
              <div className="border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
                Loading authentication form...
              </div>
            }
          >
            <AuthForms />
          </Suspense>
        </div>
      </GlassContainer>
    </main>
  );
}
