import Link from "next/link";
import { motion } from "motion/react";
import { copy, t } from "@/lib/copy";
import { transition } from "@/lib/motion";

export interface AllClearProps {
  doneToday: number;
}

/** §2.2 / §6.1: the finish line. One large sentence, what got done today, and a hint
 * pill — the aurora gradient is the one place v1's rejected eye candy comes back,
 * because this screen is rare and never competes with ranking. A simple fade (no
 * shared layoutId — nothing here needs to bridge to a queue row) covers its entrance
 * and exit against the hero it swaps with in work/page.tsx's AnimatePresence. */
export function AllClear({ doneToday }: AllClearProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition.base}
      className="aurora flex min-h-96 flex-col items-center justify-center gap-3 rounded-(--radius-hero) border border-(--border-1) bg-(--surface-1) px-6 py-16 text-center">
      <p className="text-(length:--text-display) leading-(length:--leading-display) font-semibold text-(--text-1)">
        {copy.allClear.title}
      </p>
      <p className="max-w-md text-(length:--text-body) text-(--text-2)">{copy.allClear.body}</p>
      <p className="tnum text-(length:--text-meta) text-(--text-2)">{t(copy.allClear.meta, { n: doneToday })}</p>
      <span className="mt-2 rounded-full border border-(--border-1) bg-(--surface-2) px-3 py-1 text-(length:--text-meta) text-(--text-2)">
        {copy.allClear.hint}
      </span>
      <div className="mt-2 flex gap-4 text-(length:--text-meta) font-medium text-(--accent)">
        <Link href="/team" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus) rounded-(--radius-control)">
          {copy.allClear.team}
        </Link>
        <Link href="/updates" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus) rounded-(--radius-control)">
          {copy.allClear.updates}
        </Link>
      </div>
    </motion.div>
  );
}
