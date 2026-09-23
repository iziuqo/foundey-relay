import type { Metadata } from "next";
import { DeckPrint } from "@/components/deck/deck-print";

export const metadata: Metadata = {
  title: "Relay — deck (print)",
};

export default function DeckPrintPage() {
  return <DeckPrint />;
}
