import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { PageTransition } from '@/components/layout/PageTransition'
import { AmbienceVeil } from '@/components/layout/AmbienceVeil'
import { SageGuide } from '@/features/guide/SageGuide'

export function RootLayout() {
  return (
    <>
      {/* Time-of-day atmosphere — fixed, behind everything below. */}
      <AmbienceVeil />
      {/* The content shell is lifted above the veil so text never sits over it. */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <ScrollToTop />
        <Nav />
        <main className="flex-1">
          <PageTransition />
        </main>
        <Footer />
        <CommandPalette />
        <SageGuide />
      </div>
    </>
  )
}
