import { motion } from "motion/react";
import { copy, t } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { transition } from "@/lib/motion";

export interface NewUrgentBandProps {
  title: string;
  onShowMe: () => void;
}

/**
 * §6.1 "New urgent arrival" / §8.4: while the user is active, a higher-ranked item that
 * just arrived doesn't unseat the hero on its own — it shows here instead, and the swap
 * (M1's shared-layout FLIP) happens on "Show me" or after 8s idle.
 *
 * M9: a 48px band slides down inside the hero over 260ms and the border runs one glow
 * sweep, left to right — **once, ever, per arrival**, which is the failure mode the
 * catalog names for this moment. Reduced motion keeps the band and drops the sweep: the
 * band is the information, the sweep is the decoration.
 */
export function NewUrgentBand({ title, onShowMe }: NewUrgentBandProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.band}
      className="glow-sweep relative mb-3 flex items-center justify-between gap-3 overflow-hidden rounded-(--radius-control) border border-(--accent) bg-(--surface-2) px-3 py-2"
    >
      <p className="text-(length:--text-meta) text-(--text-1)">{t(copy.newUrgent, { title })}</p>
      <Button size="sm" variant="secondary" onClick={onShowMe}>
        {copy.actions.showMe}
      </Button>
    </motion.div>
  );
}
