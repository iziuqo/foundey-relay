import { Package, Cpu, MessageSquare, Truck, UserRound, Boxes, ShieldAlert, ClipboardCheck, HardHat, Info, type LucideIcon } from 'lucide-react'
import { copy } from '../copy'
import type { Source } from '../lib/types'

const SOURCE_ICON: Record<Source, LucideIcon> = {
  order: Package,
  system: Cpu,
  comms: MessageSquare,
  carrier: Truck,
  customer: UserRound,
  inventory: Boxes,
  safety: ShieldAlert,
  compliance: ClipboardCheck,
  floor: HardHat,
  fyi: Info,
}

export function SourceTag({ source }: { source: Source }) {
  const Icon = SOURCE_ICON[source]
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-n-500">
      <Icon size={12} />
      {copy.sourceLabels[source]}
    </span>
  )
}
