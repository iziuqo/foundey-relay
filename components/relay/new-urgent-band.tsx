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
 * (M1's shared-layout FLIP) happens on "Show me" or after 8s idle. M4: slides down 40px
 * with a one-time glow sweep across the border; reduced motion just fades in (§7.2).
 */
export function NewUrgentBand({ title, onShowMe }: NewUrgentBandProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.base}
      className="glow-sweep relative mb-3 flex items-center justify-between gap-3 overflow-hidden rounded-(--radius-control) border border-(--accent) bg-(--surface-2) px-3 py-2"
    >
      <p className="text-(length:--text-meta) text-(--text-1)">{t(copy.newUrgent, { title })}</p>
      <Button size="sm" variant="secondary" onClick={onShowMe}>
        {copy.actions.showMe}
      </Button>
    </motion.div>
  );
}
