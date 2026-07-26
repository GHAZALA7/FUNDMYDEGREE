import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'FundMyDegree — Find Scholarships in Canada',
  description:
    'Discover scholarships, grants, and research opportunities for students studying in Canada. Filter by study level and student category. Free, no account needed.',
  keywords: ['Canada scholarships', 'student funding', 'university grants', 'RA TA opportunities', 'international student scholarships Canada'],
  openGraph: {
    title: 'FundMyDegree — Find Scholarships in Canada',
    description: 'Stop searching. Start applying. Find all Canadian scholarships in one place.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
