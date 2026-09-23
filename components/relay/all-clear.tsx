import Link from "next/link";
import { motion } from "motion/react";
import { copy, t } from "@/lib/copy";
import { duration, stagger, stepDelay, transition } from "@/lib/motion";
import { formatClock } from "@/lib/time";
import { FOCUS } from "@/components/ui/sizing";
import type { DoneEntry } from "@/lib/types";

export interface AllClearProps {
  done: DoneEntry[];
  /** See hero.tsx: `popLayout` measures the outgoing child through this ref, and a
   *  function component that drops it turns the whole mode into a no-op. */
  ref?: React.Ref<HTMLDivElement>;
}

const MAX_LISTED = 8;

/** §2.2 / §5.4: the finish line — the aurora, one 40px sentence, and what got done
 * today, not a count of it. The aurora gradient is the one place v1's rejected eye
 * candy comes back, because this screen is rare and never competes with ranking. A
 * simple fade (no shared layoutId — nothing here needs to bridge to a queue row) covers
 * its entrance and exit against the hero it swaps with in work/page.tsx's
 * AnimatePresence.
 *
 * M17 is three beats, and they are deliberately slow — this is the one screen in the
 * app that is allowed to take its time, because reaching it means there is nothing left
 * to do. The aurora fades up over 900ms; the headline rises 12px behind it, starting
 * once the light is already there; the day's work lists itself 40ms at a time, oldest
 * beat last. **No confetti** — this is somebody's job, at the end of a nine-hour shift,
 * and a workplace tool that throws a party at them has misread the moment. */
export function AllClear({ done, ref }: AllClearProps) {
  const listed = [...done]
    .sort((a, b) => new Date(b.doneAt).getTime() - new Date(a.doneAt).getTime())
    .slice(0, MAX_LISTED);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // The aurora takes 900ms to arrive and 140ms to go. Inheriting `slow` for both put
      // the exit at 900ms on the *entrance* curve — over the catalog's 700ms ceiling, and
      // long enough that undoing the last completion showed the finish line still fading
      // behind the card that had replaced it.
      exit={{ opacity: 0, transition: transition.exit }}
      transition={transition.slow}
      className="aurora flex min-h-96 flex-col items-center gap-6 rounded-(--r-5) border border-(--line-1) bg-(--surface-1) px-6 py-16 text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition.move, delay: duration.fill }}
        className="t-finish text-(--text-1)"
      >
        {copy.allClear.title}
      </motion.p>

      {listed.length > 0 ? (
        <div className="w-full max-w-md text-left">
          <p className="tnum t-meta text-(--text-2)">{t(copy.allClear.meta, { n: done.length })}</p>
          <ul className="mt-2 flex flex-col divide-y divide-(--line-1) rounded-(--r-4) border border-(--line-1) bg-(--surface-2)">
            {listed.map((entry, index) => (
              <motion.li
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...transition.base,
                  delay: duration.fill + stepDelay(index, stagger.allClear),
                }}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="t-body min-w-0 truncate text-(--text-1)">{entry.title}</span>
                <span className="tnum t-meta shrink-0 text-(--text-2)">{formatClock(new Date(entry.doneAt))}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="max-w-md t-body text-(--text-2)">{copy.allClear.hint}</p>
      )}

      <div className="flex gap-4 t-meta font-medium text-(--accent)">
        <Link href="/team" className={cnFocus()}>
          {copy.allClear.team}
        </Link>
        <Link href="/updates" className={cnFocus()}>
          {copy.allClear.updates}
        </Link>
      </div>
    </motion.div>
  );
}

function cnFocus() {
  return `hover:underline rounded-(--r-2) ${FOCUS}`;
}
