'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { StudyLevel, StudentCategory } from '@/lib/types'

const LEVELS: { value: StudyLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'masters', label: 'Masters / PhD' },
]

const CATEGORIES: { value: StudentCategory; label: string }[] = [
  { value: 'all', label: 'All Students' },
  { value: 'international', label: 'International' },
  { value: 'permanent_resident', label: 'Permanent Resident' },
  { value: 'citizen', label: 'Canadian Citizen' },
]

export default function ResultsFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentLevel = (searchParams.get('level') ?? 'all') as StudyLevel | 'all'
  const currentCategory = (searchParams.get('category') ?? 'all') as StudentCategory

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/scholarships?${params.toString()}`)
  }

  return (
    <div className="sticky top-16 z-40 border-b border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur-md py-3">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">Level:</span>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update('level', value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  currentLevel === value
                    ? 'border-[#f97316] bg-[#f97316]/15 text-[#f97316]'
                    : 'border-[#2a2a2a] text-[#6b7280] hover:border-[#f97316]/40 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden h-4 w-px bg-[#2a2a2a] sm:block" />

          <span className="text-xs font-semibold uppercase tracking-wider text-[#4b5563]">You are:</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update('category', value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  currentCategory === value
                    ? 'border-[#f97316] bg-[#f97316]/15 text-[#f97316]'
                    : 'border-[#2a2a2a] text-[#6b7280] hover:border-[#f97316]/40 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}