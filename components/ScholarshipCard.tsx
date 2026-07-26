import type { Scholarship } from '@/lib/types'
import { LEVEL_LABELS, CATEGORY_LABELS } from '@/lib/types'
import { ExternalLink, Calendar, DollarSign, Clock } from 'lucide-react'

interface Props {
  scholarship: Scholarship
}

function formatDeadline(deadline: string | null, display: string | null): string {
  if (display) return display
  if (!deadline) return 'Rolling / No deadline'
  const d = new Date(deadline)
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

function isExpiringSoon(deadline: string | null): boolean {
  if (!deadline) return false
  const diff = new Date(deadline).getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
}

export default function ScholarshipCard({ scholarship }: Props) {
  const expiringSoon = isExpiringSoon(scholarship.deadline)

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 transition-all hover:border-[#f97316]/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.08)]">
      {/* orange left accent */}
      <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-[#f97316]/30 group-hover:bg-[#f97316]/70 transition-colors" />

      {/* top badges */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {scholarship.levels.map((lvl) => (
          <span
            key={lvl}
            className="rounded-full bg-[#1a1a1a] border border-[#2a2a2a] px-2.5 py-0.5 text-xs font-medium text-[#9ca3af]"
          >
            {LEVEL_LABELS[lvl]}
          </span>
        ))}
        {scholarship.categories
          .filter((c) => c !== 'all')
          .map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-[#f97316]/10 border border-[#f97316]/20 px-2.5 py-0.5 text-xs font-medium text-[#f97316]"
            >
              {CATEGORY_LABELS[cat]}
            </span>
          ))}
        {scholarship.is_ra_ta && (
          <span className="rounded-full bg-purple-900/30 border border-purple-700/30 px-2.5 py-0.5 text-xs font-medium text-purple-400">
            RA / TA
          </span>
        )}
        {expiringSoon && (
          <span className="rounded-full bg-red-900/30 border border-red-700/30 px-2.5 py-0.5 text-xs font-medium text-red-400">
            Closing soon
          </span>
        )}
      </div>

      {/* title */}
      <h3 className="mb-1 text-lg font-bold leading-snug text-white group-hover:text-[#f97316] transition-colors">
        {scholarship.name}
      </h3>

      {/* provider */}
      <p className="mb-4 text-sm text-[#6b7280]">
        {scholarship.provider}
        {scholarship.university && scholarship.university !== scholarship.provider && (
          <> &bull; {scholarship.university}</>
        )}
        {scholarship.province && <> &bull; {scholarship.province}</>}
      </p>

      {/* amount + deadline */}
      <div className="mb-4 flex flex-wrap gap-4">
        {scholarship.amount && (
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="h-4 w-4 text-[#f97316]" />
            <span className="font-semibold text-white">{scholarship.amount}</span>
          </div>
        )}
        <div className={`flex items-center gap-1.5 text-sm ${expiringSoon ? 'text-red-400' : 'text-[#9ca3af]'}`}>
          <Calendar className="h-4 w-4" />
          <span>{formatDeadline(scholarship.deadline, scholarship.deadline_display)}</span>
        </div>
      </div>

      {/* eligibility */}
      {scholarship.eligibility_criteria.length > 0 && (
        <div className="mb-4 flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#4b5563]">
            Eligibility
          </p>
          <ul className="space-y-1">
            {scholarship.eligibility_criteria.slice(0, 3).map((criterion, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#f97316]/60" />
                {criterion}
              </li>
            ))}
            {scholarship.eligibility_criteria.length > 3 && (
              <li className="text-xs text-[#4b5563]">
                +{scholarship.eligibility_criteria.length - 3} more criteria on the scholarship page
              </li>
            )}
          </ul>
        </div>
      )}

      {/* footer */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
        {scholarship.page_last_updated ? (
          <div className="flex items-center gap-1 text-xs text-[#4b5563]">
            <Clock className="h-3 w-3" />
            <span>Page updated: {scholarship.page_last_updated}</span>
          </div>
        ) : (
          <span />
        )}

        <a
          href={scholarship.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 px-3 py-1.5 text-sm font-semibold text-[#f97316] transition-all hover:bg-[#f97316] hover:text-white"
        >
          View Scholarship
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}