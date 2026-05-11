
import AnimatedList from "@/components/AnimatedList";
import Overview from "@/components/overview";
import GlassContainer from "@/components/surfaces/GlassContainer";

const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10'];


export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <GlassContainer>
        <Overview />


      </GlassContainer>
    </main>
  );
}
