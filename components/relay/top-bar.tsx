import { RelayMark } from "./mark";
import { copy } from "@/lib/copy";
import { DemoMenu } from "./demo-menu";

/** §5 / §6.6: the mark shows only below the full sidebar (1280+ carries its own). The
 * demo chip doubles as the persona switcher and the rest of the demo controls. */
export function TopBar() {
  return (
    <header className="flex h-(--size-control-lg) shrink-0 items-center justify-between gap-3 border-b border-(--border-1) px-4 xl:px-6">
      <div className="flex items-center gap-2 xl:hidden">
        <RelayMark className="size-6" />
        <span className="text-(length:--text-body) font-semibold text-(--text-1)">{copy.appName}</span>
      </div>
      <div className="hidden flex-1 xl:block" />
      <DemoMenu />
    </header>
  );
}
