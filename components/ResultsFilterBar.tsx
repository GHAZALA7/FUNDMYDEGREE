'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { StudyLevel, StudentCategory, Province } from '@/lib/types'
import { CANADIAN_PROVINCES } from '@/lib/types'

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
  const currentProvince = (searchParams.get('province') ?? 'all') as Province | 'all'

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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-2">

        {/* Row 1: Level + Category */}
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

        {/* Row 2: Province */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4b5563] whitespace-nowrap">Province:</span>
          <div className="relative">
            <select
              value={currentProvince}
              onChange={(e) => update('province', e.target.value)}
              className="appearance-none rounded-full border border-[#2a2a2a] bg-[#1a1a1a] pl-3 pr-8 py-1 text-xs font-medium text-white focus:border-[#f97316]/50 focus:outline-none cursor-pointer"
              style={{ borderColor: currentProvince !== 'all' ? 'rgba(249,115,22,0.6)' : undefined, color: currentProvince !== 'all' ? '#f97316' : undefined }}
            >
              <option value="all">All Provinces & Territories</option>
              {CANADIAN_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280] text-xs">▾</div>
          </div>
          {currentProvince !== 'all' && (
            <span className="text-xs text-[#4b5563]">
              Showing national + {currentProvince} scholarships
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
