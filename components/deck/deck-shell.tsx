"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { deckSlides } from "./deck-content";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "./slide-frame";

function indexFromHash(): number {
  if (typeof window === "undefined") return 0;
  const n = parseInt(window.location.hash.slice(1), 10);
  return n >= 1 && n <= deckSlides.length ? n - 1 : 0;
}

export function DeckShell() {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(0.5);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Deliberately not a lazy useState initializer: that would run during the first
    // client render too, before hydration, and mismatch the server-rendered slide 1
    // markup whenever the URL carries a hash other than #1.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time correction from the URL hash after mount, not a state sync loop
    setIndex(indexFromHash());
  }, []);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setScale(Math.min(width / SLIDE_WIDTH, height / SLIDE_HEIGHT, 1));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${index + 1}`);
  }, [index]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        setIndex((i) => Math.min(deckSlides.length - 1, i + 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (event.key.toLowerCase() === "f") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void containerRef.current?.requestFullscreen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const slide = deckSlides[index];
  const Slide = slide.Component;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-(--bg)">
      <nav
        aria-label="Slides"
        className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--border-1) p-4"
      >
        <Link href="/" className="text-(length:--text-meta) font-medium text-(--text-2) hover:text-(--text-1)">
          ← Relay
        </Link>
        {(["A", "B"] as const).map((part) => (
          <div key={part} className="flex flex-col gap-1">
            <p className="px-2 text-(length:--text-kbd) leading-(length:--leading-kbd) font-semibold tracking-wide text-(--text-2) uppercase">
              {part === "A" ? "The one hour answer" : "Beyond the hour"}
            </p>
            {deckSlides.map((s, i) =>
              s.part === part ? (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "rounded-(--radius-control) px-2 py-1.5 text-left text-(length:--text-meta) transition-colors",
                    i === index
                      ? "bg-(--surface-2) font-medium text-(--text-1)"
                      : "text-(--text-2) hover:bg-(--surface-2) hover:text-(--text-1)",
                  )}
                >
                  <span className="tnum mr-2 text-(--text-2)">{i + 1}</span>
                  {" "}
                  {s.label}
                </button>
              ) : null,
            )}
          </div>
        ))}
        <Link
          href="/deck/print"
          className="mt-auto rounded-(--radius-control) border border-(--border-1) px-2 py-1.5 text-center text-(length:--text-meta) text-(--text-2) hover:bg-(--surface-2) hover:text-(--text-1)"
        >
          Print view
        </Link>
      </nav>
      <main
        ref={containerRef}
        className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-(--surface-2)"
        onClick={() => setIndex((i) => Math.min(deckSlides.length - 1, i + 1))}
      >
        {/* eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (fit-to-viewport scale), not color */}
        <div style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${scale})` }}>
          <Slide n={index + 1} total={deckSlides.length} />
        </div>
      </main>
    </div>
  );
}
