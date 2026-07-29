import { getSupabase } from './supabase'
import type { Scholarship, ScholarshipFilters, StudyLevel, StudentCategory, Province } from './types'

const PAGE_SIZE = 12

export async function getScholarships(filters: ScholarshipFilters): Promise<{
  data: Scholarship[]
  count: number
  error: string | null
}> {
  const { level, category, province, page = 1 } = filters
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  try {
    const supabase = getSupabase()

    let query = supabase
      .from('scholarships')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('deadline', { ascending: true, nullsFirst: false })
      .range(from, to)

    if (level && level !== 'all') {
      query = query.contains('levels', [level as StudyLevel])
    }

    if (category && category !== 'all') {
      query = query.or(`categories.cs.{"${category}"},categories.cs.{"all"}`)
    }

    // Province filter: show national scholarships (province IS NULL) + selected province
    if (province && province !== 'all') {
      query = query.or(`province.is.null,province.eq.${province}`)
    }

    const { data, count, error } = await query

    if (error) {
      return { data: [], count: 0, error: error.message }
    }

    return { data: data as Scholarship[], count: count ?? 0, error: null }
  } catch (err) {
    return { data: [], count: 0, error: String(err) }
  }
}
