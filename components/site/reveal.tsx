"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A section that fades up the first time it is seen, and never again.
 *
 * The hidden state is applied from script, not from the stylesheet: with the offset in
 * CSS, a visitor whose JavaScript never arrives gets a page of invisible sections. Here
 * the markup renders finished, and `.site-reveal` is only added once this component has
 * mounted and can guarantee it will also be removed.
 *
 * `prefers-reduced-motion` is handled in the stylesheet beside the class rather than
 * read here, so the answer cannot go stale if the setting changes mid-visit.
 */
export function Reveal({
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Already in view on load (the hero, and anything above the fold on a tall screen):
    // arming it would mean a flash of hidden content, so it simply stays finished.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return;

    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(armed && "site-reveal", className)}
      data-shown={armed ? shown : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
