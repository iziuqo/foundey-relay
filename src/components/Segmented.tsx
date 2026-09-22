interface Option {
  value: string
  label: string
}

export function Segmented({ options, value, onChange }: { options: Option[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex p-0.5 rounded-md bg-n-75 gap-0.5" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={`h-8 px-3 rounded-sm text-[13px] font-medium transition-colors duration-hover ${
            opt.value === value ? 'bg-n-0 text-n-900 shadow-e1' : 'text-n-500 hover:text-n-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
