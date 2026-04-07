import { useState } from 'react'
import type { Routine } from '../types'
import { useNaturalSearch } from '../hooks/useNaturalSearch'

const suggestions = [
  'My neck hurts from sleeping wrong',
  'Quick stretch before golf',
  'I\'ve been sitting all day',
  'Loosen up my hips',
  'Can\'t touch my toes',
  'Post-run cooldown',
  'Everything is stiff',
  'Warm up for basketball',
  'Lower back is killing me',
  'I feel old and creaky',
  'Shoulder pain from the gym',
  'Something quick for my legs',
]

interface Props {
  onSelectRoutine: (routine: Routine) => void
  onBack: () => void
}

export function AskView({ onSelectRoutine, onBack }: Props) {
  const [query, setQuery] = useState('')
  const results = useNaturalSearch(query)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          What do you need?
        </h2>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Describe what's going on in your own words.
      </p>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "my lower back hurts" or "warm up for golf"'
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results */}
      {query.length > 0 && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            {results.length} match{results.length !== 1 ? 'es' : ''} found
          </p>
          {results.map((result) => (
            <button
              key={result.routine.id}
              onClick={() => onSelectRoutine(result.routine)}
              className="w-full text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {result.routine.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {result.routine.description}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                    Matched: {result.reason}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {result.routine.durationMinutes}m
                  </span>
                  <span className="text-xs text-slate-400 capitalize">{result.routine.level}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length > 0 && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No matches for that. Try different words.</p>
          <p className="text-xs text-slate-400 mt-1">
            Describe your pain, body area, sport, or what you want to achieve.
          </p>
        </div>
      )}

      {/* Suggestions — show when no query */}
      {!query && (
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Try saying something like...
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
