"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  children?: ReactNode;
}

/**
 * Full-viewport hero where the mouse wheel / touch scroll drives a media
 * element from a small centered box up to nearly full-bleed before handing
 * scroll back to the page. Wheel/touch listeners are attached to `window`
 * for the lifetime of this component, so it should only be used as the
 * first thing on a page (nothing should need to scroll above it).
 */
export function ScrollExpandMedia({
  mediaType = "image",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  children,
}: ScrollExpandMediaProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    function applyProgress(delta: number) {
      setScrollProgress((prev) => {
        const next = Math.min(Math.max(prev + delta, 0), 1);
        if (next >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (next < 0.75) {
          setShowContent(false);
        }
        return next;
      });
    }

    function handleWheel(e: WheelEvent) {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
        return;
      }
      if (!mediaFullyExpanded) {
        e.preventDefault();
        applyProgress(e.deltaY * 0.0009);
      }
    }

    function handleTouchStart(e: TouchEvent) {
      touchStartYRef.current = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
      if (!touchStartYRef.current) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
        return;
      }
      if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
        applyProgress(deltaY * scrollFactor);
        touchStartYRef.current = touchY;
      }
    }

    function handleTouchEnd() {
      touchStartYRef.current = 0;
    }

    function handleScroll() {
      if (!mediaFullyExpanded) window.scrollTo(0, 0);
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [mediaFullyExpanded]);

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);

  const firstWord = title ? title.split(" ")[0] : "";
  const restOfTitle = title ? title.split(" ").slice(1).join(" ") : "";

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-start overflow-x-hidden">
      <motion.div
        className="absolute inset-0 z-0 h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 - scrollProgress }}
        transition={{ duration: 0.1 }}
      >
        <Image
          src={bgImageSrc}
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-toros-black/50" />
      </motion.div>

      <div className="relative z-10 flex h-[100dvh] w-full flex-col items-center justify-center">
        <div
          className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl"
          style={{
            width: `${mediaWidth}px`,
            height: `${mediaHeight}px`,
            maxWidth: "95vw",
            maxHeight: "85vh",
            boxShadow: "0px 0px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {mediaType === "video" ? (
            <video
              src={mediaSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
            />
          ) : (
            <Image src={mediaSrc} alt={title ?? ""} fill className="object-cover" />
          )}
          <motion.div
            className="absolute inset-0 bg-toros-black/50"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div
          className={`relative z-10 flex w-full flex-col items-center justify-center gap-3 text-center ${
            title ? "mt-[min(50vh,420px)]" : ""
          }`}
        >
          {date && (
            <p
              className="text-sm uppercase tracking-[0.28em] text-toros-brass-light"
              style={{ transform: `translateX(-${textTranslateX}vw)` }}
            >
              {date}
            </p>
          )}
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
            <h2
              className="font-display text-4xl font-bold text-toros-cream md:text-5xl lg:text-6xl"
              style={{ transform: `translateX(-${textTranslateX}vw)` }}
            >
              {firstWord}
            </h2>
            <h2
              className="font-display text-4xl font-bold text-toros-cream md:text-5xl lg:text-6xl"
              style={{ transform: `translateX(${textTranslateX}vw)` }}
            >
              {restOfTitle}
            </h2>
          </div>
          {scrollToExpand && (
            <p
              className="text-xs uppercase tracking-[0.2em] text-toros-sand/70"
              style={{ transform: `translateX(${textTranslateX}vw)` }}
            >
              {scrollToExpand}
            </p>
          )}
        </div>
      </div>

      <motion.div
        className="relative z-10 w-full px-6 py-16 md:px-16 md:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.7 }}
      >
        {children}
      </motion.div>
    </section>
  );
}
