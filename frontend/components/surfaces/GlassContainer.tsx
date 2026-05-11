'use client';
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import BorderGlow from './GlowBorder';

type GlassContainerProps = {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"div">;

function joinClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function GlassContainer({
  children,
  className,
  ...props
}: GlassContainerProps) {
  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="40 80 80"
      backgroundColor="#120f177a"
      borderRadius={28}
      glowRadius={40}
      glowIntensity={1}
      coneSpread={25}
      animated={false}
      colors={['#c084fc', '#f472b6', '#38bdf8']}
    >
      <div
        className={joinClasses(
          "size-full  p-8 text-zinc-100 sm:p-12",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </BorderGlow>

  );
}




