"use client";

import { useParams } from "next/navigation";
import { ItemDetailSheet } from "@/components/relay/item-detail-sheet";

/** §8.2: the intercepted version of `/items/[id]` — only matches a client-side
 * transition that started from inside the app shell (a queue row, the hero, the
 * palette). A hard navigation or refresh renders the real page instead (§6.2). */
export default function InterceptedItemModal() {
  const { id } = useParams<{ id: string }>();
  return <ItemDetailSheet id={id} />;
}
