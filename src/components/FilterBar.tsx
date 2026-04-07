import type { Filters, Goal, Sport, BodyRegion, Level, Duration } from '../types'

const goals: { value: Goal; label: string }[] = [
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'pain-relief', label: 'Pain Relief' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'posture', label: 'Posture' },
  { value: 'warmup', label: 'Warmup' },
  { value: 'cooldown', label: 'Cooldown' },
]

const sports: { value: Sport; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'desk-work', label: 'Desk Work' },
  { value: 'golf', label: 'Golf' },
  { value: 'running', label: 'Running' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'climbing', label: 'Climbing' },
  { value: 'parkour', label: 'Parkour' },
  { value: 'bowling', label: 'Bowling' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'weightlifting', label: 'Weightlifting' },
]

const bodyRegions: { value: BodyRegion; label: string }[] = [
  { value: 'neck', label: 'Neck' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'chest', label: 'Chest' },
  { value: 'upper-back', label: 'Upper Back' },
  { value: 'lower-back', label: 'Lower Back' },
  { value: 'hips', label: 'Hips' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'quads', label: 'Quads' },
  { value: 'calves', label: 'Calves' },
  { value: 'ankles', label: 'Ankles' },
  { value: 'wrists', label: 'Wrists' },
  { value: 'full-body', label: 'Full Body' },
]

const levels: { value: Level; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const durations: { value: Duration; label: string }[] = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
]

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
}

function FilterSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | null
  options: { value: T; label: string }[]
  onChange: (val: T | null) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? (e.target.value as unknown as T) : null)}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function FilterBar({ filters, onChange }: Props) {
  const hasFilters = Object.values(filters).some((v) => v !== null)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <FilterSelect
          label="Goal"
          value={filters.goal}
          options={goals}
          onChange={(goal) => onChange({ ...filters, goal })}
        />
        <FilterSelect
          label="Activity"
          value={filters.sport}
          options={sports}
          onChange={(sport) => onChange({ ...filters, sport })}
        />
        <FilterSelect
          label="Body Area"
          value={filters.bodyRegion}
          options={bodyRegions}
          onChange={(bodyRegion) => onChange({ ...filters, bodyRegion })}
        />
        <FilterSelect
          label="Level"
          value={filters.level}
          options={levels}
          onChange={(level) => onChange({ ...filters, level })}
        />
        <FilterSelect
          label="Duration"
          value={filters.duration}
          options={durations}
          onChange={(val) => onChange({ ...filters, duration: val ? (Number(val) as Duration) : null })}
        />
      </div>
      {hasFilters && (
        <button
          onClick={() =>
            onChange({ goal: null, sport: null, bodyRegion: null, level: null, duration: null })
          }
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
