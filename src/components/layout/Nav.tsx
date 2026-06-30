import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Search, Bookmark, Menu, X } from 'lucide-react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useBookmarks } from '@/hooks/useBookmarks'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { AmbienceToggle } from '@/components/layout/AmbienceToggle'
import { SoundToggle } from '@/components/layout/SoundToggle'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

const links = [
  { to: '/explore', label: 'Atlas' },
  { to: '/category/ancient-civilizations', label: 'Categories' },
  { to: '/graph', label: 'Knowledge Map' },
  { to: '/about', label: 'About' },
]

export function Nav() {
  const { openPalette } = useCommandPalette()
  const { count } = useBookmarks()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'glass border-b border-border' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-reading items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'text-gold' : 'text-muted hover:text-fg',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPalette}
            className="hidden items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-3 pr-2 text-sm text-faint transition-colors hover:border-border-strong hover:text-fg sm:flex"
            aria-label="Search"
          >
            <Search size={15} />
            <span className="hidden lg:inline">Search…</span>
            <kbd className="label rounded border border-border px-1.5 py-0.5 text-[0.6rem]">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={openPalette}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-gold sm:hidden"
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          <Link
            to="/explore"
            className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-gold sm:flex"
            aria-label={`Bookmarks (${count})`}
            title={`${count} bookmarked`}
          >
            <Bookmark size={16} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold text-[#1b150a]">
                {count}
              </span>
            )}
          </Link>

          <SoundToggle />

          <AmbienceToggle />

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-gold md:hidden"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="glass border-t border-border md:hidden">
          <div className="mx-auto flex max-w-reading flex-col px-4 py-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    isActive ? 'bg-gold/10 text-gold' : 'text-muted hover:bg-gold/5 hover:text-fg',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
