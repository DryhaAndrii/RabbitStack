import type { Metadata } from "next";
import "./globals.css";
import MagicRings from "@/components/backgrounds/MagicRings";
import AppNavbar from "@/components/navigation/AppNavbar";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "RabbitStack",
  description: "RabbitStack frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <div className="app-shell">
          <div className="app-shell__background" aria-hidden="true">
            <div className="app-shell__glow app-shell__glow--left" />
            <div className="app-shell__glow app-shell__glow--right" />
            <MagicRings />
          </div>
          <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col ">
            <AppNavbar />
            <div className="app-shell__content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
