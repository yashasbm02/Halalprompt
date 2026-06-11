import { cn } from '../../lib/utils'

interface NativeSelectProps {
  id?: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export function NativeSelect({ id, options, value, onChange, error }: NativeSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-lg border bg-white px-3 py-2.5 pr-8 text-sm text-gray-900 transition-colors sm:py-2',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500',
          !value && 'text-gray-400',
          error
            ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-300',
        )}
      >
        <option value="" disabled>
          Select an option…
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}
