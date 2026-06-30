import type { ReactNode } from 'react'
import { ThemeProvider } from '@/hooks/useTheme'
import { AmbienceProvider } from '@/hooks/useAmbience'
import { AuthProvider } from '@/hooks/useAuth'
import { BookmarksProvider } from '@/hooks/useBookmarks'
import { CommandPaletteProvider } from '@/hooks/useCommandPalette'
import { SoundProvider } from '@/hooks/useSound'

/** Composes every app-wide context provider in dependency order. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AmbienceProvider>
        <AuthProvider>
          <BookmarksProvider>
            <CommandPaletteProvider>
              <SoundProvider>{children}</SoundProvider>
            </CommandPaletteProvider>
          </BookmarksProvider>
        </AuthProvider>
      </AmbienceProvider>
    </ThemeProvider>
  )
}
