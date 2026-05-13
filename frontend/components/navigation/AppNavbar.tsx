"use client";
import { usePathname } from "next/navigation";

import PillNavbar from "./PillNavbar";
import { appRoutes } from "./routes";

export default function AppNavbar() {
  const pathname = usePathname();
  const activeHref =
    appRoutes.find((route) => route.href === pathname)?.href ??
    appRoutes[0]?.href;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="pointer-events-auto w-full max-w-5xl">
        <div className="relative flex justify-center md:justify-start h-[50px]">
          <PillNavbar
            items={appRoutes}
            activeHref={activeHref}
            initialLoadAnimation={false}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
