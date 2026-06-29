import { Link } from 'react-router-dom'
import { clusters } from '@/data/categories'
import { totalArticles } from '@/lib/content'
import { Logo } from '@/components/layout/Logo'

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface/40">
      <div className="mx-auto max-w-reading px-4 py-14 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted">
              A knowledge universe you travel rather than browse. Every article is a node on a
              journey through everything we know.
            </p>
            <p className="label mt-6 text-faint">
              {totalArticles} articles · 27 categories · 5 clusters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol title="Explore">
              <FooterLink to="/explore">The Atlas</FooterLink>
              <FooterLink to="/article/ancient-egypt">Ancient Egypt</FooterLink>
              <FooterLink to="/timeline/ancient-egypt">Timelines</FooterLink>
              <FooterLink to="/about">About</FooterLink>
            </FooterCol>

            {clusters.slice(0, 2).map((cluster) => (
              <FooterCol key={cluster.id} title={cluster.name}>
                {cluster.categories.slice(0, 4).map((catId) => (
                  <FooterLink key={catId} to={`/category/${catId}`}>
                    {labelFor(catId)}
                  </FooterLink>
                ))}
              </FooterCol>
            ))}
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} KaalVeda — Explore Everything. Learn Everything.</p>
          <p className="label">Illuminated Manuscript × Star Chart</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-3 text-faint">{title}</p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-muted transition-colors hover:text-gold">
        {children}
      </Link>
    </li>
  )
}

function labelFor(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
