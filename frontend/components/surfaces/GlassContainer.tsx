'use client';
import type { ComponentPropsWithoutRef, ReactNode } from "react";


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
  return <div
    style={{
      background: "#ffffff1a",
      transform: 'translate3d(0, 0, 0.01px)',
      boxShadow: 'rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px, rgba(0,0,0,0.1) 0 16px 32px, rgba(0,0,0,0.1) 0 32px 64px',
    }}
    className={joinClasses(
      "size-full  border border-white/15 p-8 text-zinc-100 sm:p-12",
      className,
    )}
    {...props}
  >
    {children}
  </div>;

}


