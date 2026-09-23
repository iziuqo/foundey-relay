import Link from "next/link";
import { motion } from "motion/react";
import { copy, t } from "@/lib/copy";
import { transition } from "@/lib/motion";
import { formatClock } from "@/lib/time";
import { FOCUS } from "@/components/ui/sizing";
import type { DoneEntry } from "@/lib/types";

export interface AllClearProps {
  done: DoneEntry[];
}

const MAX_LISTED = 8;

/** §2.2 / §5.4: the finish line — the aurora, one 40px sentence, and what got done
 * today, not a count of it. The aurora gradient is the one place v1's rejected eye
 * candy comes back, because this screen is rare and never competes with ranking. A
 * simple fade (no shared layoutId — nothing here needs to bridge to a queue row) covers
 * its entrance and exit against the hero it swaps with in work/page.tsx's
 * AnimatePresence. */
export function AllClear({ done }: AllClearProps) {
  const listed = [...done]
    .sort((a, b) => new Date(b.doneAt).getTime() - new Date(a.doneAt).getTime())
    .slice(0, MAX_LISTED);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition.base}
      className="aurora flex min-h-96 flex-col items-center gap-6 rounded-(--r-5) border border-(--line-1) bg-(--surface-1) px-6 py-16 text-center"
    >
      <p className="t-finish text-(--text-1)">{copy.allClear.title}</p>

      {listed.length > 0 ? (
        <div className="w-full max-w-md text-left">
          <p className="tnum t-meta text-(--text-2)">{t(copy.allClear.meta, { n: done.length })}</p>
          <ul className="mt-2 flex flex-col divide-y divide-(--line-1) rounded-(--r-4) border border-(--line-1) bg-(--surface-2)">
            {listed.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="t-body min-w-0 truncate text-(--text-1)">{entry.title}</span>
                <span className="tnum t-meta shrink-0 text-(--text-2)">{formatClock(new Date(entry.doneAt))}</span>
              </li>
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
