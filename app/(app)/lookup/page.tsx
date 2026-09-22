"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { copy } from "@/lib/copy";
import { CommandMenuBody } from "@/components/relay/command-palette";

/** §6.5: the handheld target for ⌘K / the top bar search — a full page instead of a
 * dialog below the desktop shell's breakpoint, reusing the exact same `CommandMenuBody`
 * (same groups, same actions) as the desktop palette. */
export default function LookupPage() {
  const router = useRouter();
  return (
    <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col">
      <h1 className="sr-only">{copy.nav.lookup}</h1>
      <Command shouldFilter loop label={copy.palette.title} className="flex flex-col">
        {/* onDone is a no-op here — there's no dialog to dismiss on a full page; a row
            that navigates (recent/items) already leaves via onNavigate, and a row that
            doesn't (an action) just leaves its effect applied in place. */}
        <CommandMenuBody onNavigate={(href) => router.push(href)} onDone={() => {}} />
      </Command>
    </div>
  );
}
