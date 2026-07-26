import Navbar from '@/components/Navbar'
import FilterSection from '@/components/FilterSection'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <FilterSection />
      </main>
      <footer className="border-t border-[#1f1f1f] py-8 text-center text-sm text-[#4b5563]">
        <p>
          FundMyDegree &bull; Built with ❤️ for students &bull;{' '}
          <span className="text-[#f97316]">Canada</span> &bull; Free forever
        </p>
        <p className="mt-1 text-xs text-[#333333]">
          Scholarship data is scraped from public sources and updated weekly.
          Always verify details on the original scholarship page.
        </p>
      </footer>
    </>
  )
}
