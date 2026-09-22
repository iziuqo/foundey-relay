import type { RefObject } from 'react'
import { Popover } from './Popover'

export interface MenuItemDef {
  label: string
  onClick: () => void
  disabled?: boolean
  helperText?: string
}

interface Props {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLElement>
  items: MenuItemDef[]
  align?: 'start' | 'end'
}

export function Menu({ open, onClose, anchorRef, items, align = 'end' }: Props) {
  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} width={240} align={align} className="p-1">
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <button
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return
                item.onClick()
                onClose()
              }}
              className="w-full text-left px-3 py-2 rounded-sm text-[14px] text-n-900 hover:bg-n-75 disabled:text-n-400 disabled:hover:bg-transparent"
            >
              <div>{item.label}</div>
              {item.helperText && <div className="text-[12px] text-n-500">{item.helperText}</div>}
            </button>
          </li>
        ))}
      </ul>
    </Popover>
  )
}
