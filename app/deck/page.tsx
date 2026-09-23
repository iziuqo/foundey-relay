import type { Metadata } from "next";
import { DeckShell } from "@/components/deck/deck-shell";

export const metadata: Metadata = {
  title: "Relay — deck",
};

export default function DeckPage() {
  return <DeckShell />;
}
