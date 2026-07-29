'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  { value: 'international', label: 'International Student' },
  { value: 'permanent_resident', label: 'Permanent Resident' },
  { value: 'citizen', label: 'Canadian Citizen' },
]

export default function FilterSection() {
  const router = useRouter()
  const [level, setLevel] = useState<StudyLevel | 'all'>('all')
  const [category, setCategory] = useState<StudentCategory>('all')
  const [province, setProvince] = useState<Province | 'all'>('all')

  function handleFind() {
    const params = new URLSearchParams()
    if (level !== 'all') params.set('level', level)
    if (category !== 'all') params.set('category', category)
    if (province !== 'all') params.set('province', province)
    router.push(`/scholarships?${params.toString()}`)
  }

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-16">
      {/* orange radial glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(249,115,22,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        {/* badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1.5 text-sm text-[#f97316]">
          <span className="h-2 w-2 rounded-full bg-[#f97316] animate-pulse" />
          Updated weekly &bull; Canada 2025
        </div>

        {/* headline */}
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Stop Searching.
          </h1>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#f97316] sm:text-6xl lg:text-7xl">
            Start Applying.
          </h1>
        </div>

        {/* subtext */}
        <p className="max-w-xl text-lg leading-relaxed text-[#9ca3af]">
          We scan hundreds of scholarship pages across Canada so you don&apos;t have to.
          Find scholarships, grants, and research opportunities — free, no account needed.
        </p>

        {/* filter card */}
        <div className="w-full rounded-2xl border border-[#222222] bg-[#111111] p-6 text-left shadow-2xl">

          {/* country row */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium text-[#6b7280]">Country of Study</span>
            <div className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5">
              <span className="text-base">🇨🇦</span>
              <span className="text-sm font-medium text-white">Canada</span>
              <span className="rounded bg-[#f97316]/10 px-1.5 py-0.5 text-xs text-[#f97316]">
                More coming soon
              </span>
            </div>
          </div>

          <div className="h-px bg-[#1f1f1f] mb-5" />

          {/* province */}
          <div className="mb-5">
            <p className="mb-3 text-sm font-medium text-[#6b7280]">Province / Territory</p>
            <div className="relative">
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as Province | 'all')}
                className="w-full appearance-none rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#f97316]/50 focus:outline-none cursor-pointer"
              >
                <option value="all">All Provinces & Territories</option>
                {CANADIAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                ▾
              </div>
            </div>
            {province !== 'all' && (
              <p className="mt-2 text-xs text-[#4b5563]">
                Showing national scholarships + scholarships specific to {province}
              </p>
            )}
          </div>

          <div className="h-px bg-[#1f1f1f] mb-5" />

          {/* level */}
          <div className="mb-5">
            <p className="mb-3 text-sm font-medium text-[#6b7280]">Study Level</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setLevel(value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    level === value
                      ? 'border-[#f97316] bg-[#f97316]/15 text-[#f97316]'
                      : 'border-[#2a2a2a] text-[#9ca3af] hover:border-[#f97316]/50 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#1f1f1f] mb-5" />

          {/* category */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-[#6b7280]">You are a...</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    category === value
                      ? 'border-[#f97316] bg-[#f97316]/15 text-[#f97316]'
                      : 'border-[#2a2a2a] text-[#9ca3af] hover:border-[#f97316]/50 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleFind}
            className="w-full rounded-xl bg-[#f97316] py-3.5 text-base font-bold text-white transition-all hover:bg-[#ea6c0a] active:scale-[0.98]"
          >
            Find Scholarships →
          </button>
        </div>

        {/* RA/TA note */}
        <p className="text-sm text-[#4b5563]">
          💡 Also includes Research Assistant (RA) &amp; Teaching Assistant (TA) opportunities.
          Look for the tag on each listing.
        </p>
      </div>
    </section>
  )
}
