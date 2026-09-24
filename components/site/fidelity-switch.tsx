"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const MODES = [
  { id: "hi", label: "Colour", caption: "Hi-fi. Tier tint, tier hue, tier weight." },
  { id: "wire", label: "Wire", caption: "Every chroma channel multiplied by zero. Same ranking." },
] as const;

type Mode = (typeof MODES)[number]["id"];

/**
 * The grayscale test, as the one thing on this page a visitor can operate.
 *
 * It is the product's own argument, so it behaves like the product's own control: a real
 * radiogroup with arrow keys and a roving tabindex, not two buttons that look like one.
 * Both images are painted from the first frame and crossfaded, which is why the switch
 * cannot shift the layout or flash an empty box — and why the second one is `priority`
 * despite being invisible.
 */
export function FidelitySwitch() {
  const [mode, setMode] = useState<Mode>("hi");
  const group = useRef<HTMLDivElement>(null);
  const captionId = useId();

  function onKeyDown(event: React.KeyboardEvent) {
    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = mode === "hi" ? "wire" : "hi";
    setMode(next);
    group.current?.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)?.focus();
  }

  return (
    <div>
      <div
        ref={group}
        role="radiogroup"
        aria-label="Screenshot fidelity"
        onKeyDown={onKeyDown}
        className="inline-flex h-12 items-center gap-1 rounded-(--r-full) border border-(--site-line) bg-(--site-bg-2) p-0.5"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            data-mode={m.id}
            aria-checked={mode === m.id}
            aria-describedby={captionId}
            tabIndex={mode === m.id ? 0 : -1}
            onClick={() => setMode(m.id)}
            className={cn(
              "t-site-mono flex h-11 items-center rounded-(--r-full) px-5 transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-focus)",
              mode === m.id
                ? "bg-(--site-text-1) text-(--site-bg)"
                : "text-(--site-text-2) hover:text-(--site-text-1)",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="site-shot relative mt-6 aspect-[1440/900]">
        {/* Stacked, not swapped: a swap unmounts the incoming image's decode and shows a
            blank frame for a beat on a slow connection. */}
        <Image
          src="/shots/work-light.png"
          data-shot="hi"
          alt="The worker's screen in colour: the Act now hero is tinted red, Up next rows carry an amber clock, and the tier bands descend in weight."
          width={2160}
          height={1350}
          priority
          sizes="(max-width: 1120px) 100vw, 1088px"
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-500 ease-(--ease-out)",
            mode === "hi" ? "opacity-100" : "opacity-0",
          )}
        />
        <Image
          src="/shots/work-wire.png"
          data-shot="wire"
          alt="The same screen in wire mode: no colour anywhere, and the same four tiers still read from shape, label, position and size."
          width={2160}
          height={1350}
          priority
          sizes="(max-width: 1120px) 100vw, 1088px"
          aria-hidden={mode !== "wire"}
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-500 ease-(--ease-out)",
            mode === "wire" ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      <p id={captionId} className="t-site-mono mt-4 text-(--site-text-3)" aria-live="polite">
        {MODES.find((m) => m.id === mode)!.caption}
      </p>
    </div>
  );
}
