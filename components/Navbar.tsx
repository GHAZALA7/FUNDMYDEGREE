import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f97316]">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="text-lg font-bold text-white">
              Fund<span className="text-[#f97316]">My</span>Degree
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-[#6b7280] sm:block">
              Canada &bull; Free &bull; No account needed
            </span>
            <Link
              href="/scholarships"
              className="rounded-full bg-[#f97316] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#ea6c0a]"
            >
              Browse All
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}