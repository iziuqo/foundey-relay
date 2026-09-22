import { useState, type RefObject } from 'react'
import { Popover } from './Popover'
import { Button } from './Button'
import { useStore } from '../state/store'
import { nextCutoff } from '../lib/selectors'
import { formatClock } from '../lib/time'
import { copy, t } from '../copy'

interface PopoverProps {
  open: boolean
  onClose: () => void
  itemId: string
  anchorRef: RefObject<HTMLElement>
}

function RadioGroup({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-[14px] text-n-900 cursor-pointer">
          <input type="radio" name="popover-radio" checked={value === opt} onChange={() => onChange(opt)} />
          {opt}
        </label>
      ))}
    </div>
  )
}

export function HelpPopover({ open, onClose, itemId, anchorRef }: PopoverProps) {
  const { dispatch } = useStore()
  const [reason, setReason] = useState<string>(copy.help.options[0])
  const [note, setNote] = useState('')

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} width={300}>
      <div className="text-[14px] font-semibold text-n-900 mb-3">{copy.help.title}</div>
      <RadioGroup options={copy.help.options} value={reason} onChange={setReason} />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={copy.help.note}
        rows={2}
        className="w-full mt-3 p-2 rounded-sm border border-n-200 text-[13px] outline-none focus-visible:border-focus resize-none"
      />
      <Button
        variant="primary"
        size="md"
        className="w-full mt-3"
        onClick={() => {
          dispatch({ type: 'ASK_HELP', itemId })
          onClose()
        }}
      >
        {copy.help.send}
      </Button>
    </Popover>
  )
}

export function WaitingPopover({ open, onClose, itemId, anchorRef }: PopoverProps) {
  const { dispatch, now } = useStore()
  const [who, setWho] = useState('')
  const cutoff = nextCutoff(now)

  function commitAt(checkBackAt: Date) {
    if (!who.trim()) return
    dispatch({ type: 'WAITING', itemId, waitingOn: who.trim(), checkBackAt: checkBackAt.toISOString() })
    setWho('')
    onClose()
  }

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} width={300}>
      <div className="text-[14px] font-semibold text-n-900 mb-2">{copy.waitingPopover.who}</div>
      <input
        list="waiting-suggestions"
        value={who}
        onChange={(e) => setWho(e.target.value)}
        className="w-full h-9 px-2 rounded-sm border border-n-200 text-[13px] outline-none focus-visible:border-focus mb-1"
        placeholder={copy.waitingPopover.suggestions[0]}
      />
      <datalist id="waiting-suggestions">
        {copy.waitingPopover.suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <div className="text-[13px] font-medium text-n-600 mt-3 mb-2">{copy.waitingPopover.checkBack}</div>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" size="sm" onClick={() => commitAt(new Date(now.getTime() + 30 * 60000))}>
          {copy.waitingPopover.in30}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => commitAt(new Date(now.getTime() + 60 * 60000))}>
          {copy.waitingPopover.in1h}
        </Button>
        {cutoff && (
          <Button variant="secondary" size="sm" onClick={() => commitAt(new Date(new Date(cutoff.departsAt).getTime() - 30 * 60000))}>
            {t(copy.waitingPopover.atCutoff, { hhmm: formatClock(new Date(new Date(cutoff.departsAt).getTime() - 30 * 60000)) })}
          </Button>
        )}
      </div>
    </Popover>
  )
}

export function NotMinePopover({ open, onClose, itemId, anchorRef }: PopoverProps) {
  const { dispatch } = useStore()
  const [reason, setReason] = useState<string>(copy.notMineReasons[0])

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} width={280}>
      <div className="text-[14px] font-semibold text-n-900 mb-3">{copy.actions.notMine}</div>
      <RadioGroup options={copy.notMineReasons} value={reason} onChange={setReason} />
      <Button
        variant="primary"
        size="md"
        className="w-full mt-3"
        onClick={() => {
          dispatch({ type: 'NOT_MINE', itemId })
          onClose()
        }}
      >
        {copy.actions.notMine}
      </Button>
    </Popover>
  )
}

export function MoveLaterPopover({ open, onClose, itemId, anchorRef }: PopoverProps) {
  const { dispatch, now } = useStore()
  const [pickTime, setPickTime] = useState('')

  function commit(snoozeUntil: Date) {
    dispatch({ type: 'MOVE_LATER', itemId, snoozeUntil: snoozeUntil.toISOString() })
    onClose()
  }

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} width={260}>
      <div className="text-[14px] font-semibold text-n-900 mb-3">{copy.actions.later}</div>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" size="sm" onClick={() => commit(new Date(now.getTime() + 60 * 60000))}>
          {copy.moveLaterOptions.in1h}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const target = new Date(now)
            target.setHours(12, 30, 0, 0)
            commit(target)
          }}
        >
          {copy.moveLaterOptions.afterLunch}
        </Button>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={pickTime}
            onChange={(e) => setPickTime(e.target.value)}
            className="h-9 px-2 rounded-sm border border-n-200 text-[13px] flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            disabled={!pickTime}
            onClick={() => {
              const [h, m] = pickTime.split(':').map(Number)
              const target = new Date(now)
              target.setHours(h, m, 0, 0)
              commit(target)
            }}
          >
            {copy.moveLaterOptions.pick}
          </Button>
        </div>
      </div>
    </Popover>
  )
}
