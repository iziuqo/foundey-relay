import { Popover } from './Popover'

export interface MenuItemDef {
  label: string
  onClick: () => void
  disabled?: boolean
  helperText?: string
}

export function Menu({ open, onClose, items, align = 'end' }: { open: boolean; onClose: () => void; items: MenuItemDef[]; align?: 'start' | 'end' }) {
  return (
    <Popover open={open} onClose={onClose} width={240} align={align} anchorClassName="!p-1">
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
