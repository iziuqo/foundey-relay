import { copy, t } from "@/lib/copy";
import { Button } from "@/components/ui/button";

export interface NewUrgentBandProps {
  title: string;
  onShowMe: () => void;
}

/**
 * §6.1 "New urgent arrival" / §8.4: while the user is active, a higher-ranked item that
 * just arrived doesn't unseat the hero on its own — it shows here instead, and the swap
 * (M4/M1's FLIP, phase 6) happens on "Show me" or after 8s idle.
 */
export function NewUrgentBand({ title, onShowMe }: NewUrgentBandProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-(--radius-control) border border-(--accent) bg-(--surface-2) px-3 py-2">
      <p className="text-(length:--text-meta) text-(--text-1)">{t(copy.newUrgent, { title })}</p>
      <Button size="sm" variant="secondary" onClick={onShowMe}>
        {copy.actions.showMe}
      </Button>
    </div>
  );
}
