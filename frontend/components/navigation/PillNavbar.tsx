'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  shellColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  activeDotColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const isExternalLink = (href: string) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('//') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:') ||
  href.startsWith('#');

const PillNavbar: React.FC<PillNavProps> = ({
  items,
  activeHref,
  className = '',
  ease = 'power3.out',
  shellColor = 'rgba(9, 12, 22, 0.18)',
  pillColor = 'rgba(15, 23, 42, 0.72)',
  hoveredPillTextColor = '#f8fafc',
  pillTextColor = 'rgba(226, 232, 240, 0.88)',
  activeDotColor = 'rgba(125, 211, 252, 0.95)',
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(
          R - Math.sqrt(Math.max(0, R * R - (w * w) / 4)),
        ) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const labelHover = pill.querySelector<HTMLElement>('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (labelHover) gsap.set(labelHover, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();

        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          { scale: 1.18, xPercent: -50, duration: 2, ease, overwrite: 'auto' },
          0,
        );

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (labelHover) {
          gsap.set(labelHover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            labelHover,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' },
            0,
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => { });
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, y: 0 });
    }

    const navItems = navItemsRef.current;
    if (navItems && initialLoadAnimation) {
      gsap.set(navItems, { opacity: 0, y: -10 });
      gsap.to(navItems, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease,
      });
    }

    return () => {
      window.removeEventListener('resize', onResize);
      tlRefs.current.forEach((tl) => tl?.kill());
      activeTweenRefs.current.forEach((tween) => tween?.kill());
    };
  }, [ease, initialLoadAnimation, items]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen;
    setIsMobileMenuOpen(nextState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (nextState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.25, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.25, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.25, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.25, ease });
      }
    }

    if (menu) {
      if (nextState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.25, ease },
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease,
          onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ['--nav-shell' as const]: shellColor,
    ['--pill-bg' as const]: pillColor,
    ['--hover-text' as const]: hoveredPillTextColor,
    ['--pill-text' as const]: pillTextColor,
    ['--active-dot' as const]: activeDotColor,
    ['--nav-h' as const]: '48px',
    ['--pill-pad-x' as const]: '18px',
    ['--pill-gap' as const]: '6px',
  } satisfies React.CSSProperties;

  const containerClasses = [
    'w-full md:w-max',
    'flex items-center justify-between md:justify-start',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const basePillClasses =
    'relative inline-flex h-full items-center justify-center overflow-hidden rounded-full px-0 text-sm font-semibold uppercase tracking-[0.22em] no-underline transition-colors duration-200 whitespace-nowrap';

  const shellClasses =
    'relative hidden md:flex items-center rounded-full border border-white/10 bg-transparent p-1 shadow-[0_16px_40px_rgba(2,6,23,0.28)] backdrop-blur-xl h-full';

  const renderNavLink = (
    item: PillNavItem,
    content: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    onClick?: () => void,
    onMouseEnter?: () => void,
    onMouseLeave?: () => void,
  ) => {
    if (isExternalLink(item.href)) {
      return (
        <a
          href={item.href}
          className={className}
          style={style}
          aria-label={item.ariaLabel || item.label}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={item.href}
        className={className}
        style={style}
        aria-label={item.ariaLabel || item.label}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="w-full flex justify-center">
      <nav className={containerClasses} aria-label="Primary" style={cssVars}>
        <div ref={navItemsRef} className={shellClasses}>
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: 'var(--nav-shell)' }}
            aria-hidden="true"
          />
          <ul
            role="menubar"
            className="relative z-[1] m-0 flex h-full list-none items-stretch p-0"
            style={{ gap: 'var(--pill-gap)' }}
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href;

              const pillStyle: React.CSSProperties = {
                background: isActive
                  ? 'linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.94) 100%)'
                  : 'var(--pill-bg)',
                color: 'var(--pill-text)',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)',
                border: isActive
                  ? '1px solid rgba(125, 211, 252, 0.22)'
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isActive
                  ? '0 0 0 1px rgba(125, 211, 252, 0.08), 0 10px 30px rgba(2, 6, 23, 0.35)'
                  : 'none',
              };

              const pillContent = (
                <>
                  <span
                    className="hover-circle pointer-events-none absolute bottom-0 left-1/2 z-[1] block rounded-full"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(51, 65, 85, 0.92) 0%, rgba(15, 23, 42, 0.98) 100%)',
                      willChange: 'transform',
                    }}
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative z-[2] inline-block leading-[1]">
                    <span
                      className="pill-label relative z-[2] inline-block leading-[1]"
                      style={{ willChange: 'transform' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                      style={{
                        color: 'var(--hover-text)',
                        willChange: 'transform, opacity',
                      }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                  {isActive ? (
                    <span
                      className="absolute -bottom-[5px] left-1/2 z-[4] h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                      style={{
                        background: 'var(--active-dot)',
                        boxShadow: '0 0 18px rgba(125, 211, 252, 0.6)',
                      }}
                      aria-hidden="true"
                    />
                  ) : null}
                </>
              );

              return (
                <li key={item.href} role="none" className="flex h-full">
                  {renderNavLink(
                    item,
                    pillContent,
                    basePillClasses,
                    pillStyle,
                    undefined,
                    () => handleEnter(i),
                    () => handleLeave(i),
                  )}
                </li>
              );
            })}
          </ul>
          <div
            className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
            aria-hidden="true"
          />
        </div>

        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-950/45 backdrop-blur-xl md:hidden"
        >
          <span className="sr-only">Toggle menu</span>
          <span className="flex flex-col items-center justify-center gap-1">
            <span className="hamburger-line h-0.5 w-4 rounded bg-slate-100" />
            <span className="hamburger-line h-0.5 w-4 rounded bg-slate-100" />
          </span>
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        className="absolute left-0 right-0 top-16 z-[998] md:hidden"
        style={cssVars}
      >
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-2 shadow-[0_20px_50px_rgba(2,6,23,0.38)] backdrop-blur-2xl">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {items.map((item) => {
              const isActive = activeHref === item.href;
              const mobileStyle: React.CSSProperties = {
                background: isActive
                  ? 'linear-gradient(180deg, rgba(30,41,59,0.88) 0%, rgba(15,23,42,0.96) 100%)'
                  : 'rgba(15, 23, 42, 0.72)',
                color: isActive ? '#f8fafc' : 'rgba(226, 232, 240, 0.88)',
                border: isActive
                  ? '1px solid rgba(125, 211, 252, 0.25)'
                  : '1px solid rgba(255,255,255,0.06)',
              };

              return (
                <li key={item.href}>
                  {renderNavLink(
                    item,
                    item.label,
                    'block rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] no-underline',
                    mobileStyle,
                    () => setIsMobileMenuOpen(false),
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PillNavbar;
