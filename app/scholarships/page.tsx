import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ResultsFilterBar from '@/components/ResultsFilterBar'
import ScholarshipCard from '@/components/ScholarshipCard'
import { getScholarships } from '@/lib/scholarships'
import type { StudyLevel, StudentCategory, Province } from '@/lib/types'
import { LEVEL_LABELS, CATEGORY_LABELS } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ level?: string; category?: string; province?: string; page?: string }>
}

async function ScholarshipResults({ searchParams }: PageProps) {
  const params = await searchParams
  const level = (params.level ?? 'all') as StudyLevel | 'all'
  const category = (params.category ?? 'all') as StudentCategory
  const province = (params.province ?? 'all') as Province | 'all'
  const page = parseInt(params.page ?? '1', 10)

  const { data, count, error } = await getScholarships({ level, category, province, page })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-[#9ca3af]">Something went wrong loading scholarships.</p>
        <p className="mt-2 text-sm text-[#4b5563]">{error}</p>
        <Link href="/" className="mt-6 text-sm text-[#f97316] hover:underline">
          ← Back to home
        </Link>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 text-5xl">🎓</div>
        <p className="text-xl font-semibold text-white">No scholarships found</p>
        <p className="mt-2 text-[#6b7280]">
          Try adjusting your filters or{' '}
          <Link href="/scholarships" className="text-[#f97316] hover:underline">
            browse all scholarships
          </Link>
        </p>
      </div>
    )
  }

  const activeFilters = [
    level !== 'all' ? LEVEL_LABELS[level] : null,
    category !== 'all' ? CATEGORY_LABELS[category] : null,
    province !== 'all' ? province : null,
  ].filter(Boolean)

  const buildPageUrl = (p: number) => {
    const q = new URLSearchParams()
    if (level !== 'all') q.set('level', level)
    if (category !== 'all') q.set('category', category)
    if (province !== 'all') q.set('province', province)
    if (p > 1) q.set('page', String(p))
    return `/scholarships?${q.toString()}`
  }

  return (
    <div>
      {/* results header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            {count} scholarship{count !== 1 ? 's' : ''} found
          </p>
          {activeFilters.length > 0 && (
            <p className="mt-1 text-sm text-[#6b7280]">
              Filtered by: {activeFilters.join(' · ')}
            </p>
          )}
        </div>
        <p className="hidden text-sm text-[#4b5563] sm:block">
          Sorted by deadline (soonest first)
        </p>
      </div>

      {/* grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((scholarship) => (
          <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
        ))}
      </div>

      {/* RA/TA note */}
      <div className="mt-10 rounded-xl border border-[#1f1f1f] bg-[#111111] p-4 text-sm text-[#6b7280]">
        <span className="font-semibold text-[#9ca3af]">💡 RA / TA Opportunities:</span>{' '}
        Research Assistantships and Teaching Assistantships are also listed above (look for the{' '}
        <span className="rounded-full bg-purple-900/30 border border-purple-700/30 px-2 py-0.5 text-xs text-purple-400">
          RA / TA
        </span>{' '}
        tag). These are competitive paid positions — visit each university&apos;s graduate department
        for application instructions.
      </div>

      {/* pagination */}
      {count > 12 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1)}
              className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#9ca3af] hover:border-[#f97316]/40 hover:text-white"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-[#4b5563]">
            Page {page} of {Math.ceil(count / 12)}
          </span>
          {page < Math.ceil(count / 12) && (
            <Link
              href={buildPageUrl(page + 1)}
              className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#9ca3af] hover:border-[#f97316]/40 hover:text-white"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default function ScholarshipsPage({ searchParams }: PageProps) {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <ResultsFilterBar />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl border border-[#1f1f1f] bg-[#111111]"
                />
              ))}
            </div>
          }
        >
          <ScholarshipResults searchParams={searchParams} />
        </Suspense>
      </main>
      <footer className="border-t border-[#1f1f1f] py-6 text-center text-sm text-[#4b5563]">
        <p>
          FundMyDegree &bull; Data updated weekly from public sources &bull;{' '}
          <Link href="/" className="text-[#f97316] hover:underline">
            ← Back to home
          </Link>
        </p>
      </footer>
    </>
  )
}
