"use client";

import { useEffect, useState } from "react";

/**
 * Layered mountain silhouettes — subtle depth behind hero knives and text.
 */
export function HeroMountains() {
  const [parallax, setParallax] = useState({ x: 0, y: 0, scroll: 0 });
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotionEnabled(!reducedMotion);
    if (reducedMotion) return;

    function handlePointerMove(event: PointerEvent) {
      const x = (event.clientX / window.innerWidth - 0.5) * 8;
      const y = (event.clientY / window.innerHeight - 0.5) * 4;
      setParallax((prev) => ({ ...prev, x, y }));
    }

    function handleScroll() {
      setParallax((prev) => ({ ...prev, scroll: window.scrollY }));
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollShift = motionEnabled ? parallax.scroll * 0.03 : 0;
  const layerShift = (multiplier: number) =>
    motionEnabled
      ? {
          transform: `translate3d(${parallax.x * multiplier}px, ${parallax.y * multiplier * 0.5 + scrollShift * multiplier * 0.35}px, 0)`,
        }
      : undefined;

  return (
    <div className="hero-section-mountains" aria-hidden="true">
      <svg
        className="hero-section-mountains-svg"
        viewBox="0 0 1920 600"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <defs>
          <linearGradient id="heroMtFar" x1="960" y1="180" x2="960" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c4a574" stopOpacity="0.28" />
            <stop offset="0.12" stopColor="#4a4238" stopOpacity="0.22" />
            <stop offset="0.45" stopColor="#2c2824" stopOpacity="0.38" />
            <stop offset="1" stopColor="#141210" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="heroMtMid" x1="960" y1="140" x2="960" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d4b88a" stopOpacity="0.32" />
            <stop offset="0.1" stopColor="#5c5248" stopOpacity="0.26" />
            <stop offset="0.4" stopColor="#322e2a" stopOpacity="0.42" />
            <stop offset="1" stopColor="#121010" stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id="heroMtNear" x1="960" y1="100" x2="960" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e8dcc8" stopOpacity="0.14" />
            <stop offset="0.08" stopColor="#a8894a" stopOpacity="0.36" />
            <stop offset="0.35" stopColor="#3a3530" stopOpacity="0.48" />
            <stop offset="1" stopColor="#0d0c0a" stopOpacity="0.72" />
          </linearGradient>
        </defs>

        <g className="hero-mountains-layer" style={layerShift(0.2)}>
          <path
            className="hero-mountains-path hero-mountains-path--far"
            d="M0 600 L0 400 C140 388 240 368 380 360 C520 352 620 378 760 368 C900 358 1000 332 1140 324 C1280 316 1380 348 1520 338 C1660 348 1780 372 1920 362 L1920 600 Z"
            fill="url(#heroMtFar)"
          />
        </g>

        <g className="hero-mountains-layer" style={layerShift(0.32)}>
          <path
            className="hero-mountains-path hero-mountains-path--mid"
            d="M0 600 L0 430 C100 422 220 396 360 384 C500 368 600 404 740 392 C880 380 980 348 1120 336 C1240 324 1340 368 1480 356 C1620 344 1760 388 1920 376 L1920 600 Z"
            fill="url(#heroMtMid)"
          />
        </g>

        <g className="hero-mountains-layer" style={layerShift(0.44)}>
          <path
            className="hero-mountains-path hero-mountains-path--near"
            d="M0 600 L0 470 C120 458 260 420 400 404 C540 380 660 416 800 396 C940 384 1060 352 1180 336 C1300 320 1420 364 1540 348 C1660 332 1780 376 1920 360 L1920 600 Z"
            fill="url(#heroMtNear)"
          />
          <path
            className="hero-mountains-ridge"
            d="M0 470 C120 458 260 420 400 404 C540 380 660 416 800 396 C940 384 1060 352 1180 336 C1300 320 1420 364 1540 348 C1660 332 1780 376 1920 360"
            stroke="rgba(196, 165, 116, 0.28)"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
