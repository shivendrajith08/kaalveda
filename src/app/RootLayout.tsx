import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { PageLoader } from '@/components/ui/PageLoader'
import { SageGuide } from '@/features/guide/SageGuide'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Nav />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CommandPalette />
      <SageGuide />
    </div>
  )
}
