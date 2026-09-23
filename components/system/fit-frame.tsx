"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Shows a live component at a fixed design width, scaled down to whatever column it has
 * been given. The filmstrip on /system/patterns needs four full-width hero cards side by
 * side, and redrawing them at a smaller size would stop them being the real thing; this
 * renders the real thing at 720px and shrinks the picture, not the component.
 *
 * A frame is a picture, so it is `inert` by default — four copies of the hero's buttons
 * in the tab order would be four copies of the hero's buttons in the tab order.
 */
export function FitFrame({
  designWidth,
  frozen = true,
  children,
}: {
  designWidth: number;
  frozen?: boolean;
  children: React.ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => {
      const width = outer.current?.clientWidth ?? designWidth;
      const next = Math.min(1, width / designWidth);
      setScale(next);
      setHeight(inner.current ? inner.current.offsetHeight * next : undefined);
    };
    const observer = new ResizeObserver(measure);
    if (outer.current) observer.observe(outer.current);
    if (inner.current) observer.observe(inner.current);
    measure();
    return () => observer.disconnect();
  }, [designWidth]);

  return (
    <div
      ref={outer}
      inert={frozen || undefined}
      aria-hidden={frozen || undefined}
      className={cn("relative w-full overflow-hidden", frozen && "frozen-frame")}
      // eslint-disable-next-line react/forbid-dom-props -- geometry measured from the frame's own content
      style={{ height }}
    >
      <div
        ref={inner}
        className="origin-top-left"
        // eslint-disable-next-line react/forbid-dom-props -- geometry measured from the frame's own column
        style={{ width: designWidth, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
