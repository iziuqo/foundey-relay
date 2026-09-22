"use client";

import { useEffect, useRef, useState } from "react";

/** Reads one computed style property live, re-measuring on resize (type is fluid, §4.3). */
export function useComputedStyle<T extends HTMLElement = HTMLElement>(prop: "fontSize" | "lineHeight" | "height") {
  const ref = useRef<T>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      setValue(getComputedStyle(ref.current)[prop]);
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [prop]);

  return { ref, value };
}
