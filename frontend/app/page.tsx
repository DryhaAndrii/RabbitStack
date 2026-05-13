import Overview from "@/components/overview";
import GlassContainer from "@/components/surfaces/GlassContainer";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <GlassContainer >
        <Overview />


      </GlassContainer>
    </main>
  );
}
