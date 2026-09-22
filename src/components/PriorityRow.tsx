import type { CSSProperties } from 'react'
import { PriorityIcon } from './PriorityIcon'
import { TimePill } from './TimePill'
import { SourceTag } from './SourceTag'
import { Chip } from './Chip'
import { Button } from './Button'
import { useIsHandheld } from '../lib/useViewport'
import { copy } from '../copy'
import type { Item, Tier } from '../lib/types'

interface Props {
  item: Item
  now: Date
  tier: Tier
  selected?: boolean
  isNew?: boolean
  causeOverride?: string
  onOpen: () => void
  onStart: () => void
  onDone: () => void
  readOnly?: boolean
  actionOverride?: { label: string; onClick: () => void }
}

const TIER_BG: Partial<Record<Tier, string>> = { now: 'var(--now-bg)' }
const TIER_RAIL: Partial<Record<Tier, string>> = { now: 'var(--now-solid)', next: 'var(--next-rail)' }

export function PriorityRow({ item, now, tier, selected, isNew, causeOverride, onOpen, onStart, onDone, readOnly, actionOverride }: Props) {
  const handheld = useIsHandheld()
  const bg = TIER_BG[tier] ?? 'var(--n-0)'
  const rail = TIER_RAIL[tier]
  const style: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '24px 1fr auto auto',
    gridTemplateRows: 'auto auto',
    columnGap: 12,
    rowGap: 2,
    minHeight: handheld ? 72 : 64,
    padding: '12px 16px',
    background: bg,
    boxShadow: rail ? `inset 3px 0 0 ${rail}` : undefined,
    cursor: 'pointer',
  }
  if (selected) style.background = 'var(--accent-bg)'

  const cause = causeOverride ?? item.cause
  const accessibleName = `${item.title}. ${cause}`

  return (
    <li
      style={style}
      className={`group relative transition-colors duration-hover hover:bg-n-25 ${tier === 'now' ? 'hover:bg-now-bg-hover' : ''}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={accessibleName}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen()
      }}
    >
      {isNew && <span className="absolute left-1 top-1 w-1.5 h-1.5 rounded-full bg-now-solid" aria-hidden="true" />}
      {selected && <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: 'var(--accent)' }} aria-hidden="true" />}
      <div style={{ gridColumn: 1, gridRow: '1 / span 2' }} className="pt-0.5">
        <PriorityIcon tier={tier} size={16} />
      </div>
      <div style={{ gridColumn: 2, gridRow: 1 }} className="min-w-0 flex items-center gap-2">
        <span className={`truncate text-[15px] leading-[22px] ${tier === 'later' ? 'font-normal' : 'font-medium'} text-n-900`}>
          {item.title}
        </span>
        {item.status === 'in_progress' && <Chip tone="accent">{copy.chips.workingOnIt}</Chip>}
        {item.helpAsked && <Chip tone="next">{copy.help.chip}</Chip>}
      </div>
      <div style={{ gridColumn: 3, gridRow: 1 }} className="flex items-center">
        <TimePill dueAt={item.dueAt} now={now} tier={tier} size="sm" />
      </div>
      <div style={{ gridColumn: 4, gridRow: '1 / span 2' }} className="flex items-center">
        {actionOverride ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              actionOverride.onClick()
            }}
          >
            {actionOverride.label}
          </Button>
        ) : (
          !readOnly &&
          (item.status === 'in_progress' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDone()
              }}
            >
              {copy.actions.done}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onStart()
              }}
            >
              {copy.actions.start}
            </Button>
          ))
        )}
      </div>
      <div style={{ gridColumn: 2, gridRow: 2 }} className="min-w-0">
        <span className="truncate block text-[13px] leading-[18px] text-n-500">{cause}</span>
      </div>
      <div style={{ gridColumn: 3, gridRow: 2 }} className="flex items-center justify-end">
        <SourceTag source={item.source} />
      </div>
    </li>
  )
}
