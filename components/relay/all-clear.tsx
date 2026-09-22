import { copy, t } from "@/lib/copy";

export interface AllClearProps {
  doneToday: number;
}

/** §2.2 / §6.1: the finish line. One large sentence, what got done today, and a hint
 * pill — the aurora gradient is the one place v1's rejected eye candy comes back,
 * because this screen is rare and never competes with ranking. */
export function AllClear({ doneToday }: AllClearProps) {
  return (
    <div className="aurora flex min-h-96 flex-col items-center justify-center gap-3 rounded-(--radius-hero) border border-(--border-1) bg-(--surface-1) px-6 py-16 text-center">
      <p className="text-(length:--text-display) leading-(length:--leading-display) font-semibold text-(--text-1)">
        {copy.allClear.title}
      </p>
      <p className="max-w-md text-(length:--text-body) text-(--text-2)">{copy.allClear.body}</p>
      <p className="tnum text-(length:--text-meta) text-(--text-2)">{t(copy.allClear.meta, { n: doneToday })}</p>
      <span className="mt-2 rounded-full border border-(--border-1) bg-(--surface-2) px-3 py-1 text-(length:--text-meta) text-(--text-2)">
        {copy.allClear.hint}
      </span>
    </div>
  );
}
