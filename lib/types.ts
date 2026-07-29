export type StudyLevel = 'high_school' | 'diploma' | 'undergraduate' | 'masters' | 'phd'
export type StudentCategory = 'international' | 'permanent_resident' | 'citizen' | 'all'

export const CANADIAN_PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
] as const

export type Province = typeof CANADIAN_PROVINCES[number]

export interface Scholarship {
  id: string
  name: string
  provider: string
  university: string | null
  description: string
  eligibility_criteria: string[]
  deadline: string | null
  deadline_display: string | null
  amount: string | null
  url: string
  source_domain: string
  levels: StudyLevel[]
  categories: StudentCategory[]
  province: string | null
  is_ra_ta: boolean
  page_last_updated: string | null
  last_scraped_at: string
  is_active: boolean
  created_at: string
}

export interface ScholarshipFilters {
  level?: StudyLevel | 'all'
  category?: StudentCategory | 'all'
  province?: Province | 'all'
  page?: number
}

export const LEVEL_LABELS: Record<StudyLevel | 'all', string> = {
  all: 'All Levels',
  high_school: 'High School',
  diploma: 'Diploma',
  undergraduate: 'Undergraduate',
  masters: 'Masters / PhD',
  phd: 'PhD',
}

export const CATEGORY_LABELS: Record<StudentCategory, string> = {
  all: 'All Students',
  international: 'International Student',
  permanent_resident: 'Permanent Resident',
  citizen: 'Canadian Citizen',
}
