import type { ReactNode } from 'react'
import { ThemeProvider } from '@/hooks/useTheme'
import { AmbienceProvider } from '@/hooks/useAmbience'
import { AuthProvider } from '@/hooks/useAuth'
import { BookmarksProvider } from '@/hooks/useBookmarks'
import { CommandPaletteProvider } from '@/hooks/useCommandPalette'

/** Composes every app-wide context provider in dependency order. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AmbienceProvider>
        <AuthProvider>
          <BookmarksProvider>
            <CommandPaletteProvider>{children}</CommandPaletteProvider>
          </BookmarksProvider>
        </AuthProvider>
      </AmbienceProvider>
    </ThemeProvider>
  )
}
