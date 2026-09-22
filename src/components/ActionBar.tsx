import { useState } from 'react'
import { Hand, Ellipsis } from 'lucide-react'
import { Button } from './Button'
import { Menu } from './Menu'
import { HelpPopover, WaitingPopover, NotMinePopover, MoveLaterPopover } from './ActionPopovers'
import { ReassignPopover } from './ReassignPopover'
import { useStore } from '../state/store'
import { scoreItem } from '../lib/priority'
import { copy } from '../copy'
import type { Item } from '../lib/types'

type ActivePopover = 'help' | 'waiting' | 'notMine' | 'handoff' | 'moveLater' | null

/** Start/Mark done, Ask for help, and the More menu — shared by the hero and the drawer footer. */
export function ActionBar({ item, now, size = 'md', onAfterDone }: { item: Item; now: Date; size?: 'lg' | 'md'; onAfterDone?: () => void }) {
  const { state, dispatch } = useStore()
  const [moreOpen, setMoreOpen] = useState(false)
  const [popover, setPopover] = useState<ActivePopover>(null)

  const tier = scoreItem(item, now).tier
  const moveLaterDisabled = tier === 'now' || item.safety

  function start() {
    dispatch({ type: 'START', itemId: item.id, actorId: state.persona, nowIso: now.toISOString() })
  }
  function done() {
    dispatch({ type: 'DONE', itemId: item.id, nowIso: now.toISOString() })
    onAfterDone?.()
  }

  return (
    <div className="flex items-center gap-2">
      {item.status === 'in_progress' ? (
        <Button variant="primary" size={size === 'lg' ? 'lg' : 'md'} onClick={done}>
          {copy.actions.done}
        </Button>
      ) : (
        <Button variant="primary" size={size === 'lg' ? 'lg' : 'md'} onClick={start}>
          {copy.actions.start}
        </Button>
      )}

      <div className="relative">
        <Button variant="secondary" size="md" icon={Hand} onClick={() => setPopover('help')}>
          {copy.actions.help}
        </Button>
        <HelpPopover open={popover === 'help'} onClose={() => setPopover(null)} itemId={item.id} />
      </div>

      <div className="relative">
        <Button variant="ghost" size="md" icon={Ellipsis} onClick={() => setMoreOpen((o) => !o)}>
          {copy.actions.more}
        </Button>
        <Menu
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          items={[
            { label: copy.actions.waiting, onClick: () => setPopover('waiting') },
            { label: copy.actions.notMine, onClick: () => setPopover('notMine') },
            { label: copy.actions.handOff, onClick: () => setPopover('handoff') },
            {
              label: copy.actions.later,
              onClick: () => setPopover('moveLater'),
              disabled: moveLaterDisabled,
              helperText: moveLaterDisabled ? copy.laterDisabled : undefined,
            },
          ]}
        />
        <WaitingPopover open={popover === 'waiting'} onClose={() => setPopover(null)} itemId={item.id} />
        <NotMinePopover open={popover === 'notMine'} onClose={() => setPopover(null)} itemId={item.id} />
        <ReassignPopover open={popover === 'handoff'} onClose={() => setPopover(null)} itemId={item.id} title={copy.team.reassignTitle} />
        <MoveLaterPopover open={popover === 'moveLater'} onClose={() => setPopover(null)} itemId={item.id} />
      </div>
    </div>
  )
}
